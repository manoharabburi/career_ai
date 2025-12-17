# CareerAI Backend - Intelligent Job Portal

Complete FastAPI backend for the CareerAI job portal with AI-powered resume analysis, job matching, and career counseling.

## Features

### Authentication & User Management
- JWT-based authentication with access and refresh tokens
- Role-based access control (Student, Employer, Admin)
- User profile management with student-specific fields
- Account status management (Active, Pending, Suspended)

### Job Management
- Job posting and management (Employer)
- Advanced job search with filters (location, type, keywords)
- Job recommendations based on skills
- Applicant tracking system

### Resume Management
- Resume upload (PDF, DOCX)
- Resume parsing and skill extraction
- Resume versioning and primary resume selection
- Secure file storage

### AI-Powered Analysis
- Resume analysis with scoring and feedback
- Job-resume matching with compatibility scores
- Skill gap analysis
- Career path recommendations
- Personalized career roadmaps

### Applications
- Job application submission
- Application status tracking
- Employer applicant management
- Application withdrawal

### Admin Features
- User and job statistics
- Analytics dashboard
- User status management
- Employer approval system
- Content moderation

## Tech Stack

- **Framework:** FastAPI 0.104.1
- **Database:** PostgreSQL with SQLAlchemy 2.0.23
- **Authentication:** JWT (PyJWT, python-jose)
- **Password Hashing:** bcrypt via passlib
- **Validation:** Pydantic 2.5.0
- **Server:** Uvicorn 0.24.0
- **File Processing:** python-multipart, aiofiles, pytesseract, python-docx

## Project Structure

```
careerai_backend/
├── main.py                 # FastAPI application entry point
├── config.py               # Configuration management
├── database.py             # Database connection and session management
├── models.py               # SQLAlchemy ORM models
├── schemas.py              # Pydantic schemas for request/response
├── auth.py                 # Authentication utilities (JWT, password hashing)
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variables template
├── routers/                # API route handlers
│   ├── __init__.py
│   ├── auth.py            # Authentication endpoints
│   ├── users.py           # User management endpoints
│   ├── jobs.py            # Job CRUD endpoints
│   ├── resumes.py         # Resume upload and management
│   ├── applications.py    # Job applications endpoints
│   ├── analysis.py        # AI analysis endpoints
│   └── admin.py           # Admin endpoints
└── uploads/               # Uploaded resume files
    └── resumes/
```

## Installation

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- pip (Python package manager)

### Setup Steps

1. **Clone the repository**
   ```bash
   cd careerai_backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # Activate on Windows
   .\venv\Scripts\Activate.ps1
   
   # Activate on Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure PostgreSQL**
   
   Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE careerai;
   CREATE USER careerai_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE careerai TO careerai_user;
   ```

5. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   DATABASE_URL=postgresql://careerai_user:your_password@localhost:5432/careerai
   JWT_SECRET_KEY=your-super-secret-key-change-this
   JWT_ALGORITHM=HS256
   JWT_EXPIRATION_HOURS=1
   REFRESH_TOKEN_EXPIRATION_DAYS=7
   DEBUG=True
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   OPENAI_API_KEY=your-openai-key
   GEMINI_API_KEY=your-gemini-key
   ```

6. **Create uploads directory**
   ```bash
   mkdir -p uploads/resumes
   ```

7. **Initialize the database**
   
   The application will automatically create tables on first run. Alternatively, you can use Alembic for migrations:
   ```bash
   # Install alembic
   pip install alembic
   
   # Initialize alembic (if not already done)
   alembic init alembic
   
   # Generate migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migration
   alembic upgrade head
   ```

8. **Run the application**
   ```bash
   python main.py
   ```
   
   Or use uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

9. **Access the API**
   - API: http://localhost:8000
   - Interactive Docs (Swagger): http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-token` - Verify token validity

### Users (`/api/users`)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users` - List all users (admin)
- `DELETE /api/users/{user_id}` - Delete user

### Jobs (`/api/jobs`)
- `POST /api/jobs` - Create job posting (employer)
- `GET /api/jobs` - List jobs with filters
- `GET /api/jobs/{job_id}` - Get job details
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs
- `PUT /api/jobs/{job_id}` - Update job
- `DELETE /api/jobs/{job_id}` - Delete job
- `POST /api/jobs/{job_id}/close` - Close job posting

