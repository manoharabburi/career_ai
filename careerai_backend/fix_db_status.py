import sqlite3

def fix_db():
    try:
        conn = sqlite3.connect('careerai_fallback.db')
        cursor = conn.cursor()
        
        # fix PENDING -> Pending
        cursor.execute("UPDATE job_applications SET status = 'Pending' WHERE status = 'PENDING'")
        print(f"Updated {cursor.rowcount} PENDING -> Pending")

        # fix REVIEWING -> Reviewing
        cursor.execute("UPDATE job_applications SET status = 'Reviewing' WHERE status = 'REVIEWING'")
        print(f"Updated {cursor.rowcount} REVIEWING -> Reviewing")

        # fix INTERVIEW -> Interview
        cursor.execute("UPDATE job_applications SET status = 'Interview' WHERE status = 'INTERVIEW'")
        print(f"Updated {cursor.rowcount} INTERVIEW -> Interview")
        
        # fix REJECTED -> Rejected
        cursor.execute("UPDATE job_applications SET status = 'Rejected' WHERE status = 'REJECTED'")
        print(f"Updated {cursor.rowcount} REJECTED -> Rejected")

        # fix APPLIED -> Applied (just in case)
        cursor.execute("UPDATE job_applications SET status = 'Applied' WHERE status = 'APPLIED'")
        print(f"Updated {cursor.rowcount} APPLIED -> Applied")

        conn.commit()
        conn.close()
        print("Database update complete.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_db()
