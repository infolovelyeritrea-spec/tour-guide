# Eritrea Tour Guide Application Documentation

## 1. Overview

Eritrea Tour Guide is a full-stack tourism website for presenting Eritrean tour packages, collecting booking requests, publishing traveler reviews, tracking basic visitor activity, and managing site content through an admin interface.

The application has two main parts:

- **Backend:** Django, Django REST Framework, PostgreSQL-ready configuration, media upload handling, image optimization, email sending, and Django admin.
- **Frontend:** React with Vite, public tourism site, package selection, booking form, reviews, and a React-based admin dashboard.

The project also includes an image resizing/compression script for processing existing image folders.

## 2. Project Structure

```text
Tour Guide/
  backend/
    api/
      admin.py
      image_processing.py
      models.py
      serializers.py
      urls.py
      views.py
      migrations/
    backend/
      settings.py
      urls.py
      wsgi.py
      asgi.py
    media/
    manage.py
    requirements.txt
    .env.example
    .env.render.example
  frontend/
    public/
      images/
    src/
      components/
      sections/
      App.jsx
      main.jsx
      styles.css
    package.json
    vite.config.js
  scripts/
    resize_images.py
  build.sh
  README.md
```

## 3. Technology Stack

Backend:

- Python
- Django
- Django REST Framework
- django-cors-headers
- psycopg for PostgreSQL
- WhiteNoise for static files
- Pillow and pillow-heif for image processing

Frontend:

- React
- Vite
- CSS modules through regular CSS files
- Browser fetch API

## 4. Local Development Setup

### 4.1 Prerequisites

Install:

- Python 3.12 or newer
- Node.js and npm
- Git
- PostgreSQL if using the production-style database locally

For simple local development, the app can use the included SQLite fallback when no `backend/.env` file is present.

### 4.2 Backend Setup

```powershell
cd "D:\2026 Projects\Tour Guide\backend"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Backend local URL:

```text
http://127.0.0.1:8000
```

Django admin URL:

```text
http://127.0.0.1:8000/admin/
```

### 4.3 Frontend Setup

Open a second terminal:

```powershell
cd "D:\2026 Projects\Tour Guide\frontend"
npm install
npm run dev
```

Frontend local URL:

```text
http://localhost:5173
```

The frontend dev server proxies:

- `/api` to `http://127.0.0.1:8000`
- `/media` to `http://127.0.0.1:8000`

## 5. Environment Variables

Create `backend/.env` from `backend/.env.example` when you want PostgreSQL or production-like behavior.

### 5.1 Local Example

```env
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=change-me-before-production
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DJANGO_DB_NAME=tour_guide
DJANGO_DB_USER=postgres
DJANGO_DB_PASSWORD=change-me
DJANGO_DB_HOST=127.0.0.1
DJANGO_DB_PORT=5432
DJANGO_DB_CONN_MAX_AGE=60
DJANGO_DB_SSLMODE=prefer
```

Important behavior:

- If `DJANGO_DB_NAME` is set, Django uses PostgreSQL.
- If `DJANGO_DB_NAME` is not set, Django uses local SQLite at `backend/db.sqlite3`.

### 5.2 Production Variables

Required production values:

```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<strong-secret-key>
DJANGO_ALLOWED_HOSTS=<your-domain>
DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-domain>
DJANGO_DB_NAME=<postgres-database-name>
DJANGO_DB_USER=<postgres-user>
DJANGO_DB_PASSWORD=<postgres-password>
DJANGO_DB_HOST=<postgres-host>
DJANGO_DB_PORT=5432
DJANGO_DB_SSLMODE=require
```

`DJANGO_CORS_ALLOWED_ORIGINS` is only needed if the frontend is ever split
onto a different domain than the backend again; the frontend and backend
now share one origin, so no CORS config is required in production.

## 6. Backend Application

### 6.1 Models

#### SiteContent

Stores editable homepage copy:

- Hero title, subtitle, kicker, buttons, image
- Memories section labels
- Tour package section labels
- Booking section text
- Reviews section text
- About/contact copy
- Social media links

Only one `SiteContent` record is intended to exist. The model forces `pk=1`.

#### Destination