### Resumes (`/api/resumes`)
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - List user's resumes
- `GET /api/resumes/{resume_id}` - Get resume details
- `GET /api/resumes/{resume_id}/download` - Download resume file
- `PUT /api/resumes/{resume_id}` - Update resume metadata
- `DELETE /api/resumes/{resume_id}` - Delete resume

### Applications (`/api/applications`)
- `POST /api/applications` - Apply for job
- `GET /api/applications` - Get user's applications
- `GET /api/applications/{application_id}` - Get application details
- `GET /api/applications/job/{job_id}/applicants` - Get job applicants (employer)
- `PUT /api/applications/{application_id}/status` - Update application status (employer)
- `DELETE /api/applications/{application_id}` - Withdraw application

### AI Analysis (`/api/analysis`)
- `POST /api/analysis/resume/{resume_id}/analyze` - Analyze resume
- `POST /api/analysis/resume/{resume_id}/match-job/{job_id}` - Match resume to job
- `GET /api/analysis/career-recommendations` - Get career recommendations
- `POST /api/analysis/career-roadmap` - Create career roadmap
- `GET /api/analysis/skill-gaps` - Analyze skill gaps
- `GET /api/analysis/resume/{resume_id}/history` - Get analysis history

### Admin (`/api/admin`)
- `GET /api/admin/users/stats` - Get user statistics
- `GET /api/admin/jobs/stats` - Get job statistics
- `GET /api/admin/analytics` - Get comprehensive analytics
- `GET /api/admin/users` - List all users with filters
- `PUT /api/admin/users/{user_id}/status` - Update user status
- `DELETE /api/admin/users/{user_id}` - Delete user (admin)
- `DELETE /api/admin/jobs/{job_id}` - Delete job (admin)
- `GET /api/admin/pending-approvals` - Get pending employer approvals
- `POST /api/admin/approve-employer/{user_id}` - Approve employer

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Example: Login and Access Protected Endpoint

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}

# Use token to access protected endpoint
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Database Models

### User
- **Roles:** STUDENT, EMPLOYER, ADMIN
- **Status:** ACTIVE, PENDING, SUSPENDED
- **Student fields:** university, major, GPA, skills, certifications, social links
- **Relationships:** resumes, applications, posted_jobs

### Job
- **Types:** FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
- **Fields:** title, description, location, salary_range, requirements, company info
- **Relationships:** employer, applications

### Resume
- **Fields:** file_name, file_path, file_size, extracted_text, extracted_skills
- **Relationships:** user, analyses

### JobApplication
- **Status:** PENDING, REVIEWING, ACCEPTED, REJECTED
- **Fields:** applied_date, match_score, interview_date, employer_notes
- **Relationships:** job, user

## AI Integration

The backend includes placeholders for AI integration. To enable full AI features:

1. **OpenAI Integration:**
   - Add your OpenAI API key to `.env`
   - Implement resume parsing in `routers/analysis.py`
   - Update `analyze_resume_content()` function

2. **Google Gemini Integration:**
   - Add your Gemini API key to `.env`
   - Implement job matching in `calculate_job_match()`
   - Update career recommendation functions

Example AI service integration:
```python
import openai

def analyze_resume_content(resume_text: str) -> dict:
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": "Analyze this resume and provide feedback..."
        }, {
            "role": "user",
            "content": resume_text
        }]
    )
    return parse_ai_response(response)
```

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Formatting
```bash
# Install formatters
pip install black isort

# Format code
black .
isort .
```

### Linting
```bash
# Install linters
pip install flake8 pylint

# Run linting
flake8 .
pylint *.py routers/*.py
```

## Deployment

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads/resumes

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: careerai
      POSTGRES_USER: careerai_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://careerai_user:your_password@db:5432/careerai
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

volumes:
  postgres_data:
```

Run with Docker:
```bash
docker-compose up -d
```

### Production Considerations

1. **Security:**
   - Change JWT_SECRET_KEY to a strong random string
   - Use HTTPS in production
   - Enable rate limiting
   - Implement input sanitization

2. **Performance:**
   - Use connection pooling
   - Enable caching (Redis)
   - Optimize database queries
   - Use CDN for file storage

3. **Monitoring:**
   - Set up logging (ELK stack)
   - Use APM tools (New Relic, DataDog)
   - Monitor database performance

## Frontend Integration

The React frontend should connect to this backend:

```typescript
// Example API call from React
const API_BASE_URL = 'http://localhost:8000/api';

async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

async function getProfile(token: string) {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
