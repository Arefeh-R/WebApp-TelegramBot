from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
import aiohttp
import logging
from config import  DJANGO_API_BASE_URL
from .token_fetcher import get_valid_access_token

router = Router()
logger = logging.getLogger(__name__)

# API endpoints
TOKEN_URL = f"{DJANGO_API_BASE_URL}/users/token/"
TELEGRAM_PROFILES_URL = f"{DJANGO_API_BASE_URL}/telegram-profiles/"
TOKEN_BY_TELEGRAM_URL = f"{TELEGRAM_PROFILES_URL}token_by_telegram/"

class LoginStates(StatesGroup):
    username = State()
    password = State()


@router.message(Command("login"))
async def login_command(message: types.Message, state: FSMContext):
    """Start login — first check if telegram_id is already linked."""
    telegram_id = message.from_user.id
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if token:
            await message.answer("✅ You are already logged in!")
            return

    # Not linked → ask for username/password
    await state.set_state(LoginStates.username)
    await message.answer("👤 Enter your username:")


@router.message(LoginStates.username)
async def get_username(message: types.Message, state: FSMContext):
    await state.update_data(username=message.text)
    await state.set_state(LoginStates.password)
    await message.answer("🔒 Now enter your password:")


@router.message(LoginStates.password)
async def get_password(message: types.Message, state: FSMContext):
    data = await state.get_data()
    username = data["username"]
    password = message.text
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        # Step 1: Get JWT using username/password
        token = await get_access_token(session, username, password)
        if not token:
            await message.answer("❌ Invalid credentials. Please try again or register first.")
            await state.clear()
            return

        # Step 2: Create or update Telegram profile
        success = await sync_telegram_profile(session, token, message.from_user)
        if success:
            await message.answer("✅ Login successful and Telegram profile linked!")
        else:
            await message.answer("⚠️ Logged in, but could not link Telegram profile.")

    await state.clear()


async def get_token_by_telegram(session: aiohttp.ClientSession, telegram_id: int):
    """Try to get JWT tokens by Telegram ID (if already linked)."""
    access_token = await get_valid_access_token()
    if not access_token:
        return None
    headers = {
    "Authorization": f"Bearer {access_token}"
    }
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
    async with session.post(TOKEN_URL, json=payload) as resp:
        if resp.status == 200:
            data = await resp.json()
            return data.get("access")
    return None


async def sync_telegram_profile(session: aiohttp.ClientSession, access_token: str, tg_user: types.User):
    """Create or update Telegram profile via API."""
    headers = {"Authorization": f"Bearer {access_token}"}
    data = {"telegram_id": tg_user.id, "username": tg_user.username or ""}

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
