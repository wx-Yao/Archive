# We're using Python's builtin random
# NOTE: This is not cryptographically strong

# replace the builtin random with a more secure one (more "random" one)
from Crypto.Random import random
import string

def read_hex(data):
    # Remove any spaces or newlines
    data = data.replace(" ", "").replace("\n", "")
    # Read the value as an integer from base 16 (hex)
    # Or say,
    # convert hex number to decimal number
    return int(data, 16)

def generate_random_string(alphabet=None, length=8, exact=False):
    if not alphabet:
        alphabet = string.ascii_letters + string.digits
    if not exact:
        length = random.randint(length-10 if length-10 > 0 else 1,length+10)
    return ''.join(random.choice(alphabet) for x in range(length))
