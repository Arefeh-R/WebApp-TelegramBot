# handlers/topic.py
import aiohttp
import logging
from aiogram import Router, types, F, Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, CallbackQuery, Message
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
from ..config import DJANGO_API_BASE_URL
from .login import get_token_by_telegram

router = Router()
logger = logging.getLogger(__name__)
FORUMTOPICS_URL = f"{DJANGO_API_BASE_URL}/topics/"

class TopicRequest(StatesGroup):
    name = State()
    description = State()


@router.callback_query(F.data.startswith("show_topics_"))
async def show_topics(callback: CallbackQuery):
    """Show list of topics for a specific group"""
    group_id = int(callback.data.split("_")[-1])
    telegram_id = callback.from_user.id
    await callback.message.answer("📡 در حال دریافت لیست زیرگروه‌ها...")

    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await callback.message.answer("⚠️ لطفاً ابتدا با /login وارد شوید.")
            await callback.answer()
            return

        headers = {"Authorization": f"Bearer {token}"}
        async with session.get(f"{FORUMTOPICS_URL}?group_id={group_id}", headers=headers) as resp:
            if resp.status == 200: 
                topics = await resp.json()
            elif resp.status == 404:
                await callback.message.answer("هیچ زیرگروهی برای این گروه وجود ندارد.")
                topics = None
            else:
                await callback.message.answer("❌ خطا در دریافت موضوعات.")
                await callback.answer()
                return
        
    if topics:
        for topic in topics:
            name = topic.get("name", "بدون نام")
            desc = topic.get("description", "")
            topic_id = topic.get("topic_id")
            
            # Generate topic link
            chat_id_str = str(group_id)
            # Remove '-100' prefix if present for the link
            clean_id = chat_id_str[4:] if chat_id_str.startswith('-100') else chat_id_str
            topic_link = f"https://t.me/c/{clean_id}/{topic_id}"
            
            text = (
                f"💬 <b>{name}</b>\n"
                f"📝 {desc or '—'}\n"
                f"🔗 <a href='{topic_link}'>باز کردن موضوع</a>"
            )
            await callback.message.answer(text, parse_mode="HTML", disable_web_page_preview=True)

    # Show button to request new topic
    markup = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="➕ درخواست موضوع جدید", callback_data=f"request_topic_{group_id}")],
            [InlineKeyboardButton(text="🔙 بازگشت به گروه‌ها", callback_data="menu_groups")]
        ]
    )
    await callback.message.answer("👇 افزودن موضوع جدید:", reply_markup=markup)
    await callback.answer()


@router.callback_query(F.data.startswith("request_topic_"))
async def request_topic_start(callback: CallbackQuery, state: FSMContext):
    """Start the FSM flow to request a new topic"""
    group_id = int(callback.data.split("_")[-1])
    await state.update_data(group_id=group_id)
    await state.set_state(TopicRequest.name)
    await callback.message.answer("📝 لطفاً نام موضوع مورد نظر خود را وارد کنید:")
    await callback.answer()


async def check_topic_name_exists(session, token: str, name: str, group_id: int) -> bool:
    """
    Check if a topic name already exists for a specific group.
    
    Args:
        session: aiohttp session
        token: User auth token
        name: Topic name to check
        group_id: Group ID (required since uniqueness is per group)
    
    Returns:
        True if name exists in the group, False otherwise
    """
    headers = {"Authorization": f"Bearer {token}"}
    
    params = {"group_id": group_id}
    
    try:
        async with session.get(FORUMTOPICS_URL, headers=headers, params=params) as resp:
            if resp.status == 200:
                topics = await resp.json()
                # Check if any topic in this group has the exact name (case-insensitive)
                return any(topic.get("name", "").lower() == name.lower() for topic in topics)
            return False
    except Exception as e:
        logger.error(f"Error checking topic name existence: {e}")
        return False


@router.message(TopicRequest.name)
async def request_topic_name(message: Message, state: FSMContext):
    """Receive topic name and ask for description"""
    topic_name = message.text.strip()
    
    # Validate name is not empty
    if len(topic_name) < 1:
        await message.answer("❌ نام موضوع نمی‌تواند خالی باشد. لطفاً دوباره تلاش کنید:")
        return
    
    # Validate name length (Telegram limit is 128 characters)
    if len(topic_name) > 128:
        await message.answer("❌ نام موضوع نباید بیشتر از 128 کاراکتر باشد. لطفاً دوباره تلاش کنید:")
        return
    
    # Get stored data
    data = await state.get_data()
    group_id = data.get("group_id")
    telegram_id = message.from_user.id
    
    # Check for duplicate name
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await message.answer("⚠️ ابتدا با /login وارد شوید.")
            await state.clear()
            return
        
        # Check if name already exists in this group
        name_exists = await check_topic_name_exists(session, token, topic_name, group_id)
        
        if name_exists:
            await message.answer(
                f"❌ <b>نام تکراری در این گروه!</b>\n\n"
                f"موضوعی با نام «{topic_name}» قبلاً در این گروه ثبت شده است.\n"
                f"لطفاً نام دیگری انتخاب کنید:",
                parse_mode="HTML"
            )
            return
    
    await state.update_data(name=topic_name)
    await state.set_state(TopicRequest.description)
    await message.answer("✏️ لطفاً توضیحات کوتاهی برای موضوع بنویسید:")


