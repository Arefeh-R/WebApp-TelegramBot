from aiogram.types import ReplyKeyboardMarkup, KeyboardButton

main_menu_keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
main_menu_keyboard.add(
    KeyboardButton("Option 1"),
    KeyboardButton("Option 2")
)
