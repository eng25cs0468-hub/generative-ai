from pymongo import MongoClient
from backend.config import MONGO_URI, DB_NAME

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    queries_collection = db["queries"]
    sales_collection = db["sales_data"]

    # Test connection
    client.admin.command('ping')
    print("Connected to MongoDB Atlas")

except Exception as e:
    print("MongoDB ERROR:", e)
    queries_collection = None
    sales_collection = None