
import json

file = "A:\WebApp-TelegramBot\webapp_telegrambot\scripts\sample.jsonl"

with open(file, 'r') as fp:
    for line in fp:
        print(json.loads(line.strip()))