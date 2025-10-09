from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

inline_buttons_keyboard = InlineKeyboardMarkup()
inline_buttons_keyboard.add(
    InlineKeyboardButton("Button 1", callback_data="button1"),
    InlineKeyboardButton("Button 2", callback_data="button2")
)
