from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import process_query
from memory import wipe_history
from tools import get_product_by_id

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

@app.get("/api/products/{product_id}")
def fetch_product(product_id: int):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/reset")
def reset_session():
    wipe_history()
    return {"status": "cleared"}