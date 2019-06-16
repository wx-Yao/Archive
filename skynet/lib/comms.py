import struct

from Crypto import Random
from Crypto.Cipher import AES
from Crypto.Hash import HMAC
from Crypto.Hash import SHA256
from Crypto.Random.Fortuna.FortunaGenerator import AESGenerator as aesg

from dh import create_dh_key, calculate_dh_secret

class StealthConn(object):
    def __init__(self, conn, client=False, server=False, verbose=False):
        self.conn = conn
        self.cipher = None
        self.client = client
        self.server = server
        self.verbose = verbose
        # Note we may need to manually reset the state of the hmac object otherwise it might behave oddly under some circumstances 
        # because it's internally stateful
        self.hmac=None
        self.prng=None
        self.NONCE_LENGTH=24
        self.KEY_LENGTH=24
        self.HMAC_LENGTH=32

        self.initiate_session()

    def initiate_session(self):
        # Perform the initial connection handshake for agreeing on a shared secret 
        my_public_key, my_private_key = create_dh_key()

        # if I'm client. i.e., initialize the connection
        if self.client:
            # Simple rename to improve readability
            client_private_key,client_public_key=my_private_key, my_public_key

            # Send them our public key along with the IV
            IV=Random.new().read(AES.block_size)
            # msg structure: IV+msg
            clientInfo=b"".join([IV,bytes(str(client_public_key),'ascii')])
            self.send(clientInfo)
            # Receive their public key
            server_public_key = int(self.recv())
            # Obtain our shared secret
            shared_hash = calculate_dh_secret(server_public_key, client_private_key)

        # if I'm server. i.e., accept the connection
        elif self.server:
            # Rename
            server_private_key, server_public_key=my_private_key,my_public_key
            # only send them our publick key, let them choose the IV
            self.send(bytes(str(server_public_key),"ascii"))
            clientInfo=self.recv()
            IV=clientInfo[:AES.block_size]
            client_public_key=int(clientInfo[AES.block_size:])
            shared_hash = calculate_dh_secret(client_public_key, server_private_key)
        else:
            raise AttributeError("You have to be either a server or a client")

        # After the shared hash is obtained, we do three things: 
        # 1. Derive AES key from it
        # 2. Generate HMAC with AES key
        # 3. Generate a PRNG using key as seed
        # As we are confident that the DH algorithm will protect the shared hash, we believe the key won't be compromised.
        key=shared_hash[:self.KEY_LENGTH]
        self.cipher=AES.new(key,AES.MODE_CFB,IV)
        self.hmac=HMAC.new(bytes(key,'ascii'),digestmod=SHA256.new()) # we use SHA256 here
        self.prng=aesg()
        self.prng.reseed(bytes(key,'ascii'))
        print("session initialized")

    # We use decorator here to ensure the original send() remain (mostly) as is
    def _appendMetadata(send):
        def wrapper(self,*args):
            data=args[0]
            if self.hmac:
                # Keep the original HMAC object clean
                hmac=self.hmac.copy()
                hmac.update(data)
                mac=hmac.digest()
                data=b"".join([data,mac])
                # we use 24 bytes nonce to make sure it's not too short
                nonce=self.prng.pseudo_random_data(self.NONCE_LENGTH)
                data=b"".join([data,nonce])
                # Original data: "data"
                # Sent data: "data+mac(32 bytes)+nonce(24 bytes)"
                send(self,data)
            else:
                send(self,data)
        return wrapper
    
    # append metadata of the message (MAC and Nonce) to the end of data before encrypting and sending
    @_appendMetadata
    def send(self, data):
        if self.cipher:
            # we need new IV for each message as we're using CFB mode
            IV=Random.new().read(AES.block_size)
            self.cipher.IV=IV
            encrypted_data = self.cipher.encrypt(data)
            # But the IV cannot be sent encrypted otherwise the other side cannnot decrypt
            encrypted_data=b"".join([IV,encrypted_data])
            if self.verbose:
                print("Original data: {}".format(data))
                print("Encrypted data: {}".format(repr(encrypted_data)))
                print("Sending packet of length {}".format(len(encrypted_data)))
                print("-"*15)
        else:
            encrypted_data = data

        # Encode the data's length into an unsigned two byte int ('H')
        pkt_len = struct.pack('H', len(encrypted_data))
        self.conn.sendall(pkt_len)
        self.conn.sendall(encrypted_data)
        return None

    def recv(self):
        # Decode the data's length from an unsigned two byte int ('H')
        pkt_len_packed = self.conn.recv(struct.calcsize('H'))
        unpacked_contents = struct.unpack('H', pkt_len_packed)
        pkt_len = unpacked_contents[0]

        encrypted_data = self.conn.recv(pkt_len)

        # Below we perform metadata checking. While we use decorator on send() we can't use it on recv() 
        # because decryption happens BEFORE the metadata extraction
        if self.cipher:
            # extract IV
            IV=encrypted_data[:AES.block_size]
            encrypted_data=encrypted_data[AES.block_size:]
            self.cipher.IV=IV
            # now we can decrypt
            data = self.cipher.decrypt(encrypted_data)
            # extract nonce
            nonce=data[-self.NONCE_LENGTH:]
            data=data[:-self.NONCE_LENGTH]
            # extract MAC
            mac=data[-self.HMAC_LENGTH:]
            # extract real "data"
            data=data[:-self.HMAC_LENGTH]
            hmac=self.hmac.copy()
            hmac.update(data)
            # Checking MAC
            if mac!=hmac.digest():
                raise ValueError("Warning! This msg is tampered: {}".format(originalData.decode("ascii")))

            # Checking nonce
            if self.prng.pseudo_random_data(self.NONCE_LENGTH) != nonce:
                raise ValueError("Connection is compromised (MITM attack)")
            
            if self.verbose:
                print("Receiving packet of length {}".format(pkt_len))
                print("Encrypted data: {}".format(repr(encrypted_data)))
                print("Original data: {}".format(data))
                print("-"*15)
        else:
            data = encrypted_data
        # I didn't see any point here using data.strip() except causing crashes. Hence it's removed
        return data


    def close(self):
        self.conn.close()
