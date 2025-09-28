
import json

file = "C:Users\ASUS\Downloads\Programs\meta_Books.jsonl"
with open(file, 'r') as fp:
    i = 0
    for line in fp:
        if i == 50:
            break
        if json.loads(line.strip()).get('author') is None:
            print(json.loads(line.strip()))
        i += 1