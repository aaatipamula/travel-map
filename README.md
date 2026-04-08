# Travel Map

A personal travel map web app. Visited countries are highlighted on an interactive world map — click any country to view a photo gallery, add visit dates, and write notes. Photos can be uploaded directly or imported from Google Photos.

## Features

- **Interactive world map** — zoomable, pannable SVG map with visited countries highlighted in blue
- **Per-country galleries** — upload photos directly or browse and assign from Google Photos
- **Visit details** — track dates visited and notes for each country
- **Google Photos integration** — connect your library and import photos by date range
- **Multi-user** — sign in with Google, each user has their own map and photos
- **Mobile-friendly** — responsive layout with a bottom-sheet country panel on small screens

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Map | react-simple-maps + TopoJSON |
| Auth | Auth.js v5 + Google OAuth |
| Database | Turso (LibSQL/SQLite) or self-hosted sqld |
| Storage | Cloudflare R2 or self-hosted MinIO |
| Styling | Tailwind CSS v4 |

---

## Local development

### Prerequisites

- Node.js 20+
- Docker (for the local database and storage)

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Start backing services

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts:
- **sqld** (LibSQL database) on `localhost:8080`
- **MinIO** (S3-compatible storage) on `localhost:9000`, web console on `localhost:9001`

The MinIO bucket (`travel-map-photos`) is created automatically.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in the required values. For local dev, use these storage settings (Option C in the example file):

```bash
TURSO_DATABASE_URL=http://localhost:8080
TURSO_AUTH_TOKEN=

S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
R2_ACCESS_KEY_ID=devuser
R2_SECRET_ACCESS_KEY=devpassword
R2_BUCKET_NAME=travel-map-photos
R2_PUBLIC_URL=http://localhost:9000/travel-map-photos
```

See [Google Cloud Console setup](#google-cloud-console-setup) below for the OAuth values.

### 4. Run migrations

```bash
npx drizzle-kit generate   # first time only — generates SQL from the schema
TURSO_DATABASE_URL=http://localhost:8080 npx drizzle-kit migrate
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Google Cloud Console setup

You need two OAuth clients — one for login, one for Google Photos access.

### Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. `travel-map`)

### Enable the Photos Picker API

**APIs & Services** → **Library** → search `Google Photos Picker API` → **Enable**

### Configure the OAuth consent screen

1. **APIs & Services** → **OAuth consent screen** → **External** → **Create**
2. Fill in app name, support email, developer email
3. Under **Scopes**, add: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`
4. Under **Test users**, add your Google account

> The app stays in Testing mode — only listed test users can sign in. No Google verification needed for personal use.

### OAuth client #1 — login

1. **Credentials** → **+ Create Credentials** → **OAuth client ID**
2. Type: **Web application**, name: `travel-map-login`
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.com/api/auth/callback/google` (prod)
4. Copy **Client ID** → `AUTH_GOOGLE_ID`
5. Copy **Client Secret** → `AUTH_GOOGLE_SECRET`

### OAuth client #2 — Google Photos

1. **Credentials** → **+ Create Credentials** → **OAuth client ID** again
2. Type: **Web application**, name: `travel-map-photos`
3. Authorized redirect URIs:
   - `http://localhost:3000/api/google-photos/callback` (dev)
   - `https://your-domain.com/api/google-photos/callback` (prod)
4. Copy **Client ID** → `GOOGLE_PHOTOS_CLIENT_ID`
5. Copy **Client Secret** → `GOOGLE_PHOTOS_CLIENT_SECRET`

---

## Production deployment (Dokploy)

The app is designed to self-host via Docker Compose on [Dokploy](https://dokploy.com).

### Services

`docker-compose.yml` runs three containers:

| Service | Description                                                        |
|---------|-------------                                                       |
| `sqld`  | Self-hosted LibSQL database (Turso-compatible)                     |
| `minio` | S3-compatible object storage for photos                            |
| `app`   | Next.js app — runs migrations on startup, then serves on port 3000 |

### Steps

1. Push the repo to GitHub
2. In Dokploy → **New Service** → **Docker Compose** → connect your repo
3. Set environment variables in the Dokploy **Environment** tab (see `.env.example` for the full list):

   ```
   AUTH_SECRET=             # openssl rand -base64 32
   AUTH_URL=https://your-domain.com
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   GOOGLE_PHOTOS_CLIENT_ID=...
   GOOGLE_PHOTOS_CLIENT_SECRET=...
   GOOGLE_PHOTOS_REDIRECT_URI=https://your-domain.com/api/google-photos/callback
   MINIO_ROOT_USER=...
   MINIO_ROOT_PASSWORD=...
   R2_BUCKET_NAME=travel-map-photos
   R2_PUBLIC_URL=https://your-domain.com:9000/travel-map-photos
   ```

4. Deploy — database migrations run automatically on first start
5. Open `http://your-server:9001`, log in to MinIO, create a bucket named `travel-map-photos`, and set its access policy to **public**

### Using Cloudflare R2 instead of MinIO

Remove the `minio` service from `docker-compose.yml` and set:

```bash
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=travel-map-photos
R2_PUBLIC_URL=https://pub-xxx.r2.dev
# Leave S3_ENDPOINT and S3_FORCE_PATH_STYLE unset
```

### Using Turso cloud instead of self-hosted sqld

Remove the `sqld` service from `docker-compose.yml` and set:

```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=...
```

---

## Environment variables

See `.env.example` for the full list with descriptions. Required variables:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Random secret for signing session tokens |
| `AUTH_URL` | Full public URL of the app (required in production) |
| `AUTH_GOOGLE_ID` | Google OAuth client ID (login) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret (login) |
| `GOOGLE_PHOTOS_CLIENT_ID` | Google OAuth client ID (Photos API) |
| `GOOGLE_PHOTOS_CLIENT_SECRET` | Google OAuth client secret (Photos API) |
| `GOOGLE_PHOTOS_REDIRECT_URI` | Callback URL for Google Photos OAuth |
| `TURSO_DATABASE_URL` | Database URL (`http://sqld:8080` or `libsql://...turso.io`) |
| `R2_ACCESS_KEY_ID` | S3/R2/MinIO access key |
| `R2_SECRET_ACCESS_KEY` | S3/R2/MinIO secret key |
| `R2_BUCKET_NAME` | Storage bucket name |
| `R2_PUBLIC_URL` | Public base URL for serving photos |

## Database migrations

Migrations are in `db/migrations/`. To regenerate after changing `db/schema.ts`:

```bash
npx drizzle-kit generate
TURSO_DATABASE_URL=http://localhost:8080 npx drizzle-kit migrate
```

In production (Docker), migrations run automatically via `scripts/docker-entrypoint.sh` before the server starts.

## Google Photos limitation

The Google Photos API does not expose location or GPS metadata. The integration lets you browse your library filtered by date range and manually assign selected photos to a country. Photos are copied into the app's own storage (R2/MinIO) at assignment time — `baseUrl` tokens from Google expire quickly and are never stored.
