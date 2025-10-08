# Smart Resume Editor

A modern resume editor with AI-powered suggestions. Upload your resume, get real-time AI feedback, and improve your resume with intelligent suggestions.

## Features

- **Real-time Resume Preview**: See your resume as you make changes
- **AI Chat Interface**: Get personalized suggestions from an AI assistant
- **Smart Suggestions**: Accept or reject AI recommendations with detailed explanations
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Backend API**: NestJS server with OpenAI integration

## Project Structure

```
smart-resume/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── api/           # API service
│   │   └── pages/         # Page components
├── server/                # NestJS backend
│   ├── src/
│   │   ├── ai/           # AI service and controller
│   │   ├── auth/         # Authentication (Week 2)
│   │   └── health/       # Health checks
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional for development)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```bash
# server/.env
OPENAI_API_KEY=your-openai-api-key-here
PORT=8080
```

**Note**: If you don't have an OpenAI API key, the app will use mock responses for development.

### 3. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4. Open the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## Usage

1. **Upload Resume**: Start by uploading a PDF resume (currently uses mock data)
2. **Chat with AI**: Use the chat interface on the right to ask for improvements
3. **Review Suggestions**: When AI provides suggestions, review the before/after comparison
4. **Accept/Reject**: Choose to accept or reject each suggestion
5. **See Changes**: Accepted suggestions are immediately reflected in the resume preview

## Development Roadmap

### Week 1 ✅ - MVP Complete
- [x] Resume preview component
- [x] AI chat interface
- [x] Suggestion system with accept/reject
- [x] Backend API with OpenAI integration
- [x] Real-time updates

### Week 2 - Database & Storage
- [ ] Add Prisma ORM
- [ ] PostgreSQL database
- [ ] Resume storage and retrieval
- [ ] User session management

### Week 3 - Authentication & Advanced Features
- [ ] User authentication
- [ ] User accounts and profiles
- [ ] Resume versioning
- [ ] Export functionality (PDF, Word)

## API Endpoints

### POST /ai/chat
Send a message to the AI assistant with resume data.

**Request:**
```json
{
  "message": "Improve my summary",
  "resumeData": {
    "personalInfo": { ... },
    "experience": [ ... ],
    "education": [ ... ],
    "skills": [ ... ]
  }
}
```

**Response:**
```json
{
  "message": "AI response text",
  "suggestion": {
    "id": "unique-id",
    "type": "personal|experience|education|skills",
    "field": "field-name",
    "originalValue": "current value",
    "suggestedValue": "improved value",
    "reasoning": "explanation"
  }
}
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- Lucide React icons

### Backend
- NestJS framework
- TypeScript
- OpenAI API integration
- CORS enabled for frontend communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.