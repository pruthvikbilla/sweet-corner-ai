import os
import json
from groq import Groq
from dotenv import load_dotenv
from memory import retrieve_history

# 1. Load the secret API key from the .env file
load_dotenv()

# 2. Connect to Groq Cloud
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Ultra-fast model from Groq
MODEL_NAME = "openai/gpt-oss-120b"

def evaluate_user_intent(user_msg):
    from prompts import ROUTER_PROMPT

    # Ask Groq to extract search filters as JSON
    chat_completion = client.chat.completions.create(
        model=MODEL_NAME,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ROUTER_PROMPT},
            {"role": "user", "content": user_msg}
        ]
    )

    content = chat_completion.choices[0].message.content.strip()
    
    # Strip any markdown formatting if present
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1]).strip()

    return content

def compose_final_reply(query, product_data):
    if product_data:
        # Ask LLM for ONLY a friendly, 1-sentence conversational lead-in
        prompt = f"""
User query: "{query}"
Found {len(product_data)} matching items from our store database.

INSTRUCTIONS:
Generate a single, friendly sentence introducing these results (e.g., "Here are the dry fruit sweets under ₹450 available at our counter:" or "Here is what we have on our menu today:").
DO NOT list the product names, prices, weights, or details. The visual product cards will display all the specifics.
"""
        chat_completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are the friendly front counter assistant at Sweet Corner Sweets & Snacks. Keep introductory responses to exactly 1 concise sentence."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=60
        )
        return chat_completion.choices[0].message.content.strip()

    # Fallback for greetings or when 0 items match
    history = retrieve_history()

    system_prompt = """
You are the friendly counter assistant at Sweet Corner Sweets & Snacks.

BEHAVIOR RULES:
1. For greetings (hi, hello, hey), offer a warm welcome and invite them to explore our traditional sweets, baklavas, and namkeens.
2. DO NOT invent or name specific product prices or menu items during general greetings.
3. If the user searched for something specific and no products were found, say: "Apologies, we don't have items matching that specific criteria in our counter right now."
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": query})

    chat_completion = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages
    )

    return chat_completion.choices[0].message.content