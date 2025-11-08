from aiogram import Router, F
from aiogram.types import (
    Message, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup, 
    InlineQuery, 
    InlineQueryResultArticle, 
    InputTextMessageContent, 
    CallbackQuery
)
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
import aiohttp
import logging
import uuid
from typing import Dict, Any
from ..config import WEBAPP_BASE_URL, DJANGO_API_BASE_URL

router = Router()
logger = logging.getLogger(__name__)

class ExternalSearchStates(StatesGroup):
    waiting_for_query = State()


@router.callback_query(F.data == "menu_search")
async def show_search_menu(callback: CallbackQuery):
    """Show search options menu"""
    from ..keyboards.main_menu import get_search_menu
    
    help_text = (
        "🔍 <b>جستجوی کتاب</b>\n\n"
        "<b>🔎 جستجوی سریع (Inline):</b>\n"
        "• برای جستجوی سریع در دیتابیس محلی\n"
        "• جستجو بر اساس عنوان، نویسنده یا ISBN\n"
        "• کافی است روی دکمه کلیک کنید و عبارت مورد نظر را تایپ کنید\n\n"
        "<b>🌐 جستجوی گسترده:</b>\n"
        "• جستجو در کتابخانه Open Library\n"
        "• برای کتاب‌هایی که در دیتابیس محلی نیستند\n"
        "• امکان افزودن کتاب جدید به سیستم\n\n"
        "💡 <i>توصیه: ابتدا از جستجوی سریع استفاده کنید</i>"
    )
    
    await callback.message.edit_text(
        help_text,
        parse_mode='HTML',
        reply_markup=get_search_menu()
    )
    await callback.answer()


@router.callback_query(F.data == "search_external")
async def show_external_search_menu(callback: CallbackQuery):
    """Show external search type selection"""
    from ..keyboards.main_menu import get_external_search_menu
    
    await callback.message.edit_text(
        "🌐 <b>جستجوی گسترده</b>\n\n"
        "لطفاً نوع جستجو را انتخاب کنید:",
        parse_mode='HTML',
        reply_markup=get_external_search_menu()
    )
    await callback.answer()


@router.callback_query(F.data.startswith("ext_search_"))
async def external_search_prompt(callback: CallbackQuery, state: FSMContext):
    """Prompt user for external search query"""
    search_type = callback.data.split("_")[-1]  # title, author, or isbn
    
    await state.update_data(search_type=search_type)
    await state.set_state(ExternalSearchStates.waiting_for_query)
    
    prompts = {
        "title": "📖 لطفاً عنوان کتاب را وارد کنید:",
        "author": "✒️ لطفاً نام نویسنده را وارد کنید:",
        "isbn": "🔢 لطفاً ISBN کتاب را وارد کنید:"
    }
    
    await callback.message.answer(prompts.get(search_type, "لطفاً عبارت جستجو را وارد کنید:"))
    await callback.answer()


