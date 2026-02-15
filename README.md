# AI Mock Test & Skill Assessment Platform

A full-stack AI-powered mock test platform that dynamically generates interview-style questions using the GROQ LLM API. Users select a role and difficulty, take a timed quiz, and receive adaptive feedback with explanations and retest options. Results are stored locally and visible in history.

## Features
- Role and difficulty selection with guided flow
- Dynamic question generation via GROQ LLM API
- No repeated questions per session
- Mixed conceptual, code, debugging, and output-based questions by difficulty
- Scoring, percentage, and skill level classification
- AI explanations for incorrect answers
- Retest logic for scores below 60%
- Local result persistence and history

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- AI: groq-sdk (llama3-70b-8192)

## Setup
1. Copy the environment file and add your GROQ API key:
   - Duplicate `.env.example` to `.env` in the project root.
   - Set `GROQ_API_KEY`.

2. Install dependencies:
   - `npm install` in `server`
   - `npm install` in `client`

3. Start the backend:
   - `npm run dev` in `server`

4. Start the frontend:
   - `npm run dev` in `client`

The frontend runs on http://localhost:5173 and proxies `/api` to the backend at http://localhost:5174.

## Scripts
### Server
- `npm run dev` - Start server with hot reload
- `npm run build` - Build TypeScript
- `npm start` - Run built server

### Client
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes
- Each quiz session requests fresh questions and avoids duplicates.
- Results are stored in localStorage for history.
