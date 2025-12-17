"""
Database initialization script
Creates initial admin user and sample data
"""

from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv
from database import SessionLocal, engine, Base
from models import User, Job, UserRole, UserStatus, JobType
from core_auth import AuthService
from datetime import datetime

def init_db():
    """Initialize database with tables and initial data"""
    
    # Load .env if present
    load_dotenv()

    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")
    
    db: Session = SessionLocal()
    
    try:
        # Admin credentials from env or defaults
        admin_email = os.getenv("ADMIN_EMAIL", "admin@careerai.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")

        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print("⚠ Admin user already exists. Skipping initial data creation.")
            return
        
        print("\nCreating initial admin user...")
        
        # Create admin user
        admin_user = User(
            email=admin_email,
            hashed_password=AuthService.hash_password(admin_password),
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow()
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✓ Admin user created")
        print(f"  Email: {admin_email}")
        print(f"  Password: {admin_password}")
        print(f"  ⚠ IMPORTANT: Change this password after first login!")
        
        # Create sample student user
        print("\nCreating sample student user...")
        
        student_user = User(
            email="student@example.com",
            hashed_password=AuthService.hash_password("student123"),
            first_name="John",
            last_name="Doe",
            role=UserRole.STUDENT,
            status=UserStatus.ACTIVE,
            university="Stanford University",
            major="Computer Science",
            graduation_year="2024",
            gpa="3.8",
            skills=["Python", "JavaScript", "React", "SQL", "Machine Learning"],
            certifications=["AWS Cloud Practitioner", "Google Data Analytics"],
            location="San Francisco, CA",
            created_at=datetime.utcnow()
        )
        
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        
        print("✓ Sample student created")
        print(f"  Email: student@example.com")
        print(f"  Password: student123")
        
        # Create sample employer user
        print("\nCreating sample employer user...")
        
        employer_user = User(
            email="employer@techcorp.com",
            hashed_password=AuthService.hash_password("employer123"),
            first_name="Jane",
            last_name="Smith",
            role=UserRole.EMPLOYER,
            status=UserStatus.ACTIVE,
            location="New York, NY",
            created_at=datetime.utcnow()
        )
        
        db.add(employer_user)
        db.commit()
        db.refresh(employer_user)
        
        print("✓ Sample employer created")
        print(f"  Email: employer@techcorp.com")
        print(f"  Password: employer123")
        
        # Create sample jobs
        print("\nCreating sample job postings...")
        
        sample_jobs = [
            {
                "title": "Senior Software Engineer",
                "description": "We're looking for an experienced software engineer to join our team and work on cutting-edge projects.",
                "location": "San Francisco, CA",
                "job_type": JobType.FULL_TIME,
                "salary_range": "$120,000 - $180,000",
                "company_name": "TechCorp",
                "company_description": "Leading technology company focused on innovation",
                "requirements": [
                    "5+ years of software development experience",
                    "Strong knowledge of Python and JavaScript",
                    "Experience with cloud platforms (AWS/GCP)",
                    "Excellent problem-solving skills"
                ],
                "posted_by": employer_user.id,
                "posted_date": datetime.utcnow(),
                "is_active": True
            },
            {
                "title": "Full Stack Developer",
                "description": "Join our team to build modern web applications using React and Node.js.",
                "location": "Remote",
                "job_type": JobType.FULL_TIME,
                "salary_range": "$90,000 - $130,000",
                "company_name": "TechCorp",
                "company_description": "Leading technology company focused on innovation",
                "requirements": [
                    "3+ years of full-stack development",
                    "Proficiency in React and Node.js",
                    "Experience with RESTful APIs",
                    "Strong CSS and responsive design skills"
                ],
                "posted_by": employer_user.id,
                "posted_date": datetime.utcnow(),
                "is_active": True
            },
            {
                "title": "Data Science Intern",
                "description": "Exciting internship opportunity to work on real-world data science projects.",
                "location": "New York, NY",
                "job_type": JobType.INTERNSHIP,
                "salary_range": "$25 - $35 per hour",
                "company_name": "TechCorp",
                "company_description": "Leading technology company focused on innovation",
                "requirements": [
                    "Currently pursuing degree in Computer Science or related field",
                    "Knowledge of Python and data analysis libraries",
                    "Familiarity with machine learning concepts",
                    "Strong analytical skills"
                ],
                "posted_by": employer_user.id,
                "posted_date": datetime.utcnow(),
                "is_active": True
            }
        ]
        
        for job_data in sample_jobs:
            job = Job(**job_data)
            db.add(job)
        
        db.commit()
        
        print(f"✓ Created {len(sample_jobs)} sample job postings")
        
        print("\n" + "="*50)
        print("Database initialization complete!")
        print("="*50)
        print("\nTest accounts created:")
        print("  Admin:    admin@careerai.com / admin123")
        print("  Student:  student@example.com / student123")
        print("  Employer: employer@techcorp.com / employer123")
        print("\nYou can now start the server with: python main.py")
        print("API Documentation: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"\n✗ Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
