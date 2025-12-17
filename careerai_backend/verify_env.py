
from dotenv import load_dotenv
import os

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
print(f"Loaded Key: {key}")
if key == "AIzaSyCvGwgLTBfafPl0BxTExci9wGlIpIB3MHE":
    print("WARNING: This appears to be the default/placeholder key!")
else:
    print("Key appears to be custom.")
