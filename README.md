# Zortuner (ZefenCrafts)

A full-stack application built with Next.js and Node.js.

## Prerequisites

- Node.js 20.9+ for the frontend
- Node.js 18+ for the backend
- MongoDB
- Docker & Docker Compose (Optional)

## Hostinger Deployment

The repository is organized as two deployable apps under the `zortuner/` folder:

- `frontend/` is the Next.js web app.
- `backend/` is the Express API.

For Hostinger GitHub import, deploy them as separate Node.js apps or separate host entries:

1. Set the frontend app root to `zortuner/frontend`.
2. Set the backend app root to `zortuner/backend`.
3. Use Node.js 20.9 or newer for the frontend.
4. Set backend environment variables from `backend/.env.example`.
5. Set `NEXT_PUBLIC_API_URL` in the frontend to your live backend URL, for example `https://api.yourdomain.com/api/v1`.
6. Set `CLIENT_URL` in the backend to your live frontend URL, for example `https://yourdomain.com`.

Recommended production commands:

- Frontend install: `npm install`
- Frontend build: `npm run build`
- Frontend start: `npm run start`
- Backend install: `npm install`
- Backend start: `npm start`

## Getting Started

### Using Docker Compose

To run the full stack using Docker:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Manual Setup

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```
