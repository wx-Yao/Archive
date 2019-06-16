# it's more standard to use sys.exit() instead of os.exit() as the former one handles cleanup handlers and other resources
# Plus, it should be os._exit() if used
import sys
import os

from Crypto.PublicKey import RSA
from Crypto.Cipher import AES
from Crypto.Cipher import PKCS1_OAEP as pkcsoa


def decrypt_valuables(data):
    assert isinstance(data,bytes)
    # extraction
    IV,encrypted_key,encrypted_data=data[:16],data[16:528],data[528:]
    # revert AES key
    with open("masterkey",'rb') as f:
        privateKey=RSA.importKey(f.read())
    decrypter=pkcsoa.new(privateKey)
    try:
        key=decrypter.decrypt(encrypted_key)
    except ValueError:
        print("Fail to decrypt. Maybe you're viewing an signed file or it's not encrypted with your current pub key.")
        return None

    # revert data
    cipher=AES.new(key,AES.MODE_CFB,IV)
    data=cipher.decrypt(encrypted_data)

    print(data.decode('ascii'))
    return None

if __name__ == "__main__":
    fileName= input("Which file in pastebot.net does the botnet master want to view? ")
    if not os.path.exists("masterkey"):
        print("No master key found. Opps you lost the valuables..")
        sys.exit(1)
    try:
        with open(os.path.join("pastebot.net",fileName),'rb') as f:
            data=f.read()
            decrypt_valuables(data)
    except FileNotFoundError:
        print("File '{}' not found in pastebot.net".format(fileName))
