"""
Centralized authentication helper functions for all handlers.
Import these in any handler that needs auth operations.
"""

import aiohttp
import logging
from aiogram import types
from ..config import DJANGO_API_BASE_URL
from .token_fetcher import get_valid_access_token

logger = logging.getLogger(__name__)

TOKEN_URL = f"{DJANGO_API_BASE_URL}/users/token/"
TELEGRAM_PROFILES_URL = f"{DJANGO_API_BASE_URL}/telegram-profiles/"
TOKEN_BY_TELEGRAM_URL = f"{TELEGRAM_PROFILES_URL}token_by_telegram/"


async def get_token_by_telegram(session: aiohttp.ClientSession, telegram_id: int):
    """Try to get JWT tokens by Telegram ID (if already linked)."""
    access_token = await get_valid_access_token()
    if not access_token:
        return None
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        async with session.post(TOKEN_BY_TELEGRAM_URL, json={"telegram_id": telegram_id}, headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("access")
    except Exception as e:
        logger.error(f"get_token_by_telegram failed: {e}")
    return None


async def get_access_token(session: aiohttp.ClientSession, username: str, password: str):
    """Authenticate user and return access token, or None."""
    payload = {"username": username, "password": password}
    try:
        async with session.post(TOKEN_URL, json=payload) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get("access")
    except Exception as e:
        logger.error(f"get_access_token failed: {e}")
    return None


async def sync_telegram_profile(session: aiohttp.ClientSession, access_token: str, tg_user: types.User):
    """Create or update Telegram profile via API."""
    headers = {"Authorization": f"Bearer {access_token}"}
    data = {"telegram_id": tg_user.id, "username": tg_user.username or ""}

    try:
        async with session.get(f"{TELEGRAM_PROFILES_URL}?telegram_id={tg_user.id}", headers=headers) as resp:
            if resp.status != 200:
                return False

            profiles = await resp.json()
            if profiles:
                profile_id = profiles[0]["id"]
                async with session.patch(f"{TELEGRAM_PROFILES_URL}{profile_id}/", headers=headers, json=data) as patch:
                    return patch.status in (200, 204)
            else:
                async with session.post(TELEGRAM_PROFILES_URL, headers=headers, json=data) as post:
                    return post.status in (200, 201)
    except Exception as e:
        logger.error(f"sync_telegram_profile failed: {e}")
    return False


async def delete_telegram_profile(session: aiohttp.ClientSession, telegram_id: int):
    """Delete Telegram profile link (logout)."""
    access_token = await get_valid_access_token()
    if not access_token:
        return False
    
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        async with session.get(f"{TELEGRAM_PROFILES_URL}?telegram_id={telegram_id}", headers=headers) as resp:
            if resp.status == 200:
                profiles = await resp.json()
                if profiles:
                    profile_id = profiles[0]["id"]
                    async with session.delete(f"{TELEGRAM_PROFILES_URL}{profile_id}/", headers=headers) as del_resp:
                        return del_resp.status in (200, 204)
    except Exception as e:
        logger.error(f"delete_telegram_profile failed: {e}")
    return False


async def get_user_profile(session: aiohttp.ClientSession, access_token: str):
    """Fetch user profile data from API."""
    headers = {"Authorization": f"Bearer {access_token}"}
    user_url = f"{DJANGO_API_BASE_URL}/users/me/"
    try:
        async with session.get(user_url, headers=headers) as resp:
            if resp.status == 200:
                return await resp.json()
    except Exception as e:
        logger.error(f"get_user_profile failed: {e}")
    return None


async def is_user_logged_in(session: aiohttp.ClientSession, telegram_id: int) -> bool:
    """Check if user is logged in."""
    token = await get_token_by_telegram(session, telegram_id)
    return token is not None