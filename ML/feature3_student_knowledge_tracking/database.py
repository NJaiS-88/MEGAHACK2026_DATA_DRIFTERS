from pymongo import MongoClient
from urllib.parse import urlparse
from .config import settings

# Diagnostic: Verify URI in database.py
masked_uri = str(settings.MONGODB_URI)
if "@" in masked_uri:
    parts = masked_uri.split("@")
    host_part = parts[1]
    user_part = parts[0].split("://")[-1].split(":")[0]
    masked_uri = f"mongodb+srv://{user_part}:****@{host_part}"
print(f"[Database] Initializing MongoClient with URI: {masked_uri}")
print(f"[Database] Using database name: '{settings.MONGO_DB_NAME}' (all collections will be in this database)")

# Parse URI to remove any database name from the path
# MongoDB URI format: mongodb+srv://user:pass@host/database?options
parsed_uri = urlparse(settings.MONGODB_URI)
clean_uri = settings.MONGODB_URI

# Remove database name from URI path if present (we'll use the configured name instead)
if parsed_uri.path and parsed_uri.path != '/':
    # Path format: /database_name or /database_name?options
    path_parts = parsed_uri.path.split('/')
    if len(path_parts) > 1 and path_parts[1]:
        # Database name is in the path - remove it
        db_name_in_uri = path_parts[1].split('?')[0]  # Remove query params
        if db_name_in_uri != settings.MONGO_DB_NAME:
            print(f"[Database] Removing database name '{db_name_in_uri}' from URI path, will use '{settings.MONGO_DB_NAME}' instead")
            # Reconstruct URI without database name in path
            scheme = parsed_uri.scheme
            netloc = parsed_uri.netloc
            query = parsed_uri.query
            fragment = parsed_uri.fragment
            # Keep only query params, remove database from path
            clean_path = '/' if not query else f'/?{query}'
            clean_uri = f"{scheme}://{netloc}{clean_path}"
            if fragment:
                clean_uri += f"#{fragment}"

# Connect to MongoDB
client = MongoClient(clean_uri)

# Always use the configured database name (megahack)
db = client[settings.MONGO_DB_NAME]
print(f"[Database] Connected to database: '{db.name}'")

# Collections
concepts_collection = db["concepts"]
questions_collection = db["questions"]
student_attempts_collection = db["student_attempts"]
student_knowledge_collection = db["student_knowledge"]
