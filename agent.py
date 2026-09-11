import json
from ai import evaluate_user_intent, compose_final_reply
from memory import record_chat
from tools import search_products

tool_map = {
    "search_products": search_products
}

def process_query(user_text):
    record_chat("user", user_text)

    try:
        raw_decision = evaluate_user_intent(user_text)
        action = json.loads(raw_decision)
    except Exception as err:
        print("Intent classification error:", err)
        action = {"name": "general_chat", "parameters": {}}

    tool_name = action.get("name")
    args = action.get("parameters", {})

    items = []

    if tool_name in tool_map:
        func = tool_map[tool_name]
        try:
            items = func(**args) if isinstance(args, dict) else func()
        except Exception as db_err:
            print("Database query failed:", db_err)
            return {
                "reply": "We are experiencing a temporary system glitch fetching items. Please try again shortly.",
                "products": []
            }

    output = compose_final_reply(user_text, items)
    record_chat("assistant", output)

    return {
        "reply": output,
        "products": items or []
    }