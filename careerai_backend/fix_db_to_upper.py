import sqlite3

def fix_db_upper():
    try:
        conn = sqlite3.connect('careerai_fallback.db')
        cursor = conn.cursor()
        
        # fix Title Case -> UPPERCASE
        cursor.execute("UPDATE job_applications SET status = 'PENDING' WHERE status = 'Pending' OR status = 'PENDING'")
        print(f"Updated {cursor.rowcount} Pending -> PENDING")

        cursor.execute("UPDATE job_applications SET status = 'APPLIED' WHERE status = 'Applied' OR status = 'APPLIED'")
        print(f"Updated {cursor.rowcount} Applied -> APPLIED")

        cursor.execute("UPDATE job_applications SET status = 'REVIEWING' WHERE status = 'Reviewing' OR status = 'REVIEWING'")
        print(f"Updated {cursor.rowcount} Reviewing -> REVIEWING")

        cursor.execute("UPDATE job_applications SET status = 'INTERVIEW' WHERE status = 'Interview' OR status = 'INTERVIEW'")
        print(f"Updated {cursor.rowcount} Interview -> INTERVIEW")
        
        cursor.execute("UPDATE job_applications SET status = 'REJECTED' WHERE status = 'Rejected' OR status = 'REJECTED'")
        print(f"Updated {cursor.rowcount} Rejected -> REJECTED")

        cursor.execute("UPDATE job_applications SET status = 'OFFER' WHERE status = 'Offer' OR status = 'OFFER'")
        print(f"Updated {cursor.rowcount} Offer -> OFFER")

        cursor.execute("UPDATE job_applications SET status = 'ACCEPTED' WHERE status = 'Accepted' OR status = 'ACCEPTED'")
        print(f"Updated {cursor.rowcount} Accepted -> ACCEPTED")

        conn.commit()
        conn.close()
        print("Database update to UPPERCASE complete.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_db_upper()
