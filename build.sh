#!/usr/bin/env bash
set -o errexit

cd backend
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
