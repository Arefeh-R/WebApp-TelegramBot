from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

inline_buttons_keyboard = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="Button 1", callback_data="button1"),
     InlineKeyboardButton(text="Button 2", callback_data="button2")]
])
