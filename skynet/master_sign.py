import os
import sys

# We use PKCS specified RSA signature algorithm as specified in requirement
from Crypto.PublicKey import RSA
# And the version we choose is PKCS1_PSS variation
from Crypto.Signature import PKCS1_PSS as pss
from Crypto.Hash import SHA256

def keyGen():
    key=RSA.generate(4096)
    public=key.publickey().exportKey()
    private=key.exportKey(pkcs=8)
    with open("masterkey",'wb') as f:
        f.write(private)
    with open("masterkey.pub",'wb') as f:
        f.write(public)
    return None 

def sign_file(content):
    assert isinstance(content,bytes),"Pleae provide content in bytes"

    with open("masterkey",'rb') as f:
        privateKey=RSA.importKey(f.read())

    # Calculate file hash object
    mac=SHA256.new()
    mac.update(content)
    
    # Create signature of the file hash
    signer=pss.new(privateKey)
    signature=signer.sign(mac)

    # Concatenate
    signedByte=b"".join([signature,content])
    return signedByte

if __name__ == "__main__":
    if not os.path.exists("masterkey") or not os.path.exists("masterkey.pub"):
        print("Master couldn't find his key pair and is generating one...(might take a while)")
        keyGen()
    fileName = input("Which file in pastebot.net should be signed? ")
    fileName=os.path.join("pastebot.net",fileName)
    try:
        with open(fileName,'rb') as f:
            signed=sign_file(f.read())
        signed_fn="".join([fileName,".signed"])
        with open(signed_fn,'wb') as f:
            f.write(signed)
        print("Signed file written to {}".format(signed_fn))
    except FileNotFoundError:
        print("File {} not found in pastebot.net".format(fileName))
        sys.exit(1)
