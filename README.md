# Abdur Rehman — Portfolio Backend

The backend service powering the chatbot on [my developer portfolio](https://github.com/abdurehmaan366/abdur-portfolio-frontend). A lightweight Express.js API that proxies visitor messages to the Groq LLM API, with rate limiting to protect the free quota.

> **Part of a two-repo portfolio system.**
> Frontend → [portfolio-frontend](https://github.com/abdurehmaan366/abdur-portfolio-frontend)
> Backend → this repo

![Node.js](https://img.shields.io/badge/Node.js-ES6+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLM_API-F55036?logoColor=white)

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deploying](#deploying)
- [License](#license)
- [Contact](#contact)

---

## Overview

The portfolio frontend embeds a small chatbot that answers recruiter and hiring manager questions about my background, projects, and skills. This backend handles those requests — it receives the conversation history from the frontend, appends a system prompt with accurate context about my work, and returns the model's reply.

It deliberately has no database and no auth. It is stateless, tiny, and easy to deploy on any Node.js host.

---

## How It Works

```
Visitor types a message on the portfolio site
        ↓
chatbot.js (frontend) sends POST /api/chat with conversation history
        ↓
Rate limiter checks: ≤ 30 messages per IP per hour
        ↓
Server prepends the system prompt (context.js) and forwards to Groq API
        ↓
Groq returns a reply → server sends it back to the frontend
        ↓
Chatbot widget displays the response
```

The system prompt lives in `context.js`. It tells the model who I am, what I've built, and how to handle off-topic questions — keeping the chatbot focused and accurate without inventing details.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Runtime | Node.js (ES modules) |
| Framework | [Express 5.x](https://expressjs.com/) |
| LLM | [Groq API](https://groq.com/) — `openai/gpt-oss-120b` model |
| Rate limiting | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| CORS | [cors](https://github.com/expressjs/cors) |
| Config | [dotenv](https://github.com/motdotla/dotenv) |

---

## Project Structure

```
├── server.js      # Express app — routes, rate limiter, Groq API call
├── context.js     # System prompt: who Abdur is, projects, chatbot rules
├── package.json
├── .env           # Local secrets (never commit this)
└── .gitignore
```

The entire backend logic fits in two files:

- **`server.js`** — sets up CORS, rate limiting (30 req/hr/IP), the `POST /api/chat` route, and a `GET /health` endpoint
- **`context.js`** — exports `SYSTEM_PROMPT`, the instruction block prepended to every conversation. Edit this file to update what the chatbot knows about you.

---

## Getting Started

**Prerequisites:** Node.js v18+ and npm.

```bash
# 1. Clone the repo
git clone https://github.com/abdurehmaan366/portfolio-backend.git
cd portfolio-backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Then add your GROQ_API_KEY (see Environment Variables below)

# 4. Start the server
npm start
# → http://localhost:3001
```

The frontend's chatbot points to `http://localhost:3001/api/chat` by default during local dev, so both servers running together gives you a fully working local environment.

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file** — it is already in `.gitignore`.

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Your API key from [console.groq.com](https://console.groq.com/) |
| `FRONTEND_ORIGIN` | Production only | The deployed frontend URL (e.g. `https://abdurrehman.dev`). Restricts CORS to your domain. Leave unset locally to allow any origin. |
| `PORT` | No | Port to listen on. Defaults to `3001`. |

```env
# .env
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_ORIGIN=https://your-portfolio-domain.com
PORT=3001
```

> **Tip:** If you ever accidentally push a real API key to a public repo, rotate it immediately in the Groq console.

---

## API Reference

### `POST /api/chat`

Sends a conversation turn to the LLM and returns the assistant's reply.

**Rate limit:** 30 requests per IP per hour.

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "What projects have you built?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "Tell me about the session bug." }
  ]
}
```

The server keeps only the last 10 messages to cap token usage per request.

**Response:**
```json
{
  "reply": "The session isolation bug was..."
}
```

**Error responses:**

| Status | Meaning |
|---|---|
| `400` | `messages` array missing or empty |
| `429` | Rate limit exceeded |
| `500` | Groq API error |

---

### `GET /health`

Returns `{ "status": "ok" }`. Used to verify the server is running (useful for deployment health checks on Render, Railway, etc.).

---

## Deploying

The backend is stateless and runs on a single `npm start` command, making it straightforward to deploy to any Node.js platform.

**Render (recommended free tier):**
1. Create a new Web Service pointing to this repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables (`GROQ_API_KEY`, `FRONTEND_ORIGIN`) in the Render dashboard
5. Once deployed, copy the service URL and update `chat.apiUrl` in the frontend's `src/js/config.js`

After deploying, set `FRONTEND_ORIGIN` to your live portfolio domain to lock down CORS.

---

## License

Copyright © 2026 Abdur Rehman. All rights reserved.

Source code is publicly available for review and learning purposes. Reusing or redistributing this code as your own is not permitted.

---

## Contact

**Abdur Rehman**
[abdurrehman.se.work@gmail.com](mailto:abdurrehman.se.work@gmail.com) · [LinkedIn](https://linkedin.com/in/abdur-rehman-2b39a33b1) · [GitHub](https://github.com/abdurehmaan366)
