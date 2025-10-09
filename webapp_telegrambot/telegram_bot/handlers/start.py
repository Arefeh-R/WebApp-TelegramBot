from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command

router = Router()

@router.message(Command("start"))
async def command_start_handler(message: Message) -> None:
    """
    Handles the /start command.
    """
    user_name = message.from_user.full_name
    welcome_message = (
        f"👋 درود بر شما، {user_name}!\n\n"
        "به ربات باشگاه کتاب خوش آمدید. من اینجا هستم تا به شما در مدیریت چالش‌های خواندن، جستجوی کتاب و بحث‌های گروهی کمک کنم.\n\n"
        "لطفاً از /help برای دیدن لیست دستورات استفاده کنید."
    )

    await message.answer(welcome_message)