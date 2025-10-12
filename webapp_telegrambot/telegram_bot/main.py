import os
import sys

# Add the project root to Python path
#sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webapp_telegrambot.settings')

import django
django.setup()

import asyncio
import logging
from aiogram import Dispatcher
from aiogram.types import BotCommand
from .config import BOT_TOKEN
from .bot import create_bot, setup_dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """
    Initializes the bot and starts the polling loop.
    """
    if not BOT_TOKEN:
        logger.error("BOT_TOKEN is missing. Please set the environment variable.")
        return

    # 1. Initialization
    bot = create_bot(BOT_TOKEN)
    me = await bot.get_me()
    logger.info(f"Bot info: {me}")

    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)
    # 2. Setup (Register Handlers/Routers)
    setup_dispatcher(dp)

    # 3. Start Polling
    logger.info("Starting Telegram Bot Polling...")
    # skip_updates=True prevents processing backlog messages on startup
    await dp.start_polling(bot, skip_updates=True)

if __name__ == '__main__':
    # This block runs when you execute 'python telegram_bot/main.py'
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user via KeyboardInterrupt.")
    except Exception as e:
        logger.error(f"Critical error during bot execution: {e}", exc_info=True)
