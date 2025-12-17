# Quick Start Guide - CareerAI Backend

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd careerai_backend

# Run setup script (Windows PowerShell)
.\setup.ps1
```

Or manually:

```bash
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt
```

### Step 2: Configure Database

**Option A: Quick PostgreSQL Setup**

```powershell
# Start PostgreSQL and create database
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE careerai;
CREATE USER careerai_user WITH PASSWORD 'careerai123';
GRANT ALL PRIVILEGES ON DATABASE careerai TO careerai_user;
\q
```

**Option B: Use SQLite for Testing**

Edit `config.py` to use SQLite (no PostgreSQL needed):

```python
# Change this line in config.py:
DATABASE_URL: str = Field(
    default="sqlite:///./careerai.db",  # SQLite for quick testing
    env="DATABASE_URL"
)
```

### Step 3: Configure Environment

Create `.env` file (or copy from `.env.example`):

```env
DATABASE_URL=postgresql://careerai_user:careerai123@localhost:5432/careerai
JWT_SECRET_KEY=your-super-secret-key-min-32-chars-long-change-this-now
JWT_ALGORITHM=HS256
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Generate a secure JWT secret:**

```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Initialize Database

```bash
# Create tables and sample data
python init_db.py
```

This creates:
- Database tables
- Admin user: `admin@careerai.com / admin123`
- Student user: `student@example.com / student123`
- Employer user: `employer@techcorp.com / employer123`
- 3 sample job postings

### Step 5: Start Server

```bash
# Start the server
python main.py
```

Or with auto-reload:

```bash
uvicorn main:app --reload
```

### Step 6: Test the API

**Visit Interactive Docs:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Quick API Test:**

```bash
# Login as student
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"student123"}'

# Get jobs list
curl http://localhost:8000/api/jobs
```

## 📱 Connect Frontend

Update your React app to connect to the backend:

```typescript
// In your React app constants or config file
export const API_BASE_URL = 'http://localhost:8000/api';

// Example: Login function
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  // Store token
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  
  return data;
}

// Example: Fetch jobs
async function getJobs() {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

## 🔑 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@careerai.com | admin123 | Full system access |
| Student | student@example.com | student123 | Apply to jobs, upload resume |
| Employer | employer@techcorp.com | employer123 | Post jobs, view applicants |

## 📋 Common Tasks

### Create New User (Student)

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstudent@example.com",
    "password": "password123",
    "first_name": "Alice",
    "last_name": "Johnson",
    "role": "STUDENT"
  }'
```

### Post a Job (Employer)

```bash
# First login as employer to get token
TOKEN="<your_access_token>"

curl -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Backend Developer",
    "description": "Looking for a skilled backend developer",
    "location": "Remote",
    "job_type": "FULL_TIME",
    "salary_range": "$100,000 - $140,000",
    "company_name": "MyCompany",
    "requirements": ["Python", "FastAPI", "PostgreSQL"]
  }'
```

### Upload Resume (Student)

```bash
TOKEN="<student_access_token>"

curl -X POST http://localhost:8000/api/resumes/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/resume.pdf" \
  -F "is_primary=true"
```

### Apply for Job

```bash
TOKEN="<student_access_token>"

curl -X POST http://localhost:8000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "job_id": "<job_id>"
  }'
```

## 🐛 Troubleshooting

### Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution:** Make sure PostgreSQL is running:

```powershell
# Check if PostgreSQL is running
Get-Service -Name postgresql*

# Start PostgreSQL service
Start-Service postgresql-x64-14  # Adjust version number
```

### Import Errors

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:** Activate virtual environment and install dependencies:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### JWT Secret Key Error

```
ValueError: JWT secret key must be at least 32 characters
```

**Solution:** Generate a proper secret key:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output to your `.env` file as `JWT_SECRET_KEY`.

### Port Already in Use

```
ERROR: [Errno 10048] error while attempting to bind on address
```

**Solution:** Either stop the other process or use a different port:

```bash
uvicorn main:app --reload --port 8001
```

## 🔄 Database Reset

To reset the database and start fresh:

```powershell
# Drop and recreate database
psql -U postgres -c "DROP DATABASE careerai;"
psql -U postgres -c "CREATE DATABASE careerai;"

# Reinitialize
python init_db.py
```

## 📊 View Database

**Using psql:**

```bash
psql -U careerai_user -d careerai

# List tables
\dt

# View users
SELECT email, role, status FROM users;

# View jobs
SELECT title, company_name, location FROM jobs;

# Quit
\q
```

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to localhost
3. Navigate to careerai database
4. Browse tables under public schema

## 🚀 Production Deployment

See `README.md` for detailed deployment instructions including:
- Docker deployment
- Environment configuration
- Security best practices
- Performance optimization
- Monitoring setup

## 📖 Next Steps

1. ✅ Backend running successfully
2. 📱 Connect your React frontend
3. 🎨 Customize the AI analysis functions
4. 🔐 Add real OpenAI/Gemini API keys
5. 🚀 Deploy to production

## 💬 Need Help?

- Check `README.md` for detailed documentation
- Visit http://localhost:8000/docs for API reference
- Review the code comments in each file

Happy coding! 🎉
