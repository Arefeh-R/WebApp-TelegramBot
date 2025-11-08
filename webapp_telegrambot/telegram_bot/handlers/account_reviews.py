import aiohttp
import logging
from aiogram import Router, F
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup
from ..config import DJANGO_API_BASE_URL
from ..utils.auth_helper import get_token_by_telegram, get_user_profile

router = Router()
logger = logging.getLogger(__name__)

REVIEWS_URL = f"{DJANGO_API_BASE_URL}/reviews/"


@router.callback_query(F.data == "account_reviews")
async def show_reviews_menu(callback: CallbackQuery):
    """Show reviews menu with user's recent reviews"""
    telegram_id = callback.from_user.id
    
    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, telegram_id)
        
        if not token:
            help_text = (
                "✍️ <b>نقد و بررسی</b>\n\n"
                "⚠️ باید وارد شوید.\n\n"
                "برای ورود از دستور /login استفاده کنید."
            )
            keyboard = [
                [InlineKeyboardButton(text="👤 ورود به حساب", callback_data="account_login")],
                [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
            ]
        else:
            headers = {"Authorization": f"Bearer {token}"}
            
            try:
                async with session.get(f"{REVIEWS_URL}?mine=1&limit=5", headers=headers) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        reviews = data.get("results", [])
                        if reviews:
                            help_text = (
                                "✍️ <b>نقدهای شما</b>\n\n"
                                f"📊 {len(reviews)} نقد آخر شما:\n\n"
                            )
                            for i, review in enumerate(reviews[:5], 1):
                                book_title = review.get('book', {}).get('title', 'نامشخص')
                                rating = review.get('rating', 'نامشخص')
                                review_text = review.get('review_text', '')[:50]
                                help_text += f"{i}. {book_title} ⭐ {rating}\n   «{review_text}...»\n\n"                       
                        else:
                            help_text = (
                                "✍️ <b>نقد و بررسی</b>\n\n"
                                "شما هنوز نقدی ننوشته‌اید.\n\n"
                                "برای نوشتن نقد، ابتدا کتاب مورد نظر را جستجو کنید."
                            )
                    else:
                        help_text = (
                            "✍️ <b>نقد و بررسی</b>\n\n"
                            "خطا در دریافت نقدها. لطفاً دوباره تلاش کنید."
                        )
            except Exception as e:
                logger.error(f"Error fetching reviews: {e}")
                help_text = (
                    "✍️ <b>نقد و بررسی</b>\n\n"
                    "خطا در برقراری ارتباط. لطفاً دوباره تلاش کنید."
                )
            
            keyboard = [
                [InlineKeyboardButton(text="🔍 جستجوی کتاب برای نقد", callback_data="menu_search")],
                [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
            ]
    
    markup = InlineKeyboardMarkup(inline_keyboard=keyboard)
    
    await callback.message.edit_text(
        help_text,
        parse_mode='HTML',
        reply_markup=markup
    )
    await callback.answer()