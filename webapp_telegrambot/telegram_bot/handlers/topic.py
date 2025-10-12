import aiohttp
from aiogram import Router, types, F, Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, CallbackQuery, Message
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
from ..config import DJANGO_API_BASE_URL
from .login import get_token_by_telegram
from aiogram.filters import Command

router = Router()
FORUMTOPICS_URL = f"{DJANGO_API_BASE_URL}/topics/"

# --- FSM for topic request ---
class TopicRequest(StatesGroup):
    name = State()
    description = State()
    group_id = State()


# --- Show list of topics for a group ---
@router.callback_query(F.data.startswith("show_topics_"))
async def show_topics(callback: CallbackQuery):
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
            text = f"💬 <b>{name}</b>\n{desc or '—'}"
            await callback.message.answer(text, parse_mode="HTML")

    # After showing topics, offer “request new topic”
    markup = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="➕ درخواست موضوع جدید", callback_data=f"request_topic_{group_id}")]
        ]
    )
    await callback.message.answer("👇 افزودن موضوع جدید:", reply_markup=markup)
    await callback.answer()


# --- FSM flow: Request new topic ---
@router.callback_query(F.data.startswith("request_topic_"))
async def request_topic_start(callback: CallbackQuery, state: FSMContext):
    group_id = int(callback.data.split("_")[-1])
    await state.update_data(group_id=group_id)
    await state.set_state(TopicRequest.name)
    await callback.message.answer("📝 لطفاً نام موضوع مورد نظر خود را وارد کنید:")
    await callback.answer()


@router.message(TopicRequest.name)
async def request_topic_name(message: Message, state: FSMContext):
    await state.update_data(name=message.text)
    await state.set_state(TopicRequest.description)
    await message.answer("✏️ لطفاً توضیحات کوتاهی برای موضوع بنویسید:")


@router.message(TopicRequest.description)
async def request_topic_description(message: Message, state: FSMContext, bot: Bot):
    data = await state.get_data()
    group_id = data["group_id"]
    name = data["name"]
    desc = message.text
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        # Step 1. Get JWT token
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await message.answer("⚠️ ابتدا با /login وارد شوید.")
            await state.clear()
            return

        headers = {"Authorization": f"Bearer {token}"}

        # Step 2. Get the Telegram group chat_id from Django
        async with session.get(f"{DJANGO_API_BASE_URL}/groups/{group_id}/", headers=headers) as resp:
            if resp.status != 200:
                await message.answer("❌ خطا در دریافت اطلاعات گروه.")
                await state.clear()
                return
            group_data = await resp.json()
            chat_id = group_data.get("telegram_chat_id")

        if not chat_id:
            await message.answer("⚠️ این گروه هنوز فعال نیست.")
            await state.clear()
            return

        # Step 3. Create the topic inside the Telegram group
        try:
            topic = await bot.create_forum_topic(chat_id=chat_id, name=name)
        except Exception as e:
            await message.answer(f"❌ خطا در ایجاد تاپیک در تلگرام:\n{e}")
            await state.clear()
            return

        topic_id = topic.message_thread_id
        topic_link = f"https://t.me/c/{str(chat_id)[4:]}/{topic_id}"

        # Step 4. Send topic info to Django API
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
                    f"✅ موضوع جدید با موفقیت ایجاد شد!\n\n🔗 <b>لینک موضوع:</b>\n{topic_link}",
                    parse_mode="HTML",
                )
            else:
                err_text = await resp.text()
                await message.answer(f"⚠️ خطا در ثبت موضوع در وب‌اپ:\n{err_text}")

    await state.clear()
