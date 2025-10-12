from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

def get_user_menu():
    """Main menu for regular users"""
    keyboard = [
        [InlineKeyboardButton(text="🔍 جستجوی کتاب", callback_data="menu_search")],
        [InlineKeyboardButton(text="👥 گروه‌های کتابخوانی", callback_data="menu_groups")],
        [InlineKeyboardButton(text="✍️ نقد و بررسی", callback_data="menu_reviews")],
        [InlineKeyboardButton(text="👤 حساب کاربری", callback_data="menu_account")],
        [InlineKeyboardButton(text="❓ راهنما", callback_data="menu_help")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_admin_menu():
    """Menu for admins"""
    keyboard = [
        [InlineKeyboardButton(text="🔍 جستجوی کتاب", callback_data="menu_search")],
        [InlineKeyboardButton(text="👥 مدیریت گروه‌ها", callback_data="menu_admin_groups")],
        [InlineKeyboardButton(text="⚙️ ابزارهای مدیریت", callback_data="menu_admin_tools")],
        [InlineKeyboardButton(text="👤 حساب کاربری", callback_data="menu_account")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_search_menu():
    """Search submenu"""
    keyboard = [
        [InlineKeyboardButton(text="📖 جستجو بر اساس عنوان", callback_data="search_title")],
        [InlineKeyboardButton(text="✒️ جستجو بر اساس نویسنده", callback_data="search_author")],
        [InlineKeyboardButton(text="🔢 جستجو با ISBN", callback_data="search_isbn")],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_account_menu():
    """Account submenu"""
    keyboard = [
        [InlineKeyboardButton(text="🔐 ورود به حساب", callback_data="account_login")],
        [InlineKeyboardButton(text="📊 وضعیت حساب", callback_data="account_status")],
        [InlineKeyboardButton(text="🚪 خروج از حساب", callback_data="account_logout")],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_groups_menu():
    """Groups submenu"""
    keyboard = [
        [InlineKeyboardButton(text="📋 لیست گروه‌ها", callback_data="groups_list")],
        [InlineKeyboardButton(text="➕ درخواست گروه جدید", callback_data="groups_request")],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)