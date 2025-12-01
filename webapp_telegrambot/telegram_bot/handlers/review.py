"""
Refactored review handler using modular approach
Demonstrates clean separation of concerns
"""
import logging
from aiogram import Router, Bot, F
from aiogram.filters import Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State

from ..config import WEBAPP_BASE_URL
from ..services.api_client import DjangoAPIClient, APIResponse
from ..services.auth_service import AuthService
from ..constants.messages import Messages
from ..utils.keyboards import KeyboardBuilder

router = Router()
logger = logging.getLogger(__name__)


class ReviewStates(StatesGroup):
    waiting_for_review_title = State() 
    waiting_for_review_rating = State()
    waiting_for_review_text = State()
    waiting_for_edit_confirmation = State()


class ReviewService:
    """Service layer for review operations"""
    
    def __init__(self, api_client: DjangoAPIClient, auth_service: AuthService):
        self.api = api_client
        self.auth = auth_service
    
    async def get_existing_review(self, token: str, book_id: str) -> dict | None:
        """Check if user has existing review for book"""
        response = await self.api.get_book_reviews(book_id, token)
        
        if response.success and response.data:
            results = response.data.get("results", [])
            return results[0] if results else None
        
        return None
    
    async def create_or_update_review(
        self,
        token: str,
        book_id: str,
        title: str,
        rating: int,
        review_text: str,
        review_id: int | None = None
    ) -> APIResponse:
        """Create new review or update existing one"""
        if review_id:
            return await self.api.update_review(
                token=token,
                review_id=review_id,
                title=title,
                rating=rating,
                review_text=review_text
            )
        else:
            return await self.api.create_review(
                token=token,
                book_id=book_id,
                title=title,
                rating=rating,
                review_text=review_text
            )


# Initialize services (you'd typically do this in main bot file)
# from ..config import DJANGO_API_BASE_URL
# api_client = DjangoAPIClient(DJANGO_API_BASE_URL)
# auth_service = AuthService(api_client)
# review_service = ReviewService(api_client, auth_service)


@router.callback_query(F.data == "menu_reviews")
async def show_reviews_menu(callback: CallbackQuery):
    """Show reviews menu when button is clicked from main menu"""
    keyboard = KeyboardBuilder.build_inline([
        [("🔍 جستجوی کتاب", "menu_search")],
        [(Messages.BACK, "main_menu")]
    ])
    
    await callback.message.edit_text(
        Messages.REVIEW_HELP,
        parse_mode='HTML',
        reply_markup=keyboard
    )
    await callback.answer()


async def handle_review_request(
    bot: Bot,
    chat_id: int,
    book_id: str,
    telegram_id: int,
    state: FSMContext,
    api_client: DjangoAPIClient,
    auth_service: AuthService
):
    """
    Core review logic - centralized and reusable
    
    Args:
        bot: Bot instance
        chat_id: Chat ID where to send messages
        book_id: Book ISBN/ID
        telegram_id: User's Telegram ID
        state: FSM Context
        api_client: API client instance
        auth_service: Auth service instance
    """
    # Step 1: Authenticate user
    token = await auth_service.get_user_token(telegram_id)
    if not token:
        await bot.send_message(chat_id, Messages.AUTH_REQUIRED)
        return
    
    # Step 2: Fetch book details
    book_response = await api_client.get_book(book_id, token)
    if not book_response.success:
        await bot.send_message(chat_id, Messages.INVALID_BOOK_ID)
        return
    
    # Step 3: Check for existing review
    review_service = ReviewService(api_client, auth_service)
    existing_review = await review_service.get_existing_review(token, book_id)
    
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
        
        keyboard = KeyboardBuilder.build_inline([
            [(Messages.REVIEW_EDIT_CONFIRM, "edit_review")],
            [(Messages.REVIEW_CANCEL, "cancel_review")]
        ])
        
        await bot.send_message(
            chat_id,
            Messages.REVIEW_ALREADY_EXISTS,
            reply_markup=keyboard
        )
        await state.set_state(ReviewStates.waiting_for_edit_confirmation)
    else:
        # New review
        await state.update_data(book_id=book_id, token=token)
        await bot.send_message(chat_id, Messages.PROMPT_REVIEW_TITLE)
        await state.set_state(ReviewStates.waiting_for_review_title)


