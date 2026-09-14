import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Standard options currently active on Groq
candidates = [
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
    "qwen-2.5-32b",
    "deepseek-r1-distill-llama-70b"
]

working_model = None

for model in candidates:
    try:
        print(f"Testing '{model}'...")
        res = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "hello"}],
            max_tokens=10
        )
        print(f"SUCCESS! Using model: {model}")
        working_model = model
        break
    except Exception as e:
        print(f"Unavailable: {model}")

print("\n--- RESULT ---")
if working_model:
    print(f"Set MODEL_NAME = '{working_model}' in your ai.py")
else:
    print("Check your API key permissions on https://console.groq.com")