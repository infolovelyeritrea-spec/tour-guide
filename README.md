# Eritrea Tour Guide

A full-stack tourism website for Eritrea with a React frontend, Django REST API backend, booking workflow, public reviews, visitor analytics, Django admin content management, and an admin dashboard.

## Quick Start

### Backend

```powershell
cd "D:\2026 Projects\Tour Guide\backend"
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

If the virtual environment does not exist yet:

```powershell
cd "D:\2026 Projects\Tour Guide\backend"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### Frontend

Open a second terminal:

```powershell
cd "D:\2026 Projects\Tour Guide\frontend"
npm install
npm run dev
```

Local URLs:

- Public site: `http://localhost:5173`
- Django API/admin: `http://127.0.0.1:8000`
- Django admin: `http://127.0.0.1:8000/admin/`
- React admin dashboard: `http://localhost:5173/admin`

## Documentation

Full project documentation is available at [docs/APP_DOCUMENTATION.md](docs/APP_DOCUMENTATION.md).

It covers:

- Project architecture
- Local development setup
- Environment variables
- Backend models and API endpoints
- Admin panel workflows
- Image upload optimization
- Image resize script usage
- Frontend behavior
- Deployment notes
- Troubleshooting

## Common Commands

```powershell
# Backend checks
cd backend
python manage.py check
python manage.py migrate

# Frontend build
cd frontend
npm run build

# Resize existing tour package images
cd "D:\2026 Projects\Tour Guide"
.\backend\.venv\Scripts\python.exe scripts\resize_images.py frontend\public\images\tour-packages --recursive --preset tour-package
```

## Notes

- Destination and destination gallery images uploaded through Django admin are automatically converted to WebP, resized/cropped to `1200x740`, and compressed.
- Admin uploads accept common image formats including JPG, PNG, WebP, HEIC, and HEIF, as long as the backend image libraries can decode them.
- The current upload limit is `25 MB` per image.