@router.message(Command("review"))
async def start_review_command(
    message: Message, 
    state: FSMContext,
    api_client: DjangoAPIClient,
    auth_service: AuthService
):
    """Handle /review command"""
    parts = message.text.strip().split()
    if len(parts) < 2:
        await message.answer(
            "⚠️ لطفاً دستور را به شکل زیر وارد کنید:\n`/review <کد کتاب>`",
            parse_mode="Markdown"
        )
        return
    
    book_id = parts[1]
    
    await handle_review_request(
        bot=message.bot,
        chat_id=message.chat.id,
        book_id=book_id,
        telegram_id=message.from_user.id,
        state=state,
        api_client=api_client,
        auth_service=auth_service
    )


@router.message(ReviewStates.waiting_for_review_title)
async def receive_review_title(message: Message, state: FSMContext):
    """Receive review title and ask for rating"""
    review_title = message.text.strip()
    await state.update_data(review_title=review_title)
    
    # Use keyboard builder for rating buttons
    keyboard = KeyboardBuilder.build_inline([
        [
            ("1 ⭐️", "rating_1"),
            ("2 ⭐️⭐️", "rating_2"),
            ("3 ⭐️⭐️⭐️", "rating_3"),
            ("4 ⭐️⭐️⭐️⭐️", "rating_4"),
            ("5 ⭐️⭐️⭐️⭐️⭐️", "rating_5")
        ]
    ])
    
    await message.answer(Messages.PROMPT_REVIEW_RATING, reply_markup=keyboard)
    await state.set_state(ReviewStates.waiting_for_review_rating)


@router.callback_query(lambda c: c.data.startswith("rating_"))
async def receive_review_rating(callback: CallbackQuery, state: FSMContext):
    """Receive rating selection"""
    rating = callback.data.split('_')[1]
    
    await callback.answer(
        Messages.REVIEW_RATING_SELECTED.format(rating=rating),
        show_alert=False
    )
    await callback.message.edit_text(
        f"⭐ امتیاز {rating} با موفقیت انتخاب شد."
    )
    
    await state.update_data(review_rating=rating)
    await callback.message.answer(Messages.PROMPT_REVIEW_TEXT)
    await state.set_state(ReviewStates.waiting_for_review_text)


@router.callback_query(lambda c: c.data in ["cancel_review", "edit_review"])
async def handle_edit_decision(callback: CallbackQuery, state: FSMContext):
    """Handle user's decision to edit or cancel"""
    if callback.data == "cancel_review":
        await callback.answer("❌ لغو شد", show_alert=False)
        await callback.message.answer(Messages.REVIEW_CANCELLED)
        await state.clear()
        return
    
    # Edit review
    await callback.answer("✏️", show_alert=False)
    await callback.message.answer(
        "✏️ لطفاً عنوان جدید نقد خود را ارسال کنید (یا همان قبلی):"
    )
    await state.set_state(ReviewStates.waiting_for_review_title)


@router.message(ReviewStates.waiting_for_review_text)
async def receive_review_text(
    message: Message, 
    state: FSMContext,
    api_client: DjangoAPIClient,
    auth_service: AuthService
):
    """Receive review text and submit to API"""
    review_text = message.text.strip()
    
    # Get stored data
    data = await state.get_data()
    book_id = data.get("book_id")
    review_id = data.get("review_id")
    token = data.get("token")
    
    # Use new or existing values
    final_rating = data.get("review_rating") or data.get("existing_rating")
    final_title = data.get("review_title") or data.get("existing_title")
    
    # Validate data
    if not all([book_id, token, final_rating, final_title]):
        await message.answer(Messages.REVIEW_DATA_INCOMPLETE)
        await state.clear()
        return
    
    # Submit review
    review_service = ReviewService(api_client, auth_service)
    response = await review_service.create_or_update_review(
        token=token,
        book_id=book_id,
        title=final_title,
        rating=int(final_rating),
        review_text=review_text,
        review_id=review_id
    )
    
    # Handle response
    if response.success:
        success_msg = Messages.REVIEW_UPDATED if review_id else Messages.REVIEW_CREATED
        await message.answer(success_msg)
    else:
        await message.answer(Messages.REVIEW_ERROR.format(error=response.error))
    
    await state.clear()


@router.callback_query(F.data.startswith("review_"))
async def start_review_from_search(
    callback: CallbackQuery, 
    state: FSMContext,
    api_client: DjangoAPIClient,
    auth_service: AuthService
):
    """Handle review button click from search results"""
    book_id = callback.data.split("_", 1)[1]
    await callback.answer()
    
    await handle_review_request(
        bot=callback.bot,
        chat_id=callback.message.chat.id if callback.message else callback.from_user.id,
        book_id=book_id,
        telegram_id=callback.from_user.id,
        state=state,
        api_client=api_client,
        auth_service=auth_service
    )