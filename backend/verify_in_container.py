import bcrypt
import json
from pathlib import Path

# Read the users file
with open('/app/data/json/users.json', 'r') as f:
    data = json.load(f)

# Get Cameron's user record
cameron = next((u for u in data['users'] if u['username'] == 'cameron.thomas@mu-llc.com'), None)

if not cameron:
    print("ERROR: User not found")
    exit(1)

print(f"Username: {cameron['username']}")
print(f"Password hash from file: {cameron['password_hash']}")
print()

# Test password
test_password = "TempPassword2025"
print(f"Testing password: {test_password}")

try:
    result = bcrypt.checkpw(test_password.encode('utf-8'), cameron['password_hash'].encode('utf-8'))
    print(f"Verification result: {result}")

    if result:
        print("SUCCESS - Password matches!")
    else:
        print("FAILURE - Password does not match")

except Exception as e:
    print(f"ERROR during verification: {e}")
