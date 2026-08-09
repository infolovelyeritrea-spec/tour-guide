#!/usr/bin/env bash
set -o errexit

cd frontend
npm install
npm run build

cd ../backend
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
