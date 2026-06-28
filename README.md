# IntelliChat

A full-stack AI chat application powered by Google Gemini. Create multiple conversations, get markdown-formatted responses, and switch between light and dark themes.

**Live demo:** [intelli-chat-chi.vercel.app](https://intelli-chat-chi.vercel.app)

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Google Gemini 2.5 Flash
- JWT authentication (access + refresh tokens)
- Helmet + rate limiting

---

## Features

- **AI conversations** — chat with Gemini 2.5 Flash with full conversation history
- **Multiple chats** — create, rename, and delete conversations from the sidebar
- **Markdown rendering** — model responses render with full markdown support
- **Auth** — register, login, JWT-based sessions with automatic token refresh
- **Dark / light theme** — persisted theme toggle
- **Mobile friendly** — Bearer token auth works across all browsers including Safari

---

## Project Structure

```
IntelliChat/
├── Frontend/         # React + Vite app
│   └── src/
│       ├── api/          # Axios instance + auth/chat services
│       ├── components/   # ChatSidebar, MessageView, MessageInput, etc.
│       ├── context/      # AuthContext, ThemeContext
│       ├── pages/        # Login, Register, ChatPage
│       └── types/        # TypeScript interfaces
│
└── Backend/          # Express API
    └── src/
        ├── controllers/  # authController, chatController
        ├── middleware/   # authMiddleware
        ├── models/       # User, Chat, Message
        ├── routes/       # authRouter, chatRouter
        └── utils/        # Input validators
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)

### Backend

```bash
cd Backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:3000/api
npm run dev
```

---

## Environment Variables

**Backend** (`Backend/.env`)

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLIENT_URL` | Frontend URL (for CORS in production) |
| `NODE_ENV` | `development` or `production` |

**Frontend** (`Frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3000/api`) |

---

## Deployment

The app is deployed on:
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)

See [`.env.example`](./Backend/.env.example) files in each directory for the required environment variables.

**Render build settings**
- Root directory: `Backend`
- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`

**Vercel build settings**
- Root directory: `Frontend`
- Framework: Vite (auto-detected)

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Create account |
| POST | `/api/auth/login` | ✗ | Login, returns tokens |
| POST | `/api/auth/refresh-token` | ✗ | Refresh access token |
| GET | `/api/auth/get-me` | ✓ | Get current user |
| POST | `/api/auth/logout` | ✓ | Logout |
| GET | `/api/chats` | ✓ | List all chats |
| POST | `/api/chats` | ✓ | Create a new chat |
| GET | `/api/chats/:id/messages` | ✓ | Get messages for a chat |
| POST | `/api/chats/:id/messages` | ✓ | Send a message |
| PATCH | `/api/chats/:id` | ✓ | Rename a chat |
| DELETE | `/api/chats/:id` | ✓ | Delete a chat |
