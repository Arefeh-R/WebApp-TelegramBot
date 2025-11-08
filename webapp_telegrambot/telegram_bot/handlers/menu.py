
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery
from aiogram.filters import Command
from ..keyboards.main_menu import get_user_menu, get_admin_menu

router = Router()

@router.message(Command("start"))
async def show_main_menu(message: Message):
    """Show main menu with buttons"""
    user_name = message.from_user.full_name
    welcome_text = (
        f"👋 درود بر شما، {user_name}!\n\n"
        "به ربات باشگاه کتاب خوش آمدید.\n"
        "لطفاً یکی از گزینه‌های زیر را انتخاب کنید:"
    )
    
    # Check if user is admin (not implemented yet)
    is_admin = False  # Replace with actual admin check
    
    if is_admin:
        markup = get_admin_menu()
    else:
        markup = get_user_menu()
    
    await message.answer(welcome_text, reply_markup=markup)

@router.callback_query(F.data == "main_menu")
async def back_to_main_menu(callback: CallbackQuery):
    """Return to main menu"""
    await callback.message.edit_text(
        "📚 منوی اصلی:\nلطفاً یکی از گزینه‌های زیر را انتخاب کنید:",
        reply_markup=get_user_menu()
    )
    await callback.answer()
    
