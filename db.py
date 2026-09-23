import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGO_URI)

# Database and collection
db = client["b2b_supplies_db"]
products_col = db["products"]

def get_products_collection():
    return products_col