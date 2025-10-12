import aiohttp
import logging
from aiogram import Router
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from ..config import DJANGO_API_BASE_URL
from .login import get_token_by_telegram

router = Router()
logger = logging.getLogger(__name__)

# === API BASE URLS ===
BOOKS_URL = f"{DJANGO_API_BASE_URL}/books/"
REVIEWS_URL = f"{DJANGO_API_BASE_URL}/reviews/"
BOOK_REVIEWS_URL = lambda book_id: f"{BOOKS_URL}{book_id}/reviews/"

# === FSM STATES ===
class ReviewStates(StatesGroup):
    waiting_for_review_text = State()
    waiting_for_edit_confirmation = State()

# === UTILITIES ===
async def fetch_book_details(session, token, book_id):
    """Fetch book details by ID"""
    url = f"{BOOKS_URL}{book_id}/"
    headers = {"Authorization": f"Bearer {token}"}
    async with session.get(url, headers=headers) as resp:
        if resp.status == 200:
            return await resp.json()
        logger.error(f"Failed to fetch book {book_id}: {resp.status}")
    return None


async def get_existing_review(session, token, book_id):
    """Check if user already has a review for this book"""
    url = f"{BOOKS_URL}{book_id}/reviews/?mine=1"
    headers = {"Authorization": f"Bearer {token}"}
    async with session.get(url, headers=headers) as resp:
        logger.info(f"GET {url} → {resp.status}")
        if resp.status == 200:
            data = await resp.json()
            results = data.get("results", [])
            return results[0] if results else None
        else:
            logger.error(f"Error fetching existing review: {resp.status}")
    return None


# === MAIN COMMAND HANDLER ===
@router.message(Command("review"))
async def start_review_command(message: Message, state: FSMContext):
    parts = message.text.strip().split()
    if len(parts) < 2:
        await message.answer("❗ لطفاً دستور را به شکل زیر وارد کنید:\n`/review <isbn>`", parse_mode="Markdown")
        return

    book_id = parts[1]
    telegram_id = message.from_user.id

    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await message.answer("⚠️ ابتدا باید با دستور /login وارد شوید.")
            return

        # Fetch book
        book = await fetch_book_details(session, token, book_id)
        if not book:
            await message.answer("❌ کتابی با این شناسه یافت نشد.")
            return

        existing_review = await get_existing_review(session, token, book_id)
        logger.info(f"Existing review: {existing_review}")

        if existing_review:
            # Ask for confirmation to edit
            await state.update_data(book_id=book_id, existing_review=existing_review, token=token, review_id=existing_review['review_id'])
            markup = InlineKeyboardMarkup(inline_keyboard=[
                [
                    InlineKeyboardButton(text="بله، ویرایش کن ✏️", callback_data="edit_review"),
                    InlineKeyboardButton(text="خیر 🚫", callback_data="cancel_review")
                ]
            ])
            await message.answer(
                "📘 شما قبلاً برای این کتاب نقد نوشته‌اید.\nآیا مایل به ویرایش آن هستید؟",
                reply_markup=markup
            )
            await state.set_state(ReviewStates.waiting_for_edit_confirmation)
        else:
            # New review
            await state.update_data(book_id=book_id, token=token)
            await message.answer("📝 لطفاً نقد خود را ارسال کنید:")
            await state.set_state(ReviewStates.waiting_for_review_text)

@router.callback_query(lambda c: c.data in ["cancel_review", "edit_review"])
async def handle_edit_decision(callback: CallbackQuery, state: FSMContext):
    logger.info(f"Callback received: {callback.data}")

    if callback.data == "cancel_review":
        await callback.answer("❌ لغو شد", show_alert=False)
        await callback.message.answer("🚫 ویرایش نقد لغو شد.")
        await state.clear()
        return

    if callback.data == "edit_review":
        await callback.answer("✏️", show_alert=False)
        await callback.message.answer("📝 لطفاً نقد جدید خود را ارسال کنید:")
        await state.set_state(ReviewStates.waiting_for_review_text)


@router.message(ReviewStates.waiting_for_review_text)
async def receive_review_text(message: Message, state: FSMContext):
    review_text = message.text.strip()
    logger.info(f"Received new review text: {review_text}")

    data = await state.get_data()
    book_id = data.get("book_id")
    review_id = data.get("review_id")
    token = data.get("token")

    if not all([book_id, token]):
        await message.answer("⚠️ داده‌های نقد ناقص است. لطفاً دوباره تلاش کنید.")
        await state.clear()
        return

    headers = {"Authorization": f"Bearer {token}"}

    if review_id:
        # Edit existing review
        url = f"{BOOKS_URL}{book_id}/reviews/{review_id}/"
        payload = {"review_text": review_text}
        method = "PATCH"
        success_msg = "✅ نقد شما با موفقیت ویرایش شد!"
    else:
        # Create new review
        url = REVIEWS_URL
        payload = {"book": book_id, "review_text": review_text, "rating": 5, "title": "Review"}
        method = "POST"
        success_msg = "✅ نقد شما با موفقیت ثبت شد!"

    async with aiohttp.ClientSession() as session:
        if method == "PATCH":
            resp = await session.patch(url, json=payload, headers=headers)
        else:
            resp = await session.post(url, json=payload, headers=headers)
        
        logger.info(f"{method} {url} → {resp.status}")
        async with resp:
            if resp.status in (200, 201):
                await message.answer(success_msg)
            else:
                error_text = await resp.text()
                await message.answer(f"❌ خطا در ثبت/ویرایش نقد: {error_text}")

    await state.clear()

