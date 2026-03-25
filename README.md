# Drone Portfolio Platform

Production-oriented portfolio platform for a professional drone photographer.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, React Hook Form, React Player
- Backend: Django, Django REST Framework, JWT auth, PostgreSQL-ready database configuration
- Media storage: Cloudflare R2 direct uploads with presigned URLs

## Project structure

- `frontend/`: public site and admin dashboard
- `backend/`: Django API, authentication, portfolio content, R2 integration
- `.env.example`: shared environment variables for local and production setup

## Features

- Premium public landing page with animated hero, floating background effects, galleries, testimonials, and contact form
- Admin login and dashboard for site settings, services, media, testimonials, announcements, and inquiries
- Direct media uploads from the browser to Cloudflare R2 with upload progress tracking
- Public video playback using direct object URLs or presigned read URLs
- JWT-based admin authentication with refresh-cookie flow
- Multi-tenant-safe content structure by binding all content to a portfolio site owner

## Local setup

### 1. Environment

Copy `.env.example` to `.env` and fill the values.

Important values:

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`
- `R2_PUBLIC_BASE_URL=https://your-public-r2-domain.example.com`

### 2. Backend

From the workspace root, use the configured Python environment:

```powershell
Push-Location backend
../.venv/Scripts/python.exe manage.py migrate
../.venv/Scripts/python.exe manage.py createsuperuser
../.venv/Scripts/python.exe manage.py runserver
Pop-Location
```

### 3. Frontend

```powershell
Push-Location frontend
npm install
npm run dev
Pop-Location
```

The public site runs on `http://localhost:3000` and the API runs on `http://127.0.0.1:8000`.

## Cloudflare R2 upload flow

1. Admin signs in.
2. Frontend requests a presigned upload URL from `POST /api/v1/admin/uploads/presign/`.
3. Browser uploads the file directly to Cloudflare R2.
4. Frontend sends the uploaded file metadata to `POST /api/v1/admin/media/`.
5. Public portfolio automatically displays published media.

## Admin usage

### Update public content

- Open `/admin/login`
- Sign in with the Django admin user
- Go to `/admin/dashboard`
- Edit site settings, services, announcements, testimonials, and media

### Upload media

- Open the `Media` tab in the dashboard
- Choose one or more image or video files
- The dashboard uploads the file directly to R2 and displays progress for each item
- After upload, the item is saved to the database and appears in the public page if published

### Contact messages

- Visitors submit inquiries from the landing page contact form
- The message is stored in the database and optionally emailed using configured SMTP settings
- Admin can review and archive messages from the `Contacts` tab

## Deployment

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output: default Next.js output
- Environment variable: `NEXT_PUBLIC_API_BASE_URL`

### Backend on Render

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn config.wsgi:application`
- Required environment variables: all Django, database, and R2 values from `.env.example`

### Production notes

- Use PostgreSQL in production through `DATABASE_URL`
- Configure `R2_PUBLIC_BASE_URL` with a public custom domain for best playback performance
- Keep `DEBUG=False`
- Set a strong `DJANGO_SECRET_KEY`
- Restrict `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`

## Tests

Backend smoke tests:

```powershell
Push-Location backend
../.venv/Scripts/python.exe manage.py test
Pop-Location
```

Frontend quality checks:

```powershell
Push-Location frontend
npm run lint
npm run build
Pop-Location
```