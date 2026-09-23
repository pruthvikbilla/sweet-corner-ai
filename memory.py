chat_log = []

def record_chat(sender_role: str, text: str):
    chat_log.append({"role": sender_role, "content": text})
    if len(chat_log) > 16:
        chat_log.pop(0)

def retrieve_history():
    return chat_log

def wipe_history():
    chat_log.clear()