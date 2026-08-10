#!/usr/bin/env bash
set -o errexit

cd frontend
npm install
npm run build

cd ../backend
python -m pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

CREATE_SUPERUSER_CODE='
import os
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
if username and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print("Created superuser " + username)
else:
    print("Superuser already exists or DJANGO_SUPERUSER_* vars not set; skipping.")
'
python manage.py shell -c "$CREATE_SUPERUSER_CODE"
