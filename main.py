from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import process_query
from memory import wipe_history

app = FastAPI(title="Sweet Corner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatPayload(BaseModel):
    message: str

@app.get("/")
def health_check():
    return {"status": "online", "store": "Sweet Corner Assistant API"}

@app.post("/api/chat")
def handle_chat(payload: ChatPayload):
    user_input = payload.message.strip()
    if not user_input:
        return {
            "reply": "Please tell me what sweets or snacks you are looking for!",
            "products": []
        }

    result = process_query(user_input)
    return result

@app.post("/api/reset")
def reset_session():
    wipe_history()
    return {"status": "cleared"}