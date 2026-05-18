# Start Backend Server
Write-Host "🚀 Starting GTM Control Tower Backend..."

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please create .env file with GROQ_API_KEY and DATABASE_URL"
    exit 1
}

# Build the project
Write-Host "📦 Building TypeScript..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed"
    exit 1
}

# Start the server
Write-Host "🌟 Starting server on port 4000..."
npm run dev
