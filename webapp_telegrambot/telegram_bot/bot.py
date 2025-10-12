import logging
from aiogram import Bot
from aiogram import Dispatcher
from aiogram.client.default import DefaultBotProperties
from .handlers import *

logger = logging.getLogger(__name__)

def setup_dispatcher(dp: Dispatcher) -> None:
    """
    Registers all routers, middlewares, and filters to the Dispatcher.
    """
    
    # --- 1. Register Middlewares (Optional) ---
    # dp.message.middleware(...)
    
    # --- 2. Register Routers ---
    # The order of registration matters for command handling
    dp.include_router(menu_router)
    dp.include_router(search_router)
    dp.include_router(help_router)
    dp.include_router(callbacks_router)
    dp.include_router(errors_router)
    dp.include_router(login_router)
    dp.include_router(group_router)
    dp.include_router(request_group_router)
    dp.include_router(admin_router)
    dp.include_router(review_router) 
    dp.include_router(topic_router)

    
    logger.info("All handlers and routers registered.")


def create_bot(token: str) -> Bot:
    """
    Initializes and returns the Bot instance.
    """
    if not token:
        raise ValueError("Bot Token is missing.")
        
    # parse_mode="HTML" is a good default for rich formatting
    bot = Bot(token=token, default=DefaultBotProperties(parse_mode="HTML"))
    return bot
