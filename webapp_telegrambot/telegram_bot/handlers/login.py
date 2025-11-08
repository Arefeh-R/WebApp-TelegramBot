from aiogram import Router, types, F
from aiogram.filters import Command
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
import aiohttp
import logging
from aiogram.types import CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from ..keyboards.main_menu import get_account_menu
from ..utils.auth_helper import (
    get_token_by_telegram,
    get_access_token,
    sync_telegram_profile,
    delete_telegram_profile,
    get_user_profile,
)

router = Router()
logger = logging.getLogger(__name__)


class LoginStates(StatesGroup):
    username = State()
    password = State()


# ============= ACCOUNT MENU HANDLERS =============
@router.callback_query(F.data == "menu_account")
async def show_account_menu(callback: CallbackQuery):
    """Show account menu"""
    telegram_id = callback.from_user.id
    
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        
    if token:
        text = "✅ شما وارد سیستم شده‌اید.\nگزینه مورد نظر را انتخاب کنید:"
    else:
        text = "⚠️ شما وارد سیستم نشده‌اید.\nلطفاً ابتدا وارد شوید:"
    
    await callback.message.edit_text(text, reply_markup=get_account_menu())
    await callback.answer()


@router.callback_query(F.data == "account_status")
async def show_account_status(callback: CallbackQuery):
    """Show user account status"""
    telegram_id = callback.from_user.id
    
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        
        if not token:
            text = "⚠️ شما وارد سیستم نشده‌اید."
        else:
            user_data = await get_user_profile(session, token)
            if user_data:
                username = user_data.get("username", "نامشخص")
                email = user_data.get("email", "نامشخص")
                full_name = user_data.get("full_name", "نامشخص")
                text = (
                    "👤 <b>وضعیت حساب</b>\n\n"
                    f"<b>نام کاربری:</b> {username}\n"
                    f"<b>نام کامل:</b> {full_name}\n"
                    f"<b>ایمیل:</b> {email}\n"
                    f"<b>وضعیت:</b> ✅ وارد شده"
                )
            else:
                text = "⚠️ خطا در دریافت اطلاعات حساب."
    
    await callback.message.edit_text(text, parse_mode='HTML', reply_markup=get_account_menu())
    await callback.answer()


# ============= LOGIN HANDLERS =============
@router.callback_query(F.data == "account_login")
async def login_from_menu(callback: CallbackQuery, state: FSMContext):
    """Start login flow from menu"""
    await callback.message.answer("👤 لطفاً نام کاربری خود را وارد کنید:")
    await state.set_state(LoginStates.username)
    await callback.answer()


@router.message(Command("login"))
async def login_command(message: types.Message, state: FSMContext):
    """Start login – first check if telegram_id is already linked."""
    telegram_id = message.from_user.id
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if token:
            await message.answer("✅ شما قبلاً وارد شده‌اید!")
            return

    await state.set_state(LoginStates.username)
    await message.answer("👤 لطفاً نام کاربری خود را وارد کنید:")


@router.message(LoginStates.username)
async def get_username(message: types.Message, state: FSMContext):
    """Receive username and ask for password"""
    await state.update_data(username=message.text)
    await state.set_state(LoginStates.password)
    await message.answer("🔐 اکنون رمز عبور خود را وارد کنید:")


@router.message(LoginStates.password)
async def get_password(message: types.Message, state: FSMContext):
    """Receive password and perform login"""
    data = await state.get_data()
    username = data["username"]
    password = message.text
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        # Step 1: Get JWT using username/password
        token = await get_access_token(session, username, password)
        if not token:
            await message.answer(
                "❌ اطلاعات ورود نامعتبر است. لطفاً دوباره تلاش کنید.\n"
                "💡 توجه: باید ابتدا در وبسایت ثبت نام کرده باشید."
            )
            await state.clear()
            return

        # Step 2: Create or update Telegram profile
        success = await sync_telegram_profile(session, token, message.from_user)
        if success:
            await message.answer("✅ ورود موفق! پروفایل تلگرام شما پیوند شد.")
        else:
            await message.answer("⚠️ وارد شدید، اما نتوانستیم پروفایل تلگرام را پیوند دهیم.")

    await state.clear()


# ============= LOGOUT HANDLERS =============
@router.callback_query(F.data == "account_logout")
async def logout_confirm(callback: CallbackQuery):
    """Ask for logout confirmation"""
    keyboard = [
        [InlineKeyboardButton(text="✅ بله، خروج کن", callback_data="logout_confirm")],
        [InlineKeyboardButton(text="❌ خیر", callback_data="menu_account")],
    ]
    
    text = "⚠️ آیا مطمئن هستید که می‌خواهید خروج کنید؟"
    await callback.message.edit_text(text, reply_markup=InlineKeyboardMarkup(inline_keyboard=keyboard))
    await callback.answer()


@router.callback_query(F.data == "logout_confirm")
async def logout_user(callback: CallbackQuery):
    """Perform logout"""
    from ..keyboards.main_menu import get_user_menu
    
    telegram_id = callback.from_user.id
    
    async with aiohttp.ClientSession() as session:
        success = await delete_telegram_profile(session, telegram_id)
    
    if success:
        text = "✅ شما با موفقیت خارج شدید."
    else:
        text = "⚠️ خطا در خروج. لطفاً دوباره تلاش کنید."
    
    await callback.message.edit_text(text, reply_markup=get_user_menu())
    await callback.answer()


@router.message(Command("logout"))
async def logout_command(message: types.Message):
    """Logout via command"""
    from ..keyboards.main_menu import get_user_menu
    
    telegram_id = message.from_user.id
    
    async with aiohttp.ClientSession() as session:
        success = await delete_telegram_profile(session, telegram_id)
    
    if success:
        await message.answer("✅ شما با موفقیت خارج شدید.")
    else:
        await message.answer("⚠️ خطا در خروج. لطفاً دوباره تلاش کنید.")
    
    await message.answer("منو اصلی", reply_markup=get_user_menu())