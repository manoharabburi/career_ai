import sqlite3

def inspect_db():
    try:
        conn = sqlite3.connect('careerai_fallback.db')
        cursor = conn.cursor()
        
        with open('db_dump.txt', 'w') as f:
            f.write("=== USERS ===\n")
            cursor.execute("SELECT id, email, first_name, last_name, role FROM users")
            for row in cursor.fetchall():
                f.write(f"{row}\n")

            f.write("\n=== JOBS ===\n")
            cursor.execute("SELECT id, title, posted_by FROM jobs")
            for row in cursor.fetchall():
                f.write(f"{row}\n")

            f.write("\n=== APPLICATIONS ===\n")
            cursor.execute("SELECT id, job_id, user_id, status FROM job_applications")
            for row in cursor.fetchall():
                f.write(f"{row}\n")

        conn.close()
    except Exception as e:
        with open('db_dump.txt', 'w') as f:
            f.write(f"Error: {e}")

if __name__ == "__main__":
    inspect_db()
