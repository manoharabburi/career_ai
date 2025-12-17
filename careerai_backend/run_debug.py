
import sys
import traceback

print("Starting wrapper...")
try:
    # We must add current directory to sys.path to simulate running from here
    sys.path.insert(0, ".")
    import main
    print("Main imported successfully.")
except Exception:
    print("Caught exception during import.")
    with open("full_error.txt", "w") as f:
        traceback.print_exc(file=f)
    print("Error written to full_error.txt")