@router.message(ExternalSearchStates.waiting_for_query)
async def handle_external_search(message: Message, state: FSMContext):
    """Handle external search via Open Library API"""
    data = await state.get_data()
    search_type = data.get("search_type")
    query = message.text.strip()
    
    if not query:
        await message.answer("❌ لطفاً یک عبارت معتبر وارد کنید.")
        return
    
    await message.answer(f"🔍 در حال جستجو در Open Library برای: <b>{query}</b>...", parse_mode='HTML')
    
    # Call Django API endpoint for external search
    url = f"{DJANGO_API_BASE_URL}/books/search-external/"
    params = {
        "query": query,
        "query_type": search_type
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, params=params, timeout=25) as response:
                if response.status in (200, 201):
                    # Book(s) found and added to database
                    response_data = await response.json()
                    
                    # Check if it's a single book or multiple books (author search returns list)
                    if isinstance(response_data, list):
                        # Multiple books (author search)
                        if len(response_data) == 0:
                            await message.answer(
                                "❌ متأسفانه کتابی با این مشخصات در Open Library یافت نشد.\n\n"
                                "💡 پیشنهاد:\n"
                                "• املای عبارت جستجو را بررسی کنید\n"
                                "• از جستجوی سریع (Inline) استفاده کنید"
                            )
                        else:
                            await message.answer(
                                f"✅ <b>{len(response_data)} کتاب یافت شد و به دیتابیس اضافه شد!</b>",
                                parse_mode='HTML'
                            )
                            # Display each book
                            for book_data in response_data:
                                await display_external_search_result(message, book_data)
                    else:
                        # Single book (title or ISBN search)
                        await display_external_search_result(message, response_data)
                    
                elif response.status == 404:
                    await message.answer(
                        "❌ متأسفانه کتابی با این مشخصات در Open Library یافت نشد.\n\n"
                        "💡 پیشنهاد:\n"
                        "• املای عبارت جستجو را بررسی کنید\n"
                        "• از جستجوی سریع (Inline) استفاده کنید\n"
                        "• با نوع جستجوی دیگری تلاش کنید"
                    )
                    
                elif response.status == 503:
                    error_data = await response.json()
                    await message.answer(
                        f"⚠️ خطا در ارتباط با سرویس خارجی:\n{error_data.get('detail', 'خطای ناشناخته')}\n\n"
                        "لطفاً چند لحظه دیگر دوباره تلاش کنید."
                    )
                    
                else:
                    await message.answer(f"❌ خطای سرور: {response.status}")
                    
        except aiohttp.ClientConnectorError:
            await message.answer("❌ خطا در اتصال به سرور. لطفاً بعداً تلاش کنید.")
        except Exception as e:
            logger.error(f"External search error: {e}")
            await message.answer("❌ خطای غیرمنتظره در جستجو.")
    
    await state.clear()


async def display_external_search_result(message: Message, book_data: Dict[str, Any]):
    """Display external search result with book details"""
    title = book_data.get('title', 'عنوان نامشخص')
    authors = book_data.get('authors', [])
    author_names = ', '.join([a.get('name', 'نامشخص') for a in authors]) if authors else 'نامشخص'
    isbn = book_data.get('isbn_13') or book_data.get('isbn_10', 'ندارد')
    book_id = book_data.get('parent_asin')
    cover = book_data.get('cover', '')
    rating_count = book_data.get('rating_number',0)
    rating = book_data.get('average_rating','ندارد')
    
    text = (
            f"✅ <b>کتاب یافت شد!</b>\n\n"
            f"📖 <b>عنوان:</b> {title}\n"
            f"✒️ <b>نویسنده:</b> {author_names}\n"
            f"🔢 <b>ISBN:</b> {isbn}\n"
            f"🔢<b>کد کتاب:</b> {book_id}\n"
            f"⭐ <b>امتیاز:</b> {rating} (بر اساس {rating_count} رأی)\n\n"
            f"💡 اکنون می‌توانید برای این کتاب نقد بنویسید یا آن را در گروه‌ها به اشتراک بگذارید."
        )
    
    # Create inline buttons
    buttons = []
    if book_id:
        webapp_url = f"{WEBAPP_BASE_URL}/api1/books/{book_id}"
        buttons.append([InlineKeyboardButton(text="🔗 مشاهده در وب‌اپ", url=webapp_url)])
        buttons.append([InlineKeyboardButton(text="✍️ نوشتن نقد", callback_data=f"review_{book_id}")])
    
    buttons.append([InlineKeyboardButton(text="🔙 بازگشت به جستجو", callback_data="menu_search")])
    
    markup = InlineKeyboardMarkup(inline_keyboard=buttons)
    
    if cover:
        try:
            await message.answer_photo(photo=cover, caption=text, parse_mode='HTML', reply_markup=markup)
        except Exception as e:
            logger.warning(f"Failed to send photo: {e}")
            await message.answer(text, parse_mode='HTML', reply_markup=markup)
    else:
        await message.answer(text, parse_mode='HTML', reply_markup=markup)


# === INLINE QUERY (QUICK SEARCH) ===

