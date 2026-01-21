# Deployment Guide

This guide details how to deploy the **AI Website Builder** to a production environment.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **OpenAI API Key**: Required for content generation

## Backend Deployment

The backend is an Express.js application interacting with an SQLite database (which can be file-based or in-memory).

1.  **Navigate to Project Root**:
    ```bash
    cd sideproject-main
    ```

2.  **Install Dependencies**:
    ```bash
    npm ci
    ```

3.  **Configure Environment**:
    Create a `.env` file based on `.env.example`:
    ```ini
    PORT=3000
    NODE_ENV=production
    OPENAI_API_KEY=sk-your-key-here
    DB_PATH=./data/prod.db
    ```

4.  **Build**:
    ```bash
    npm run build
    ```

5.  **Start**:
    ```bash
    npm start
    ```
    The server will listen on port `3000` (or the `PORT` env var).

## Frontend Deployment

The frontend is a React application built with Vite.

1.  **Navigate to Frontend Directory**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm ci
    ```

3.  **Configure Environment**:
    Create a `.env` file based on `.env.example`:
    ```ini
    VITE_API_BASE_URL=https://your-backend-api.com
    ```
    *Note: In production, point this to your deployed backend URL. In development, it defaults to `http://localhost:3000`.*

4.  **Build**:
    ```bash
    npm run build
    ```
    This generates static assets in `frontend/dist`.

5.  **Serve**:
    Deploy the `dist` folder to any static host (Vercel, Netlify, AWS S3/CloudFront, Nginx).
    *Ensure your host handles client-side routing (redirect 404s to `index.html`).*

## Verification

After deployment, verify the following:
1.  **Health Check**: Ensure the backend responds to requests.
2.  **Frontend Load**: Ensure the dashboard loads without console errors.
3.  **Generation Pipeline**: Run a test generation flow (Requirements -> Template -> Preview).
