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
if not username or not password:
    print("DJANGO_SUPERUSER_USERNAME/PASSWORD not set; skipping superuser setup.")
else:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={"email": email, "is_staff": True, "is_superuser": True},
    )
    user.email = email or user.email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    print(("Created" if created else "Updated password for existing") + " superuser " + username)
'
python manage.py shell -c "$CREATE_SUPERUSER_CODE"
