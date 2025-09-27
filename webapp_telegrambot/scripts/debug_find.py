import json
import re

def extract_names(rec):
    a = rec.get("author") or rec.get("authors") or rec.get("store") or rec.get("contributors")
    names = []
    if isinstance(a, dict):
        if a.get("name"):
            names.append(a["name"])
    elif isinstance(a, list):
        for it in a:
            if isinstance(it, dict) and it.get("name"):
                names.append(it["name"])
            elif isinstance(it, str):
                names.append(it)
    elif isinstance(a, str):
        names += [p.strip() for p in re.split(r",|;|\band\b", a) if p.strip()]
    return names

def debug_file(file_path, author_query, max_lines=1000000):
    q = author_query.lower().strip()
    total = 0
    matched_count = 0
    with open(file_path, "r", encoding="utf-8") as fh:
        for i, line in enumerate(fh, 1):
            if not line.strip():
                continue
            try:
                rec = json.loads(line)
            except Exception as e:
                # show parse errors if you want to inspect them
                print(f"line {i}: parse error: {e}")
                continue
            names = extract_names(rec)
            matched = any(q in n.lower() for n in names if isinstance(n, str))
            if names:
                total += 1
                if matched:
                    author_info = rec.get("author") or rec.get("authors")
                    try:
                        print(f"line {i}: names={names} matched={matched} about={rec.get('price')!r}")                    
                    except Exception as e:
                    # show parse errors if you want to inspect them
                        print(f"line {i}: parse error: {e}")
                        continue
                    matched_count += 1
            # limit output for huge files
            if i >= max_lines:
                break
    print(f"examined lines: {i}, records with extracted names: {total}, matches: {matched_count}")

# Example:
debug_file(r"C:/Users/ASUS/Downloads/Programs/meta_Books.jsonl", "Francis O'Gorman")