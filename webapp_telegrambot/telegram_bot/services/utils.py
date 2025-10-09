from aiogram import Bot
from django.conf import settings

bot = Bot(token=settings.BOT_TOKEN)

async def create_telegram_topic(group):
    try:
        topic = await bot.create_forum_topic(
            chat_id=settings.TELEGRAM_FORUM_CHAT_ID,
            name=group.name,
        )
        return topic.message_thread_id
    except Exception as e:
        print(f"Error creating topic: {e}")
        return None
