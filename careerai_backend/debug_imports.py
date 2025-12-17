
try:
    import config
    print("Imported config successfully")
    print(config.settings)
except Exception as e:
    print(f"Failed to import config: {e}")

try:
    from config import settings
    print("Imported settings from config successfully")
except Exception as e:
    print(f"Failed to import settings from config: {e}")

try:
    import jose
    from jose import jwt
    print("Imported jose.jwt successfully")
except Exception as e:
    print(f"Failed to import jose: {e}")

try:
    import passlib
    from passlib.context import CryptContext
    print("Imported passlib successfully")
except Exception as e:
    print(f"Failed to import passlib: {e}")

try:
    import auth
    print("Imported auth successfully")
except Exception as e:
    print(f"Failed to import auth: {e}")
