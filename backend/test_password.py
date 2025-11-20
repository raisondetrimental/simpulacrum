#!/usr/bin/env python3
"""Test password hash verification"""
import bcrypt

password = "TempPassword2025"
hash_from_file = "$2b$12$xKI3RixX3fcUpSleG.sYlukBelIWUIKvvs9PZS/AgVb.bVuv5cpN2"

print(f"Testing password: {password}")
print(f"Against hash: {hash_from_file}")
print()

result = bcrypt.checkpw(password.encode('utf-8'), hash_from_file.encode('utf-8'))
print(f"Password verification result: {result}")

if result:
    print("✓ Password MATCHES hash")
else:
    print("✗ Password DOES NOT match hash")
