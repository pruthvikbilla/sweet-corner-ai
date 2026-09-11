import mysql.connector

def connect_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="pruthvik@231",
        database="sweet_corner_db"
    )