Represents a tour package.

Fields include:

- `name`
- `region`
- `description`
- `image`
- `image_url`
- `price_usd`
- `highlights`
- `travel_time`

Destination images uploaded through admin are automatically optimized before saving.

#### DestinationGalleryImage

Gallery images attached to a destination package.

Fields include:

- `destination`
- `image`
- `image_url`
- `alt_text`
- `display_order`

Gallery images uploaded through admin are automatically optimized before saving.

#### Memory

Represents a public memory/story card.

#### Booking

Stores a submitted booking request:

- Name
- Email
- Origin country
- Group size
- Adults, children, infants
- Travel date
- Extra requests
- Created timestamp

#### Review

Stores traveler reviews:

- Name
- Origin country
- Title
- Rating
- Trip type
- Comment
- Approved flag

Only approved reviews are shown publicly.

#### VisitorLog

Stores basic visitor tracking data:

- Path
- IP address
- User agent
- Visit timestamp

Tracked paths are currently:

- `/`
- `/admin`

## 7. API Endpoints

All API routes are under:

```text
/api/
```

### 7.1 Public Data

#### `GET /api/home/`

Returns all homepage data:

- Hero content
- Section copy
- Social links
- Destinations/tour packages
- Memories
- Site stats

This endpoint also ensures default seed data exists if the database is empty.

#### `GET /api/destinations/`

Returns all destinations/tour packages.

#### `GET /api/memories/`

Returns all memory cards.

#### `GET /api/reviews/`

Returns approved reviews.

### 7.2 Reviews

#### `POST /api/reviews/create/`

Creates a public review.

Expected body:

```json
{
  "name": "Traveler Name",
  "origin_country": "Country",
  "title": "Review title",
  "rating": 5,
  "trip_type": "custom",
  "comment": "Review text"
}
```

Validation:

- Rating must be between 1 and 5.
- Title must be at least 4 characters.
- Comment must be at least 12 characters.

### 7.3 Bookings

#### `POST /api/bookings/`

Creates a booking request.

Expected body:

```json
{
  "name": "Traveler Name",
  "email": "traveler@example.com",
  "origin_country": "Country",
  "group_size": 2,
  "adults": 2,
  "children": 0,
  "infants": 0,
  "travel_date": "2026-08-15",
  "extra_requests": "Optional note",
  "selected_package_ids": [1, 2]
}
```

Validation:

- Travel date cannot be in the past.
- At least one adult is required.
- Group size must be at least 1.
- `group_size` must equal `adults + children + infants`.

The backend calculates the estimated total from current package prices and group size.

### 7.4 Visitor Tracking

#### `POST /api/track-visitor/`

Tracks supported page visits.

Expected body:

```json
{
  "path": "/"
}
```

Only configured paths are recorded.

### 7.5 Admin Dashboard API

#### `GET /api/csrf/`

Sets a CSRF cookie for admin login/logout flows.

#### `POST /api/admin-login/`

Logs into the React admin dashboard using Django staff credentials.

Expected body:

```json
{
  "username": "admin",
  "password": "password"
}
```

Only active staff users can log in.

#### `POST /api/admin-logout/`

Logs out the current admin dashboard session.

#### `GET /api/dashboard/`

Returns dashboard data for authenticated staff users:

- Generated date
- Username
- Visitor count
- Booking count
- Booking details
- Popular pages
- Reviews

## 8. Django Admin

Django admin is available at:

```text
http://127.0.0.1:8000/admin/
```

Main admin sections:

- Site content
- Destinations
- Destination gallery images through inline rows
- Memories
- Bookings
- Reviews
- Visitor logs

### 8.1 Create an Admin User

```powershell
cd backend
python manage.py createsuperuser
```

### 8.2 Editing Tour Packages

Go to:

```text
/admin/api/destination/
```

Use this page to edit:

- Package name
- Region
- Description
- Main image
- Price in USD
- Highlights
- Travel time
- Gallery images

The frontend receives package data through `/api/home/` and `/api/destinations/`.

### 8.3 Price Updates

When a package price is changed in Django admin:

1. Save the destination.
2. Refresh the frontend.
3. Confirm the backend is running.

