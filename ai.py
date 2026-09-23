import os
from groq import Groq
from dotenv import load_dotenv
from memory import retrieve_history
from prompts import ROUTER_PROMPT

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = "openai/gpt-oss-120b"

def evaluate_user_intent(user_msg: str) -> str:
    chat_completion = client.chat.completions.create(
        model=MODEL_NAME,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ROUTER_PROMPT},
            {"role": "user", "content": user_msg}
        ]
    )

    content = chat_completion.choices[0].message.content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1]).strip()

    return content

def compose_final_reply(query: str, product_data: list) -> str:
    if product_data:
        prompt = f"""
User query: "{query}"
Found {len(product_data)} matching institutional supplies in our catalog.

INSTRUCTIONS:
Generate a single, complete, professional sentence introducing these supplies (e.g., "Here are our hospital-grade bedding and linen options:" or "Here are the medical uniforms matching your requirement:").
DO NOT list the product names, specifications, or prices in text; the UI product cards display all of those details.
"""
        chat_completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are a professional B2B medical and hospitality supply coordinator. Respond in exactly 1 complete, concise sentence."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )
        return chat_completion.choices[0].message.content.strip()

    history = retrieve_history()

    system_prompt = """
You are the sales coordinator for an institutional healthcare, hospitality, and school supplies manufacturer.

BEHAVIOR RULES:
1. Greet visitors warmly and offer assistance with bulk purchasing, tender RFQs, hospital linens, scrubs, patient gowns, or clinical equipment.
2. DO NOT fabricate product names, prices, or technical specifications.
3. If no catalog items match a query, say: "We do not have catalog items matching those exact specifications, but custom bulk manufacturing is available on request."
"""

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": query})

    chat_completion = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages
    )

    return chat_completion.choices[0].message.content.strip()