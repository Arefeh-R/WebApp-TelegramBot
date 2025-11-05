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

# keyboards/main_menu.py

def get_search_menu():
    """Search submenu with inline and external options"""
    keyboard = [
        [InlineKeyboardButton(
            text="🔎 جستجوی سریع (Inline)", 
            switch_inline_query_current_chat=""
        )],
        [InlineKeyboardButton(
            text="🌐 جستجوی گسترده", 
            callback_data="search_external"
        )],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_external_search_menu():
    """External search type selection"""
    keyboard = [
        [InlineKeyboardButton(text="📖 جستجو با عنوان", callback_data="ext_search_title")],
        [InlineKeyboardButton(text="✒️ جستجو با نویسنده", callback_data="ext_search_author")],
        [InlineKeyboardButton(text="🔢 جستجو با ISBN", callback_data="ext_search_isbn")],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="menu_search")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_account_menu():
    """Account submenu"""
    keyboard = [
        [InlineKeyboardButton(text="🔐 ورود به حساب", callback_data="account_login")],
        [InlineKeyboardButton(text="📊 وضعیت حساب", callback_data="account_status")],
        [InlineKeyboardButton(text="🚪 خروج از حساب", callback_data="account_logout")],
        [InlineKeyboardButton(text="✍️نقد های من ", callback_data="account_reviews")],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_groups_menu():
    """Groups submenu"""
    keyboard = [
        [InlineKeyboardButton(text="📋 لیست گروه‌ها", callback_data="groups_list")],
        [InlineKeyboardButton(text="🔙 بازگشت", callback_data="main_menu")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=keyboard)