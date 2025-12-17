# Quick setup script for CareerAI Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CareerAI Backend Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($pythonVersion -match "Python 3\.([0-9]+)") {
    $minorVersion = [int]$matches[1]
    if ($minorVersion -ge 11) {
        Write-Host "✓ $pythonVersion detected" -ForegroundColor Green
    } else {
        Write-Host "✗ Python 3.11+ required. Current: $pythonVersion" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host ""
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
$pgVersion = psql --version 2>&1
if ($pgVersion -match "psql") {
    Write-Host "✓ PostgreSQL detected: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL not found in PATH. Please ensure it's installed." -ForegroundColor Yellow
}

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠ Virtual environment already exists. Skipping..." -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Create .env file if not exists
Write-Host ""
Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "⚠ .env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created from template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠ IMPORTANT: Please edit .env file and configure:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (PostgreSQL connection)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET_KEY (generate a secure random key)" -ForegroundColor Yellow
    Write-Host "   - API keys for OpenAI/Gemini (optional)" -ForegroundColor Yellow
}

# Create uploads directory
Write-Host ""
Write-Host "Creating uploads directory..." -ForegroundColor Yellow
if (!(Test-Path "uploads/resumes")) {
    New-Item -ItemType Directory -Path "uploads/resumes" -Force | Out-Null
    Write-Host "✓ Uploads directory created" -ForegroundColor Green
} else {
    Write-Host "⚠ Uploads directory already exists" -ForegroundColor Yellow
}

# Database setup instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Database Setup Instructions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To set up PostgreSQL database, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "psql -U postgres" -ForegroundColor White
Write-Host "CREATE DATABASE careerai;" -ForegroundColor White
Write-Host "CREATE USER careerai_user WITH PASSWORD 'your_password';" -ForegroundColor White
Write-Host "GRANT ALL PRIVILEGES ON DATABASE careerai TO careerai_user;" -ForegroundColor White
Write-Host "\q" -ForegroundColor White
Write-Host ""

# Next steps
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "  1. Configure database connection in .env file" -ForegroundColor White
Write-Host "  2. Update JWT_SECRET_KEY in .env file" -ForegroundColor White
Write-Host "  3. Run: python main.py" -ForegroundColor White
Write-Host "  4. Visit: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To start the server now:" -ForegroundColor Yellow
Write-Host "  python main.py" -ForegroundColor Cyan
Write-Host ""
