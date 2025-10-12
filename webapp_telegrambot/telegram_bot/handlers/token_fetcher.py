import aiohttp
import logging
from typing import Optional
from datetime import datetime, timedelta
from ..config import BOT_USERNAME, BOT_PASSWORD, DJANGO_API_BASE_URL


logger = logging.getLogger(__name__)

# --- Configuration ---
TOKEN_ENDPOINT = f"{DJANGO_API_BASE_URL}/users/token/"

# --- Simple Global Token Cache ---
# Global variables to store the current token and its expiration time
CACHED_ACCESS_TOKEN: Optional[str] = None
TOKEN_EXPIRES_AT: datetime = datetime.min # Use a minimum time to force initial fetch

# --- Time buffer for proactive renewal (e.g., renew 30 seconds before actual expiration) ---
RENEWAL_BUFFER_SECONDS = 30 

async def fetch_new_access_token() -> Optional[str]:
    """
    Requests a NEW JWT access token from the Simple JWT endpoint.
    This is the core function called by get_valid_access_token().
    """
    global CACHED_ACCESS_TOKEN, TOKEN_EXPIRES_AT

    # Prepare the credentials payload
    credentials = {"username": BOT_USERNAME, "password": BOT_PASSWORD}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(TOKEN_ENDPOINT, json=credentials, timeout=10) as response:
                if response.status == 200:
                    data = await response.json()
                    access_token = data.get("access")
                    
                    if access_token:
                        # Assuming your token expiration is 5 minutes (300 seconds) by default
                        # If your SimpleJWT settings use a different expiration, adjust this timedelta.
                        TOKEN_LIFESPAN = 300 
                        
                        CACHED_ACCESS_TOKEN = access_token
                        TOKEN_EXPIRES_AT = datetime.now() + timedelta(seconds=TOKEN_LIFESPAN)
                        
                        logger.info("New JWT access token successfully fetched and cached.")
                        return access_token
                    else:
                        logger.error("Token endpoint returned 200, but 'access' token field is missing.")
                        return None
                else:
                    logger.error(f"Failed to authenticate. Status: {response.status}. Response: {await response.text()}")
                    return None

    except aiohttp.ClientConnectorError:
        logger.error("Connection error: Could not connect to the token endpoint.")
        return None
    except Exception as e:
        logger.error(f"Error during token request: {e}", exc_info=True)
        return None

async def get_valid_access_token() -> Optional[str]:
    """
    Returns the cached token if valid, otherwise fetches a new one.
    """
    global CACHED_ACCESS_TOKEN, TOKEN_EXPIRES_AT

    # 1. Check if the token is present AND not expired (with buffer)
    if CACHED_ACCESS_TOKEN and (datetime.now() < TOKEN_EXPIRES_AT - timedelta(seconds=RENEWAL_BUFFER_SECONDS)):
        logger.debug("Using cached JWT token.")
        return CACHED_ACCESS_TOKEN

    # 2. Token is missing or expired (or nearing expiration) -> Fetch a new one
    logger.info("JWT token expired or missing. Fetching new token...")
    return await fetch_new_access_token()