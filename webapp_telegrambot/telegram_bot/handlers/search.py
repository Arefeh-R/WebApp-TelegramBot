from aiogram import Router, F
from aiogram.types import Message, InlineKeyboardButton, InlineKeyboardMarkup, InlineQuery, InlineQueryResultArticle, InputTextMessageContent, CallbackQuery
from aiogram.filters import Command
from aiogram.filters.command import CommandObject
import aiohttp
import os
import logging
import uuid
from typing import Dict, Any, List
from ..config import WEBAPP_BASE_URL, DJANGO_API_BASE_URL
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext

router = Router()
logger = logging.getLogger(__name__)

# handlers/search_commands.py (add these)

@router.callback_query(F.data == "menu_search")
async def show_search_menu(callback: CallbackQuery):
    """Show search options"""
    from ..keyboards.main_menu import get_search_menu
    await callback.message.edit_text(
        "🔍 جستجوی کتاب:\nلطفاً نوع جستجو را انتخاب کنید:",
        reply_markup=get_search_menu()
    )
    await callback.answer()

@router.callback_query(F.data == "search_title")
async def search_title_prompt(callback: CallbackQuery, state: FSMContext):
    """Prompt for title search"""
    await callback.message.answer("📖 لطفاً عنوان کتاب را وارد کنید:")
    await state.set_state(SearchStates.waiting_for_title)
    await callback.answer()

# Add FSM States
class SearchStates(StatesGroup):
    waiting_for_title = State()
    waiting_for_author = State()
    waiting_for_isbn = State()

# --- Helper Function for Local API Call ---
async def search_books_api(query: str) -> Dict[str, Any]:
    """
    Sends an asynchronous request to the local Django REST Framework books list endpoint.
    Uses 'search' parameter for full-text search and orders by average_rating.
    """
    # Target the main books list endpoint (assuming /api/books)
    url = f"{DJANGO_API_BASE_URL}/books" 
    
    # Use 'search' parameter and add default ordering
    params = {
        'search': query,
        'ordering': '-average_rating'
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(url, params=params, timeout=10) as response:
                if response.status == 200:
                    return await response.json()
                
                # Handle non-200 responses
                return {"error": f"API Error: Status {response.status}", "details": await response.text()}
        except aiohttp.ClientConnectorError:
            return {"error": "Connection Error", "details": "Could not connect to the Django API. Ensure your Django server is running."}
        except Exception as e:
            return {"error": "Request Failed", "details": str(e)}


# --- Search Handler ---
@router.message(Command("search_title", "search_author"))
async def command_search_handler(message: Message, command: CommandObject) -> None:
    """
    Handles search commands, calls the local search API, and presents results 
    with inline buttons linking to the web app.
    """
    
    if not command.args:
        await message.reply("لطفاً بعد از دستور، عنوان یا نام نویسنده مورد نظر خود را وارد کنید.")
        return

    full_query = command.args.strip()
    
    await message.answer(f"⏳ در حال جستجوی کتاب‌های محلی برای: <b>{full_query}</b>...", parse_mode='HTML')

    results = await search_books_api(full_query)

    # 3. Process and Display Results
    if "error" in results:
        await message.reply(f"❌ خطای API: {results['error']}")
        return
    
    books: List[Dict[str, Any]] = results.get('results', [])
    total_count = results.get('count', 0) 
    
    if not books:
        response_text = f"متأسفانه هیچ کتابی برای '<b>{full_query}</b>' در دیتابیس محلی پیدا نشد."
        # Send message without any keyboard
        await message.answer(response_text, parse_mode='HTML')
        return

    # --- Generate Content and Inline Keyboard ---
    books_display = books[:5]
    inline_buttons = [] # List of lists of InlineKeyboardButton

    response_lines = [
        f"✅ <b>نتایج جستجوی محلی برای '{full_query}'</b> ({total_count} نتیجه پیدا شد):\n"
    ]
    
    for i, book in enumerate(books_display, 1):
        title = book.get('title', 'عنوان نامشخص')
        book_id = book.get('parent_asin') 
        
        authors = book.get('authors', [])
        if authors and isinstance(authors, list) and len(authors) > 0:
            author_display = authors[0].get('name', 'نامشخص')
        else:
            author_display = 'نامشخص'
        rating = book.get('average_rating', 'بدون امتیاز')
        
        line = (
            f"{i} <b>{title}</b>\n"
            f"   نویسنده: <i>{author_display}</i>\n"
            f"   امتیاز: {rating} (بر اساس {book.get('rating_number', 0)} رأی)\n"
        )
        response_lines.append(line)
        
        # 💡 Logic to create the Inline Button with the direct link
        if book_id:
            # Assuming the web app detail page URL is like: /books/{id}
            webapp_url = f"{WEBAPP_BASE_URL}/api1/books/{book_id}" 
            
            # Create button to link directly to the web app
            button = InlineKeyboardButton(
                text=f"🔗 مشاهده جزئیات '{title[:20]}'...", 
                url=webapp_url
            )
            inline_buttons.append([button]) # Add button in its own row

    
    response_lines.append(
        "\n💡 این نتایج بر اساس <b>میانگین امتیاز</b> مرتب شده‌اند. برای مشاهده جزئیات، نقدها و امتیازدهی، لطفاً از دکمه‌های زیر استفاده کنید."
    )
    
    response_text = "\n".join(response_lines)
    
    # Create the final keyboard markup
    reply_markup = InlineKeyboardMarkup(inline_keyboard=inline_buttons)
        
    # Send the final message with the keyboard
    await message.answer(response_text, parse_mode='HTML', reply_markup=reply_markup)


# === INLINE QUERY (SEARCH BOOKS) ===
@router.inline_query()
async def inline_book_search(inline_query: InlineQuery):
    query = inline_query.query.strip()
    if not query:
        return

    url = f"{DJANGO_API_BASE_URL}/books/?search={query}"
    results = []

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status == 200:
                data = await resp.json()
                for book in data.get("results", [])[:50]:
                    title = book.get("title", "بدون عنوان")
                    subtitle = book.get("subtitle", "")
                    thumb = book.get("cover", "")
                    book_id = book.get("parent_asin", "")

                    text = f"/review {book_id}"
                    results.append(
                        InlineQueryResultArticle(
                            id=str(uuid.uuid4()),
                            title=title,
                            description=subtitle,
                            input_message_content=InputTextMessageContent(message_text=text),
                            thumb_url=thumb
                        )
                    )
            else:
                logger.error(f"Inline search failed: {resp.status}")

    await inline_query.answer(results, cache_time=1)


