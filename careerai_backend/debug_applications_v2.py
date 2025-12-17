import sqlite3

def inspect_db():
    try:
        conn = sqlite3.connect('careerai_fallback.db')
        cursor = conn.cursor()
        
        with open('db_dump_after_fix.txt', 'w') as f:
            f.write("=== APPLICATIONS ===\n")
            cursor.execute("SELECT id, job_id, user_id, status FROM job_applications")
            for row in cursor.fetchall():
                f.write(f"{row}\n")

        conn.close()
    except Exception as e:
        with open('db_dump_after_fix.txt', 'w') as f:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    inspect_db()
