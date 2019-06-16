# Skynet (simplified bot net)

# Intro

This is a project that focuses on understanding a simplified version of the real-world bot network communication model. In this model, we assume there's a master bot controlling multiple slave bots. The master is capable of signing files with private key and the bots can verify the signature with public key. It can also view the encrypted file uploaded by its slave bots. The slave bots are much more straightforward. They're capable of talking to each other, and downloading/uploading data from/to specific "central database".

This project aims to implement the above communication protocol securely and fulfill those functionalities. The security instead of code design etc is the key.

Specifically, this is a very simplified communication model which has many obvious problems in its nature. e.g., using public key infrastructure without CA. But as I said the focus is to understand the cryptography building blocks and to connect those dots. The botnets in the real world aren't definitely like this.



# Disclaimer

1. I didn't write the whole stuff. My work only involves the core communication model and all the crypto building blocks and the rest are provided as a framework.

2. Though I don't think anyone will be stupid enough to use this toy to do nasty things, this project is for learning purpose ONLY.

# Demo

The GIF may not reveal many details under the hood. Technically, the peer-to-peer communication between bots are encrypted with AES-192 with CFB block operation. The key exchange is implemented with Diffie-Hellman algorithm (prime is 8192bit according to RCF3526). The hashing is SHA256 across the whole protocol. In the public key infrastructure, the key pair is created with RSA-4096 algorithm and the signature/verification is conducted in PKCS1\_PSS variation. Selecting and implementing those specifications are the true gaol of this project. Don't be so harsh even if there're some trivial problems.

## Peer-to-Peer Echoing

![awaiting gif...](https://user-images.githubusercontent.com/20643897/59560581-f6485200-9057-11e9-856b-419773032512.gif)

## Master signing file and bots reading it


![awaiting gif...](https://user-images.githubusercontent.com/20643897/59561365-d5392e80-9062-11e9-8bb6-a468acbabac1.gif)

## Slave bots harvesting and uploading

![awaiting gif...](https://user-images.githubusercontent.com/20643897/59560605-50e1ae00-9058-11e9-955f-78d5b234dec6.gif)
