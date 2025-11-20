#!/usr/bin/env python3
"""
Quick password reset script for local development
Generates a new bcrypt hash for a password
"""
import bcrypt
import getpass

def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

if __name__ == '__main__':
    print("=== Password Hash Generator ===")
    print()
    password = getpass.getpass("Enter new password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("ERROR: Passwords don't match!")
        exit(1)

    if len(password) < 8:
        print("ERROR: Password must be at least 8 characters!")
        exit(1)

    password_hash = hash_password(password)

    print()
    print("=== Password Hash Generated ===")
    print()
    print("Copy this hash to replace the password_hash field for cameron.thomas@mu-llc.com in data/json/users.json:")
    print()
    print(password_hash)
    print()
    print("Then rebuild and redeploy the Docker image.")
