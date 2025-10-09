# Token, settings, env vars
import os
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

# --- Essential Bot Settings ---
# It's best practice to keep the token here
BOT_TOKEN: str = os.environ.get("TELEGRAM_BOT_TOKEN", "8162743154:AAGkPzf-_vleLe2ohrsLSe34TrRNkHondIE")

# --- Django API Settings ---
DJANGO_API_BASE_URL: str = os.environ.get("DJANGO_API_BASE_URL", "http://127.0.0.1:8000/api1")

WEBAPP_BASE_URL: str = os.environ.get('WEBAPP_BASE_URL', 'http://127.0.0.1:8000')

BOT_USERNAME = "bot0"  
BOT_PASSWORD = "1234" 
# --- Other Bot Settings ---
# Example for future FSM storage:
# REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