The frontend displays `price_usd` from the API.

## 9. Image Uploads and Optimization

Destination and destination gallery uploads are processed automatically.

### 9.1 Accepted Formats

The upload validator now accepts files that are valid images and have an `image/*` content type.

Supported formats depend on Pillow plus installed plugins. The app currently includes:

- JPG/JPEG
- PNG
- WebP
- HEIC
- HEIF
- Other image formats Pillow can decode

### 9.2 Upload Limit

Maximum upload size:

```text
25 MB
```

This allows larger phone camera photos while preventing excessive upload sizes.

### 9.3 Destination Image Output

Uploaded destination and destination gallery images are automatically:

- Converted to WebP
- Resized and center-cropped to `1200x740`
- Compressed with quality `82`
- Saved under Django media storage

Existing uploaded images are not automatically changed. Re-upload them or run the resize script manually.

## 10. Image Resize Script

The project includes:

```text
scripts/resize_images.py
```

Use it to process existing images in folders.

### 10.1 Tour Package Preset

```powershell
cd "D:\2026 Projects\Tour Guide"
.\backend\.venv\Scripts\python.exe scripts\resize_images.py frontend\public\images\tour-packages --recursive --preset tour-package
```

The `tour-package` preset:

- Outputs `1200x740`
- Uses center-crop cover behavior
- Converts to WebP
- Uses quality `82`

### 10.2 Preserve Originals

By default, the script writes to a sibling folder:

```text
tour-packages_optimized/
```

### 10.3 Overwrite Originals

Use only when you intentionally want to replace source files:

```powershell
.\backend\.venv\Scripts\python.exe scripts\resize_images.py frontend\public\images\tour-packages --recursive --preset tour-package --in-place
```

### 10.4 Custom Resize

```powershell
.\backend\.venv\Scripts\python.exe scripts\resize_images.py path\to\images --width 1600 --height 1200 --fit contain --quality 82
```

Options:

- `--width`
- `--height`
- `--quality`
- `--format original|jpg|png|webp`
- `--fit contain|cover`
- `--recursive`
- `--in-place`

## 11. Frontend Application

### 11.1 Main Public Sections

The React app renders:

- Navbar
- Hero section
- Memories section
- Tour packages section
- Booking section
- Reviews section
- Footer/about section

### 11.2 Tour Packages

Tour package cards are populated from backend destinations.

Users can:

- View package cards
- Open package galleries
- Add/remove packages from booking selection
- Change displayed currency

Currency conversions are frontend constants and are not live exchange rates.

### 11.3 Booking Flow

Users select packages and submit traveler details.

The frontend sends:

- Form data
- Selected package IDs

The backend:

- Validates the booking
- Fetches current package prices
- Calculates estimated total
- Stores the booking
- Attempts to send a confirmation email

### 11.4 Reviews

Users can view approved reviews and submit new reviews.

New reviews are currently saved with `approved=True`.

### 11.5 React Admin Dashboard

Available at:

```text
http://localhost:5173/admin
```

The dashboard uses Django staff login through API endpoints.

Dashboard features:

- Login/logout
- Visitor summary
- Booking details
- Popular page tracking
- Traveler composition
- Selected tour summary
- Review summary

## 12. Email Behavior

Booking confirmations are sent through Django's email backend.

In development, the default is console email output when `DEBUG=True`.

Production email variables:

```env
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DJANGO_EMAIL_HOST=<smtp-host>
DJANGO_EMAIL_PORT=587
DJANGO_EMAIL_HOST_USER=<smtp-user>
DJANGO_EMAIL_HOST_PASSWORD=<smtp-password>
DJANGO_EMAIL_USE_TLS=True
DJANGO_DEFAULT_FROM_EMAIL=bookings@example.com
```

If email sending fails, the booking is still saved and the API response reports `email_sent: false`.

## 13. Deployment

The app is deployed as a single Django service that serves both the API
and the built React frontend — there is no separate frontend host.

### 13.1 How the merge works

- `frontend/vite.config.js` builds the React app into `backend/frontend_build/`
  instead of `frontend/dist/`.
