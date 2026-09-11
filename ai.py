import json
from openai import OpenAI
from memory import retrieve_history

llm_client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

def evaluate_user_intent(user_msg):
    from prompts import ROUTER_PROMPT

    res = llm_client.chat.completions.create(
        model="llama3.2:3b",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ROUTER_PROMPT},
            {"role": "user", "content": user_msg}
        ]
    )

    content = res.choices[0].message.content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1]).strip()

    return content

def compose_final_reply(query, product_data):
    if product_data:
        items_summary = "\n\n".join([
            f"• Product Name: {p['product_name']}\n  Category: {p['category']}\n  Price: ₹{p['price']}\n  Weight: {p['weight']}\n  Description: {p['description']}"
            for p in product_data
        ])
        
        prompt = f"""
Customer request: "{query}"

Available Database Products:
{items_summary}

INSTRUCTIONS:
1. ONLY present the exact products listed above.
2. NEVER invent, hallucinate, or suggest any item not present in the Database Products list.
3. List the items clearly with name, price, weight, and description.
"""
        res = llm_client.chat.completions.create(
            model="llama3.2:3b",
            messages=[
                {"role": "system", "content": "You are the counter assistant at Sweet Corner Sweets & Snacks. Present ONLY the provided store inventory accurately."},
                {"role": "user", "content": prompt}
            ]
        )
        return res.choices[0].message.content

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

    res = llm_client.chat.completions.create(
        model="llama3.2:3b",
        messages=messages
    )

    return res.choices[0].message.content