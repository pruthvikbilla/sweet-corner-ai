from db import connect_db

def search_products(
    category=None,
    keyword=None,
    min_price=None,
    max_price=None,
    in_stock_only=True,
    sort_by="name",
    limit=15
):
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT p.product_id, p.product_name, c.category_name AS category, p.price, p.weight, p.stock, p.description, p.image_url
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE 1=1
    """
    params = []

    if category:
        query += " AND c.category_name = %s"
        params.append(category)

    if keyword:
        query += " AND (p.product_name LIKE %s OR p.description LIKE %s)"
        params.extend([f"%{keyword}%", f"%{keyword}%"])

    if min_price is not None:
        query += " AND p.price >= %s"
        params.append(min_price)

    if max_price is not None:
        query += " AND p.price <= %s"
        params.append(max_price)

    if in_stock_only:
        query += " AND p.stock > 0"

    sort_mapping = {
        "price_asc": "p.price ASC",
        "price_desc": "p.price DESC",
        "name": "p.product_name ASC"
    }
    query += f" ORDER BY {sort_mapping.get(sort_by, 'p.product_name ASC')} LIMIT %s"
    params.append(limit)

    cursor.execute(query, tuple(params))
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return items

def get_product_by_id(product_id: int):
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    sql = """
        SELECT p.product_id, p.product_name, c.category_name AS category, p.price, p.weight, p.stock, p.description, p.image_url
        FROM products p
        JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = %s
    """
    cursor.execute(sql, (product_id,))
    item = cursor.fetchone()
    cursor.close()
    conn.close()
    return item