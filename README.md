# Eritrea Tour Guide

A full-stack tourism website for Eritrea with a React frontend, Django REST API backend, booking workflow, visitor analytics, public reviews, and an admin dashboard.

## Local setup

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
```

Create a `backend/.env` file from `backend/.env.example` and set the PostgreSQL connection values before running migrations.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Production-ready environment variables

Create a `.env` file in `backend/` based on `backend/.env.example`.

Required for production:

- `DJANGO_DEBUG=False`
- `DJANGO_SECRET_KEY=<strong-secret-key>`
- `DJANGO_ALLOWED_HOSTS=<your-domain>,<your-server-host>`
- `DJANGO_CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>`
- `DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-frontend-domain>`
- `DJANGO_DB_NAME=<postgres-database-name>`
- `DJANGO_DB_USER=<postgres-user>`
- `DJANGO_DB_PASSWORD=<postgres-password>`
- `DJANGO_DB_HOST=<postgres-host>`
- `DJANGO_DB_PORT=5432`

## Deployment notes

- PostgreSQL is the only supported application database backend
- Create the PostgreSQL database and user before running `python manage.py migrate`
- Build the frontend with `npm run build`
- Apply database migrations with `python manage.py migrate`
- Collect static files with `python manage.py collectstatic`
- Serve Django behind HTTPS in production

## Core features

- Public homepage with hero, memories, tour packages, booking, reviews, and footer sections
- Booking form with tour-package selection and pricing summary
- Public traveler reviews and comments
- Admin login and dashboard for bookings, visitors, traffic, reviews, and selected-tour insights
- Responsive layout for desktop and mobile