@router.inline_query()
async def inline_book_search(inline_query: InlineQuery):
    """Handle inline search queries for quick book lookup"""
    query = inline_query.query.strip()
    
    # Show help if query is empty
    if not query:
        results = [
            InlineQueryResultArticle(
                id=str(uuid.uuid4()),
                title="💡 راهنمای جستجوی سریع",
                description="عنوان، نویسنده یا ISBN کتاب را تایپ کنید",
                input_message_content=InputTextMessageContent(
                    message_text="برای جستجوی سریع، نام کتاب، نویسنده یا ISBN را تایپ کنید."
                )
            )
        ]
        await inline_query.answer(results, cache_time=300, is_personal=True)
        return
    
    # Search in local database
    url = f"{DJANGO_API_BASE_URL}/books/"
    params = {
        'search': query,
        'ordering': '-rating_number'
    }
    
    results = []
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, params=params, timeout=5) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    books = data.get("results", [])[:50]
                    
                    if not books:
                        # No results found
                        results.append(
                            InlineQueryResultArticle(
                                id=str(uuid.uuid4()),
                                title="❌ نتیجه‌ای یافت نشد",
                                description=f"کتابی با عبارت '{query}' در دیتابیس یافت نشد",
                                input_message_content=InputTextMessageContent(
                                    message_text=f"❌ کتابی با عبارت '{query}' یافت نشد.\n\n"
                                                f"💡 از جستجوی گسترده استفاده کنید."
                                )
                            )
                        )
                    else:
                        # Display found books
                        for book in books:
                            title = book.get("title", "بدون عنوان")
                            authors = book.get("authors", [])
                            author_name = authors[0].get('name', 'نامشخص') if authors else 'نامشخص'
                            rating = book.get("average_rating", "ندارد")
                            book_id = book.get("parent_asin", "")
                            cover = book.get("cover", "")
                            isbn = book.get('isbn_13') or book.get('isbn_10', 'ندارد')
                            rating_count = book.get('rating_number', 0)
                            
                            message_text = (
                                f"✅ <b>کتاب یافت شد!</b>\n\n"
                                f"📖 <b>عنوان:</b> {title}\n"
                                f"✒️ <b>نویسنده:</b> {author_name}\n"
                                f"🔢 <b>ISBN:</b> {isbn}\n"
                                f"🔢 <b>کد کتاب:</b> {book_id}\n"
                                f"⭐ <b>امتیاز:</b> {rating} (بر اساس {rating_count} رأی)\n\n"
                                f"💡 اکنون می‌توانید برای این کتاب نقد بنویسید یا آن را در گروه‌ها به اشتراک بگذارید."
                            )
                            
                            # Create inline keyboard for the result
                            webapp_url = f"{WEBAPP_BASE_URL}/api1/books/{book_id}"
                            inline_keyboard = [
                                [{"text": "🔗 مشاهده در وب‌اپ", "url": webapp_url}],
                                [{"text": "✍️ نوشتن نقد", "callback_data": f"review_{book_id}"}],
                                [{"text": "🔙 بازگشت به جستجو", "callback_data": "menu_search"}]
                            ]
                            
                            results.append(
                                InlineQueryResultArticle(
                                    id=str(uuid.uuid4()),
                                    title=title,
                                    description=f"{author_name} • ⭐ {rating} • {rating_count} رأی",
                                    input_message_content=InputTextMessageContent(
                                        message_text=message_text,
                                        parse_mode='HTML'
                                    ),
                                    reply_markup={"inline_keyboard": inline_keyboard},
                                    thumb_url=cover if cover else None
                                )
                            )
                else:
                    logger.error(f"Inline search API error: {resp.status}")
                    
        except Exception as e:
            logger.error(f"Inline search error: {e}")
    
    await inline_query.answer(results, cache_time=60, is_personal=True)


# === REVIEW CALLBACK FROM SEARCH ===

@router.callback_query(F.data.startswith("review_"))
async def start_review_from_search(callback: CallbackQuery, state: FSMContext):
    """Handle review button click from search results"""
    book_id = callback.data.split("_", 1)[1]  # Get everything after "review_"
    
    await callback.answer()
    
    # Import review handler
    from .review import handle_review_request
    
    # Call the review handler with proper parameters
    await handle_review_request(
        bot=callback.bot,
        chat_id=callback.message.chat.id if callback.message else callback.from_user.id,
        message_id=callback.message.message_id if callback.message else None,
        book_id=book_id,
        telegram_id=callback.from_user.id,
        state=state
    )