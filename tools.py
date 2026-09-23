import re
from bson import ObjectId
from db import get_products_collection

def serialize_doc(doc):
    """Converts MongoDB BSON ObjectId to a plain string for JSON API responses"""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def search_products(
    industry=None,
    category=None,
    keyword=None,
    color=None,
    limit=15
):
    col = get_products_collection()
    query = {}

    # 1. Filter by Industry (Healthcare, Hospitality, Schools)
    if industry:
        query["industries"] = {"$regex": industry, "$options": "i"}

    # 2. Filter by Category (Bedding, Uniforms, Gowns, Medical Equiptment & Supplies, etc.)
    if category:
        query["category"] = {"$regex": category, "$options": "i"}

    # 3. Filter by Keyword in Product Name or Description
    if keyword:
        regex_pattern = re.compile(re.escape(keyword), re.IGNORECASE)
        query["$or"] = [
            {"product_name": {"$regex": regex_pattern}},
            {"description": {"$regex": regex_pattern}}
        ]

    # 4. Filter by Color
    if color:
        query["colors"] = {"$regex": color, "$options": "i"}

    cursor = col.find(query).limit(limit)
    items = [serialize_doc(doc) for doc in cursor]
    return items

def get_product_by_id(product_id: str):
    col = get_products_collection()
    try:
        # Search by MongoDB ObjectId
        doc = col.find_one({"_id": ObjectId(product_id)})
        return serialize_doc(doc)
    except Exception:
        # Fallback search by product code string
        doc = col.find_one({"product_code": product_id})
        return serialize_doc(doc)