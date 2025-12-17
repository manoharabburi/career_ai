
import sys
import traceback

print("Sys path:", sys.path)

try:
    print("Attempting to import config...")
    import config
    print("Config imported.")
except ImportError:
    traceback.print_exc()

try:
    print("Attempting to import auth (top level)...")
    import auth
    print("Auth imported.")
except ImportError:
    traceback.print_exc()

try:
    print("Attempting to import routers.auth...")
    import routers.auth
    print("routers.auth imported.")
except ImportError:
    traceback.print_exc()
