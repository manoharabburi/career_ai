
import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Fallback to the known key if env load fails (just for this debug script)
    api_key = "AIzaSyDUXeR02MVIInenqEm5Ok3wNJkO_3WTf0"

print(f"Using Key: {api_key[:10]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json().get('models', [])
        with open("available_models.txt", "w") as f:
            f.write(f"Found {len(models)} models.\n")
            for m in models:
                if 'generateContent' in m.get('supportedGenerationMethods', []):
                    f.write(f"{m['name']}\n")
        print("Done writing models.")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Exception: {e}")