- `backend/backend/settings.py` adds `frontend_build` to `TEMPLATES[0]["DIRS"]`
  (so Django can render `index.html`) and sets `WHITENOISE_ROOT` to that same
  directory (so WhiteNoise serves `/assets/*` and `/images/*` straight from
  disk at the site root, matching the root-absolute paths the app already
  uses, e.g. `/images/destinations/asmara.webp`).
- `backend/backend/urls.py` serves `/admin/`, `/api/`, and `/media/<path>`
  as before, then falls back to a catch-all view that renders `index.html`
  for every other path — this is what makes React Router-style client
  routes (and hard refreshes on them) work. Note the bare route `/admin`
  (no trailing slash) is the React dashboard; `/admin/` is Django's real
  admin — the trailing slash is what tells them apart.
- Because everything is same-origin now, `frontend/src/App.jsx`'s built-in
  defaults (`/api`, `window.location.origin`) are used automatically; you
  no longer need `VITE_API_BASE_URL` etc. unless you split the frontend
  onto a separate domain again.

### 13.2 Build & Run

The included `build.sh` (used as Render's Build Command) runs:

```bash
cd frontend
npm install
npm run build

cd ../backend
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

Start command:

```bash
cd backend
gunicorn backend.wsgi
```

### 13.3 Render Setup

1. Create one Web Service pointing at this repo.
2. Build Command: `./build.sh` (repo root).
3. Start Command: `cd backend && gunicorn backend.wsgi`.
4. Set environment variables from `backend/.env.render.example`
   (`DJANGO_ALLOWED_HOSTS` / `DJANGO_CSRF_TRUSTED_ORIGINS` should list the
   Render domain and any custom domain — no separate frontend domain is
   needed anymore).
5. **Attach a persistent disk** mounted at `backend/` (or at least covering
   `db.sqlite3` and `media/`). Without one, Render's filesystem is
   ephemeral and every deploy/restart wipes the SQLite database and all
   uploaded images. This is required, not optional, for this setup.

### 13.4 Production Checklist

- Set `DJANGO_DEBUG=False`.
- Set a strong `DJANGO_SECRET_KEY`.
- Configure `DJANGO_ALLOWED_HOSTS` and `DJANGO_CSRF_TRUSTED_ORIGINS`.
- Attach a persistent disk for `db.sqlite3` and `media/` (see 13.3).
- Run migrations and collect static files (handled by `build.sh`).
- Configure HTTPS (Render provides this automatically, including for
  custom domains).
- Configure SMTP if booking emails should be sent.

## 14. Troubleshooting

### 14.1 `Python was not found`

Install Python from python.org and enable "Add python.exe to PATH", or use:

```powershell
py --version
```

Then use `py` in place of `python`.

### 14.2 Vite Proxy Error: `ECONNREFUSED 127.0.0.1:8000`

The frontend is running but Django is not.

Start backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver 127.0.0.1:8000
```

### 14.3 Admin Upload Rejects HEIC

Make sure dependencies are installed:

```powershell
cd backend
python -m pip install -r requirements.txt
```

Then restart the backend server.

### 14.4 Image Larger Than 25 MB

The backend rejects images larger than 25 MB. Resize the image before upload or increase `MAX_IMAGE_SIZE` in `backend/api/models.py`.

### 14.5 Package Price Not Updating on Frontend

Check:

- Backend server is running.
- The destination was saved in Django admin.
- Browser was refreshed.
- `/api/home/` returns the updated `price_usd`.

### 14.6 Static or Media Images Not Loading

In local development:

- Keep Django running on port `8000`.
- Keep Vite running on port `5173`.
- Vite proxies `/media` to Django.

In production:

- Configure media file hosting.
- Ensure `MEDIA_URL` paths are reachable.

## 15. Maintenance Notes

Run checks regularly:

```powershell
cd backend
python manage.py check
python manage.py migrate
```

Build frontend before deployment:

```powershell
cd frontend
npm run build
```

Review changed files before committing:

```powershell
git status
git diff
```

Commit example:

```powershell
git add README.md docs/APP_DOCUMENTATION.md backend/api/image_processing.py backend/api/models.py backend/requirements.txt scripts/resize_images.py
git commit -m "Document tour guide app and image workflow"
git push
```
