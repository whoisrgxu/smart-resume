#!/bin/bash

# Smart Resume Editor - Development Setup Script

echo "🚀 Setting up Smart Resume Editor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating .env file..."
    cat > server/.env << EOF
# OpenAI API Key (replace with your actual key)
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=8080
EOF
    echo "✅ Created server/.env file"
    echo "⚠️  Please update OPENAI_API_KEY in server/.env with your actual OpenAI API key"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "1. Terminal 1: cd server && npm run start:dev"
echo "2. Terminal 2: cd client && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Note: If you don't have an OpenAI API key, the app will use mock responses."
