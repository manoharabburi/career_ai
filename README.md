# CareerAI - Intelligent Job Portal

CareerAI is a modern, AI-powered job portal designed to revolutionize the job search and recruitment process. It leverages Google's Gemini API to provide intelligent features like an AI Career Coach, resume analysis, and automated interview question generation.

## 🚀 Features

### For Job Seekers:
- **AI Career Coach**: A 24/7 intelligent assistant (powered by Gemini 2.5 Flash) to guide you through your career path, answer questions, and provide advice.
- **Smart Job Search**: Find relevant jobs based on your skills and preferences.
- **Resume Analysis**: Get instant feedback on your resume and suggestions for improvement.
- **AI Mock Interviews**: Practice with AI-generated interview questions tailored to specific job roles.
- **Application Tracking**: Keep track of your job applications and their status.

### For Employers:
- **Post Jobs**: Easily create and manage job listings.
- **Applicant Management**: View and manage candidates effectively.
- **AI Insights**: Gain insights into candidate fit and potential.

## 🛠️ Tech Stack

### Frontend
- **React**: For building a dynamic and responsive user interface.
- **Tailwind CSS**: For modern, utility-first styling.
- **Vite**: For fast development and building.
- **Lucide React**: For beautiful icons.

### Backend
- **Python (FastAPI)**: High-performance web framework for building APIs.
- **SQLAlchemy**: ORM for database interactions.
- **SQLite**: Lightweight database for development.

### AI Integration
- **Google Gemini API**:
  - Model: `gemini-2.5-flash` (Active)
  - Capabilities: Chat, Text Generation, Resume Analysis.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- Google Cloud API Key (with Gemini API access)

### 1. Backend Setup
```bash
cd careerai_backend
# Create a virtual environment
python -m venv venv
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Add your DATABASE_URL and SECRET_KEY
copy .env.example .env

# Run the server
python main.py
```

### 2. Frontend Setup
```bash
cd "careerai---intelligent-job-portal (1)"
# Install dependencies
npm install

# Setup Environment Variables
# Create .env.local and add your API key:
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local

# Run the development server
npm run dev
```

## 📝 Usage
1. Start the Backend server (runs on `http://localhost:8000`).
2. Start the Frontend server (runs on `http://localhost:5173`).
3. Open your browser and navigate to `http://localhost:5173`.
4. Sign up as a **Student** or **Employer** to get started!

## ⚠️ Important Note on API Limits
The current AI model (`gemini-2.5-flash`) has a free tier daily quota of **20 requests**. The application includes a rate limiter to help manage this, but heavy usage may hit the limit. Quotas reset daily at midnight UTC.

## License
MIT
