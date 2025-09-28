
import json

file = "C:Users\ASUS\Downloads\Programs\Books.jsonl"
with open(file, 'r') as fp:
    i = 0
    for line in fp:
        if i == 10:
            break
        print(json.loads(line.strip()))
        print()
        i += 1