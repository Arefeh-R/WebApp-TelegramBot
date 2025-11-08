import aiohttp
import logging
from aiogram import Router, F
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, CallbackQuery, Message
from aiogram.filters import Command
from ..config import DJANGO_API_BASE_URL
from ..utils.auth_helper import get_token_by_telegram
from aiogram.fsm.context import FSMContext
from .request_group import start_request_group
from ..keyboards.main_menu import get_groups_menu


router = Router()
logger = logging.getLogger(__name__)

GROUPS_URL = f"{DJANGO_API_BASE_URL}/groups/"
TOKEN_BY_TELEGRAM_URL = f"{DJANGO_API_BASE_URL}/telegram-profiles/token_by_telegram/"


@router.callback_query(F.data == "menu_groups")
async def show_groups_menu(callback: CallbackQuery):
    """Show groups menu"""
    await callback.message.edit_text(
        "👥 گروه‌های کتابخوانی:\nلطفاً یک گزینه را انتخاب کنید:",
        reply_markup=get_groups_menu()
    )
    await callback.answer()

@router.callback_query(F.data == "groups_list")
async def show_groups_callback(callback: CallbackQuery):
    """Show groups list from menu"""
    await show_groups(callback.message)
    await callback.answer()

async def fetch_groups():
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(GROUPS_URL, timeout=5) as resp:
                if resp.status == 200:
                    return await resp.json()
                logger.warning(f"fetch_groups failed: {resp.status}")
        except Exception as e:
            logger.error(f"fetch_groups error: {e}")
    return []

@router.message(Command("groups"))
async def show_groups(message: Message):
    await message.answer("📡 در حال دریافت لیست گروه‌ها...")

    groups = await fetch_groups()
    if not groups:
        await message.answer("❌ هیچ گروهی برای نمایش وجود ندارد.")
        return

    if len(groups) > 10:
        await message.answer("⚠️ بیش از ۱۰ گروه موجود است. برای مشاهده کامل لیست، لطفاً از وب‌اپ استفاده کنید.")

    for g in groups:
        group_id = g.get("id")
        name = g.get("name", "بدون نام")
        desc = g.get("description", "")
        members = g.get("member_count", 0)

        text = (
            f"📚 <b>{name}</b>\n"
            f"👥 اعضا: {members}\n"
            f"📝 توضیحات: {desc or '—'}"
        )

        if group_id:
            markup = InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(text="📎 مشاهده لینک گروه", callback_data=f"show_link_{group_id}" )],
                    [InlineKeyboardButton(text="💬 مشاهده زیرگروه ها", callback_data=f"show_topics_{group_id}" )]
                ]
            )
            await message.answer(text, parse_mode="HTML", reply_markup=markup)
        else:
            await message.answer(text, parse_mode="HTML")

    # After listing all groups → show the “request new group” option
    request_button = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(
                text="➕ درخواست گروه جدید",
                callback_data="request_new_group"
            )]
        ]
    )
    await message.answer("👇 اگر گروه مورد نظر خود را پیدا نکردید:", reply_markup=request_button)


@router.callback_query(F.data.startswith("show_link_"))
async def show_group_link(callback: CallbackQuery):
    group_id = int(callback.data.split("_")[-1])
    telegram_id = callback.from_user.id

    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await callback.message.answer(
                "⚠️ حساب شما هنوز به وب‌اپ لینک نشده است.\nلطفاً ابتدا دستور /login را اجرا کنید."
            )
            await callback.answer()
            return

        headers = {"Authorization": f"Bearer {token}"}
        async with session.get(f"{GROUPS_URL}{group_id}/", headers=headers) as resp:
            if resp.status != 200:
                await callback.message.answer("❌ خطا در دریافت اطلاعات گروه.")
                await callback.answer()
                return
            group = await resp.json()

    group_name = group.get("name", "گروه")
    link = group.get("telegram_invite_link")  
    desc = group.get("description", "بدون توضیح")

    if link:
        text = (
            f"🔗 <b>{group_name}</b>\n\n"
            f"{desc}\n\n"
            f"برای پیوستن به گروه، روی لینک زیر کلیک کنید:\n👉 {link}"
        )
        await callback.message.answer(text, parse_mode="HTML")
    else:
        await callback.message.answer(f"⚠️ لینک تلگرام برای گروه <b>{group_name}</b> تنظیم نشده است.", parse_mode="HTML")

    await callback.answer()

@router.callback_query(F.data == "request_new_group")
async def handle_request_group_button(callback: CallbackQuery, state: FSMContext):
    await callback.answer()  
    await callback.message.answer("📝 درخواست گروه جدید را شروع می‌کنیم...")
    await start_request_group(callback.message, state)