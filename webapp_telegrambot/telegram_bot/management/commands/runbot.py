from django.core.management.base import BaseCommand
import asyncio
from telegram_bot.main import main

class Command(BaseCommand):
    help = 'Run the Telegram bot'

    def handle(self, *args, **options):
        asyncio.run(main())