@router.message(TopicRequest.description)
async def request_topic_description(message: Message, state: FSMContext, bot: Bot):
    """Create the topic in Telegram and save to Django"""
    data = await state.get_data()
    group_id = data["group_id"]
    name = data["name"]
    desc = message.text.strip()
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        # Step 1: Get user token
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await message.answer("⚠️ ابتدا با /login وارد شوید.")
            await state.clear()
            return

        headers = {"Authorization": f"Bearer {token}"}

        # Step 2: Verify the group exists and is approved
        async with session.get(f"{DJANGO_API_BASE_URL}/groups/{group_id}/", headers=headers) as resp:
            if resp.status != 200:
                await message.answer("❌ خطا در دریافت اطلاعات گروه.")
                await state.clear()
                return
            group_data = await resp.json()
            
            # Check if group is approved
            if not group_data.get("is_approved", False):
                await message.answer("⚠️ این گروه هنوز تأیید نشده است.")
                await state.clear()
                return

        # Step 3: Double-check name uniqueness before creating (race condition protection)
        name_exists = await check_topic_name_exists(session, token, name, group_id)
        if name_exists:
            await message.answer(
                f"❌ <b>نام تکراری در این گروه!</b>\n\n"
                f"موضوعی با نام «{name}» در حین ثبت توسط کاربر دیگری در این گروه ایجاد شده است.\n"
                f"لطفاً دوباره از ابتدا شروع کنید و نام دیگری انتخاب کنید.",
                parse_mode="HTML"
            )
            await state.clear()
            return

        # Step 4: Create topic in Telegram
        try:
            topic = await bot.create_forum_topic(chat_id=group_id, name=name)
            logger.info(f"Topic created successfully: {name} in group {group_id}")
        except Exception as e:
            logger.error(f"Failed to create forum topic: {e}")
            await message.answer(
                f"❌ خطا در ایجاد تاپیک در تلگرام.\n\n"
                f"<b>دلایل احتمالی:</b>\n"
                f"• گروه به Forum تبدیل نشده است\n"
                f"• محدودیت تعداد تاپیک‌ها\n\n"
                f"خطا: <code>{str(e)}</code>",
                parse_mode="HTML"
            )
            await state.clear()
            return

        topic_id = topic.message_thread_id
        
        # Generate proper topic link
        chat_id_str = str(group_id)
        clean_id = chat_id_str[4:] if chat_id_str.startswith('-100') else chat_id_str.lstrip('-')
        topic_link = f"https://t.me/c/{clean_id}/{topic_id}"

        # Step 5: Save topic to Django API
        payload = {
            "group": group_id,
            "name": name,
            "description": desc,
            "topic_id": topic_id,
            "is_active": True,
            "is_full": False,
        }

        async with session.post(FORUMTOPICS_URL, json=payload, headers=headers) as resp:
            if resp.status in (200, 201):
                await message.answer(
                    f"✅ <b>موضوع جدید با موفقیت ایجاد شد!</b>\n\n"
                    f"📌 <b>نام:</b> {name}\n"
                    f"📝 <b>توضیحات:</b> {desc}\n\n"
                    f"🔗 <b>لینک موضوع:</b>\n{topic_link}",
                    parse_mode="HTML",
                )
                logger.info(f"Topic saved to Django: {name} (ID: {topic_id})")
            else:
                err_text = await resp.text()
                logger.error(f"Failed to save topic to Django: {err_text}")
                
                # Check if error is due to duplicate name
                if "unique" in err_text.lower() or "duplicate" in err_text.lower():
                    await message.answer(
                        f"❌ <b>خطای نام تکراری</b>\n\n"
                        f"تاپیک در تلگرام ایجاد شد اما نام آن در دیتابیس تکراری است.\n"
                        f"لطفاً با ادمین تماس بگیرید.\n\n"
                        f"🔗 لینک تاپیک: {topic_link}",
                        parse_mode="HTML"
                    )
                else:
                    await message.answer(
                        f"⚠️ <b>تاپیک در تلگرام ایجاد شد</b> اما در ثبت در دیتابیس خطا رخ داد:\n\n"
                        f"<code>{err_text}</code>\n\n"
                        f"🔗 لینک تاپیک: {topic_link}",
                        parse_mode="HTML"
                    )

    await state.clear()