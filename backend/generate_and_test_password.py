#!/usr/bin/env python3
"""Generate and test a new password hash"""
import bcrypt

# Simple temporary password
password = "TempPassword2025"

print(f"Generating hash for password: {password}")
print()

# Generate hash
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"Generated hash: {password_hash}")
print()

# Verify it works
result = bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
print(f"Verification test: {result}")

if result:
    print("SUCCESS - Hash verified correctly!")
    print()
    print("=" * 60)
    print("Use this password to log in:")
    print(f"  Username: cameron.thomas@mu-llc.com")
    print(f"  Password: {password}")
    print()
    print("Update users.json with this hash:")
    print(f'  "password_hash": "{password_hash}"')
    print("=" * 60)
else:
    print("ERROR - Hash verification failed!")
