
import json

file = "C:Users\ASUS\Downloads\Programs\meta_Books.jsonl"
with open(file, 'r') as fp:
    i = 0
    for line in fp:
        if i == 100:
            break
        print(json.loads(line.strip()))
        print()
        i += 1