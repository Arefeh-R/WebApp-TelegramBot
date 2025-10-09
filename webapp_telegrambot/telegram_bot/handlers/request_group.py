from aiogram import Router, types
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.context import FSMContext
import aiohttp
from config import DJANGO_API_BASE_URL
from .login_commands import get_token_by_telegram

router = Router()

class RequestGroupStates(StatesGroup):
    name = State()
    description = State()


async def start_request_group(message: types.Message, state: FSMContext):
    """This function starts the FSM (used by /request_group or inline button)."""
    await message.answer("📛 لطفاً نام گروه مورد نظر خود را وارد کنید:")
    await state.set_state(RequestGroupStates.name)


@router.message(RequestGroupStates.name)
async def get_group_name(message: types.Message, state: FSMContext):
    await state.update_data(name=message.text)
    await state.set_state(RequestGroupStates.description)
    await message.answer("📝 لطفاً توضیحات گروه را وارد کنید:")


@router.message(RequestGroupStates.description)
async def get_group_description(message: types.Message, state: FSMContext):
    data = await state.get_data()
    name = data["name"]
    description = message.text

    async with aiohttp.ClientSession() as session:
        token = await get_token_by_telegram(session, message.from_user.id)
        if not token:
            await message.answer("⚠️ ابتدا با دستور /login حساب خود را لینک کنید.")
            await state.clear()
            return

        headers = {"Authorization": f"Bearer {token}"}
        payload = {"name": name, "description": description}

        async with session.post(
            f"{DJANGO_API_BASE_URL}/groups/request_group/",
            json=payload,
            headers=headers,
        ) as resp:
            if resp.status == 201:
                await message.answer("✅ درخواست شما ارسال شد و منتظر تأیید مدیر است.")
            else:
                text = await resp.text()
                await message.answer(f"❌ خطا در ارسال درخواست: {text}")

    await state.clear()
