# Local Development Environment

Run MailGate as a Node.js process with Redis in Docker.

## Setup

### 1. Start Redis container

```bash
docker compose up -d
```

This starts Redis on port `6380`.

### 2. Install dependencies (from project root)

```bash
cd ..
npm install
```

### 3. Run the application

```bash
npm start -- --dbs.redis='redis://127.0.0.1:6380/9' --api.port=3000
```

Or with pretty-printed logs:

```bash
npm run dev -- --dbs.redis='redis://127.0.0.1:6380/9' --api.port=7003
```

### 4. Access the application

- Web/API: http://localhost:3000 (or 7003 if using `npm run dev`)
- API Docs: http://localhost:3000/admin/iframe/docs (after login)

## Stop Redis

```bash
docker compose down
```

## Environment Variables

You can also set Redis connection via env var:

```bash
export EENGINE_REDIS='redis://127.0.0.1:6380/9'
export EENGINE_SECRET='your-secret-key'
npm start
```

## Default Configuration

- Redis: `redis://127.0.0.1:6380/9` (database 9)
- API: `127.0.0.1:3000`
- Secret: `secret` (use EENGINE_SECRET env var to override)

## Notes

- Node.js 16+ required
- Database is not required (only Redis)
- Local development uses the source code directly (no Docker image needed)
