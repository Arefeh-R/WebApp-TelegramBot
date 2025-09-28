import json
import psycopg2
from datetime import datetime
from typing import Set, Dict, Any, List, Tuple
import os

# --- CONFIGURATION ---
# IMPORTANT: Replace these placeholders with your actual database credentials
DB_CONFIG = {
    "host": "localhost",
    "port": "5432",
    "database": "webapp_bot",
    "user": "postgres",
    "password": "1111",
}
JSONL_FILE_PATH = "C:Users\ASUS\Downloads\Programs\Books.jsonl"
BATCH_SIZE = 5000  # Number of reviews to insert per database commit
# ---------------------

def epoch_ms_to_datetime(epoch_ms: int) -> datetime:
    """Converts an epoch timestamp in milliseconds to a datetime object."""
    if epoch_ms is None:
        return None
    # Convert milliseconds to seconds
    return datetime.fromtimestamp(epoch_ms / 1000)

def get_existing_book_asins(conn: psycopg2.extensions.connection) -> Set[str]:
    """
    Fetches all 221,000 existing parent_asin values into a Python set for fast lookup.
    This step is crucial for performance with millions of incoming records.
    """
    print("STEP 1: Fetching existing book IDs from the 'books' table...")
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT parent_asin FROM books;")
            asins = {row[0] for row in cur.fetchall()}
            print(f"SUCCESS: Found {len(asins)} valid book ASINs.")
            return asins
    except Exception as e:
        print(f"FATAL ERROR: Could not fetch book ASINs: {e}")
        return set()

def execute_batch_insert(cur: psycopg2.extensions.cursor, batch: List[Tuple]):
    """Inserts a batch of records using psycopg2's optimized executemany."""
    insert_sql = """
    INSERT INTO reviews (
        book_id, user_id, rating, title, review_text, helpful_vote, 
        verified_purchase, review_date, images_jsonb, created_at, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW()
    );
    """
    cur.executemany(insert_sql, batch)

def import_reviews_from_jsonl():
    """Reads JSONL data, validates, and imports in optimized batches."""
    
    conn = None
    records_to_insert: List[Tuple] = []
    total_inserted = 0
    total_skipped = 0
    total_processed = 0
    
    try:
        # 1. Connect to the database
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False # Manage transactions manually
        
        # 2. Get the list of valid book ASINs (the 221,000 primary keys)
        valid_asins = get_existing_book_asins(conn)
        if not valid_asins:
            print("Aborting import.")
            return

        # 3. Process the large JSONL file
        print(f"\nSTEP 2: Starting batch import (Batch size: {BATCH_SIZE})...")
        with conn.cursor() as cur:
            with open(JSONL_FILE_PATH, 'r', encoding='utf-8') as f:
                for line in f:
                    total_processed += 1
                    try:
                        review_data: Dict[str, Any] = json.loads(line)
                        parent_asin = review_data.get('parent_asin')
                        
                        # Validate against the in-memory set (fast)
                        if parent_asin not in valid_asins:
                            total_skipped += 1
                            continue # Skip this review
                            
                        # Prepare the tuple for batch insertion
                        record = (
                            parent_asin,                                        # book_id
                            review_data.get('user_id'),                         # user_id
                            review_data.get('rating'),                          # rating
                            review_data.get('title'),                           # title
                            review_data.get('text'),                            # review_text
                            review_data.get('helpful_vote', 0),                 # helpful_vote
                            review_data.get('verified_purchase', False),        # verified_purchase
                            epoch_ms_to_datetime(review_data.get('timestamp')), # review_date
                            json.dumps(review_data.get('images', [])),          # images_jsonb (serialized)
                        )
                        records_to_insert.append(record)

                        # Check for batch limit
                        if len(records_to_insert) >= BATCH_SIZE:
                            execute_batch_insert(cur, records_to_insert)
                            conn.commit()
                            total_inserted += len(records_to_insert)
                            print(f"Inserted {total_inserted} records (Skipped: {total_skipped}). Last processed line: {total_processed}")
                            records_to_insert = [] # Clear the batch list

                    except json.JSONDecodeError:
                        print(f"Skipping badly formatted JSON line at line {total_processed}")
                    except Exception as e:
                        print(f"Error processing review data at line {total_processed}: {e}")
                        conn.rollback() # Rollback the current batch on error
                        
            # 4. Insert any remaining records after the loop
            if records_to_insert:
                execute_batch_insert(cur, records_to_insert)
                conn.commit()
                total_inserted += len(records_to_insert)

        print("\n--- Import Complete ---")
        print(f"Total lines processed: {total_processed}")
        print(f"Successfully inserted: {total_inserted} reviews.")
        print(f"Skipped (book not found or error): {total_processed - total_inserted} reviews.")
        print("-----------------------")

    except psycopg2.OperationalError as e:
        print(f"Database Connection Error: Check your DB_CONFIG settings.")
        print(e)
    except FileNotFoundError:
        print(f"Error: JSONL file not found at path: {JSONL_FILE_PATH}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    # Helper to create a dummy file if the real 20GB file isn't present
    if not os.path.exists(JSONL_FILE_PATH):
        print(f"Warning: JSONL file not found at {JSONL_FILE_PATH}")
            
    import_reviews_from_jsonl()
