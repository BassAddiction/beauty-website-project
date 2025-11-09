import bcrypt

# The hash from the database
stored_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYGZZjYZj5e"
password = "admin123"

# Convert to bytes
password_bytes = password.encode('utf-8')
stored_hash_bytes = stored_hash.encode('utf-8')

# Verify the password
if bcrypt.checkpw(password_bytes, stored_hash_bytes):
    print("MATCH")
else:
    # Generate a new hash
    new_hash = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    print(new_hash.decode('utf-8'))
