import aiohttp
import logging
from aiogram import Router, Bot, F
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from ..config import DJANGO_API_BASE_URL
from .login import get_token_by_telegram

router = Router()
logger = logging.getLogger(__name__)

BOOKS_URL = f"{DJANGO_API_BASE_URL}/books/"
REVIEWS_URL = f"{DJANGO_API_BASE_URL}/reviews/"
BOOK_REVIEWS_URL = lambda book_id: f"{BOOKS_URL}{book_id}/reviews/"

class ReviewStates(StatesGroup):
    waiting_for_review_title = State() 
    waiting_for_review_rating = State()
    waiting_for_review_text = State()
    waiting_for_edit_confirmation = State()


@router.callback_query(F.data == "menu_reviews")
async def show_reviews_menu(callback: CallbackQuery):
    """Show reviews menu when button is clicked from main menu"""
    
    help_text = (
        "✍️ <b>نقد و بررسی</b>\n\n"
        "برای نوشتن نقد یک کتاب:\n\n"
        "<b>روش ۱: از جستجو</b>\n"
        "• از منوی جستجو کتاب مورد نظر را پیدا کنید\n"
        "• روی دکمه 'نوشتن نقد' کلیک کنید\n\n"
        "<b>روش ۲: با دستور مستقیم</b>\n"
        "• اگر کد کتاب را دارید: <code>/review کد_کتاب</code>\n\n"
        "<i>مثال: </i>\n\n"
        "💡/review 0618640150 \n\n"
        "📝 شما می‌توانید نقدهای خود را ویرایش کنید."
    )
    
    keyboard = [
        [InlineKeyboardButton(text="🔍 جستجوی کتاب", callback_data="menu_search")],
        [InlineKeyboardButton(text="🔙 بازگشت به منوی اصلی", callback_data="main_menu")],
    ]
    markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
    
    await callback.message.edit_text(
        help_text,
        parse_mode='HTML',
        reply_markup=markup
    )
    await callback.answer()

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

async def handle_review_request(bot: Bot, chat_id: int, message_id: int, book_id: str, telegram_id: int, state: FSMContext):
    """
    Core review logic that can be called from /review command or callbacks
    
    Args:
        bot: Bot instance
        chat_id: Chat ID where to send messages
        message_id: Message ID (for editing inline results, optional)
        book_id: Book ISBN/ID
        telegram_id: User's Telegram ID
        state: FSM Context
    """
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        if not token:
            await bot.send_message(chat_id, "⚠️ ابتدا باید با دستور /login وارد شوید.")
            return

        # Fetch book
        book = await fetch_book_details(session, token, book_id)
        if not book:
            await bot.send_message(chat_id, "❌ کتابی با این شناسه یافت نشد.")
            return

        existing_review = await get_existing_review(session, token, book_id)
        logger.info(f"Existing review: {existing_review}")

        if existing_review:
            # Ask for confirmation to edit
            await state.update_data(
                book_id=book_id, 
                existing_review=existing_review, 
                token=token, 
                review_id=existing_review['review_id'],
                existing_rating=existing_review.get('rating'),
                existing_title=existing_review.get('title') 
            )
            markup = InlineKeyboardMarkup(inline_keyboard=[
                [
                    InlineKeyboardButton(text="بله، ویرایش کن ✏️", callback_data="edit_review"),
                    InlineKeyboardButton(text="خیر 🚫", callback_data="cancel_review")
                ]
            ])
            await bot.send_message(
                chat_id,
                "📘 شما قبلاً برای این کتاب نقد نوشته‌اید.\nآیا مایل به ویرایش آن هستید؟",
                reply_markup=markup
            )
            await state.set_state(ReviewStates.waiting_for_edit_confirmation)
        else:
            # New review
            await state.update_data(book_id=book_id, token=token)
            await bot.send_message(chat_id, "✍️ لطفاً یک عنوان برای نقد خود ارسال کنید:")
            await state.set_state(ReviewStates.waiting_for_review_title)


@router.message(Command("review"))
async def start_review_command(message: Message, state: FSMContext):
    parts = message.text.strip().split()
    if len(parts) < 2:
        await message.answer("❗ لطفاً دستور را به شکل زیر وارد کنید:\n`/review <کد کتاب>`", parse_mode="Markdown")
        return

    book_id = parts[1]
    telegram_id = message.from_user.id
    
    await handle_review_request(
        bot=message.bot,
        chat_id=message.chat.id,
        message_id=message.message_id,
        book_id=book_id,
        telegram_id=telegram_id,
        state=state
    )

@router.message(ReviewStates.waiting_for_review_title)
async def receive_review_title(message: Message, state: FSMContext):
    review_title = message.text.strip()
    
    await state.update_data(review_title=review_title)
    
    rating_markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="1 ⭐️", callback_data="rating_1"),
         InlineKeyboardButton(text="2 ⭐️⭐️", callback_data="rating_2"),
         InlineKeyboardButton(text="3 ⭐️⭐️⭐️", callback_data="rating_3"),
         InlineKeyboardButton(text="4 ⭐️⭐️⭐️⭐️", callback_data="rating_4"),
         InlineKeyboardButton(text="5 ⭐️⭐️⭐️⭐️⭐️", callback_data="rating_5")]
    ])
    
    await message.answer("⭐ لطفاً امتیاز کتاب (از 1 تا 5) را انتخاب کنید:", reply_markup=rating_markup)
    await state.set_state(ReviewStates.waiting_for_review_rating)

@router.callback_query(lambda c: c.data.startswith("rating_"))
async def receive_review_rating(callback: CallbackQuery, state: FSMContext):
    rating = callback.data.split('_')[1] 
    
    await callback.answer(f"امتیاز: {rating} ⭐️", show_alert=False)
    await callback.message.edit_text(f"⭐ امتیاز {rating} با موفقیت انتخاب شد.")

    await state.update_data(review_rating=rating)
    
    await callback.message.answer("📝 اکنون لطفاً نقد کامل خود را ارسال کنید:")
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
        await callback.message.answer("✍️ لطفاً عنوان جدید نقد خود را ارسال کنید (یا همان قبلی):")
        await state.set_state(ReviewStates.waiting_for_review_title)


@router.message(ReviewStates.waiting_for_review_text)
async def receive_review_text(message: Message, state: FSMContext):
    review_text = message.text.strip()
    logger.info(f"Received new review text: {review_text}")

    data = await state.get_data()
    book_id = data.get("book_id")
    review_id = data.get("review_id")
    token = data.get("token")

    final_rating = data.get("review_rating") if data.get("review_rating") else data.get("existing_rating") 
    final_title = data.get("review_title") if data.get("review_title") else data.get("existing_title")
    
    if not all([book_id, token, final_rating, final_title]):
        await message.answer("⚠️ داده‌های نقد (امتیاز/عنوان/کتاب) ناقص است. لطفاً دوباره تلاش کنید.")
        await state.clear()
        return

    headers = {"Authorization": f"Bearer {token}"}

    if review_id:
        # Edit existing review
        url = f"{REVIEWS_URL}{review_id}/"
        payload = {}
        if review_text: 
            payload["review_text"] = review_text
        if final_title: 
            payload["title"] = final_title
        if final_rating: 
            payload["rating"] = final_rating
        method = "PATCH"
        success_msg = "✅ نقد شما با موفقیت ویرایش شد!"
    else:
        # Create new review
        url = REVIEWS_URL
        payload = {
            "book": book_id, 
            "review_text": review_text, 
            "rating": final_rating, 
            "title": final_title   
        }
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