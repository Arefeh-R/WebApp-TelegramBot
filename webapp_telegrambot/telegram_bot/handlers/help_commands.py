from aiogram import Router
from aiogram.types import Message
from aiogram.filters import Command

router = Router()

@router.message(Command("help"))
async def command_help_handler(message: Message) -> None:
    """
    Handles the /help command.
    """
    help_text = (
        "<b>📚 راهنمای استفاده از ربات 📚</b>\n\n"
        "<b>توابع پایه:</b>\n"
        "• /search_title عنوان : جستجوی کتاب بر اساس عنوان\n"
        "• /search_author نویسنده : جستجوی کتاب بر اساس نویسنده\n\n"
        "<b>قابلیت‌های باشگاه:</b>\n"
        "• /challenge_list : مشاهده چالش‌های خواندن فعال\n"
        "• /leaderboard : مشاهده جدول امتیازات گروه\n"
        "• /vote : رأی‌گیری برای انتخاب کتاب بعدی (فقط در گروه‌ها)\n\n"
        "💡 <i>نکته: برای دسترسی کامل به جزئیات، باید به وب‌اپ ما متصل باشید</i>"
    )
    await message.answer(help_text,parse_mode='HTML')