from aiogram import Router
from aiogram.types import CallbackQuery

router = Router()

@router.callback_query(lambda c: c.data == 'button')
async def process_callback_button(callback_query: CallbackQuery):
    await callback_query.answer("Button pressed!")
