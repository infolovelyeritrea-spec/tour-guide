import os
from importlib.util import find_spec
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
HAS_WHITENOISE = find_spec("whitenoise") is not None


def load_env_file(path):
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def env_bool(name, default=False):
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name, default):
    value = os.getenv(name)
    if value is None:
        return default
    return int(value.strip())


def env_list(name, default=""):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


load_env_file(BASE_DIR / ".env")

DEBUG = env_bool("DJANGO_DEBUG", True)
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-eritrea-tour-guide-demo-key")

if not DEBUG and SECRET_KEY == "django-insecure-eritrea-tour-guide-demo-key":
    raise RuntimeError("Set DJANGO_SECRET_KEY before running with DJANGO_DEBUG=False.")

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,lovelyeritrea.onrender.com" if DEBUG else "")
if DEBUG and not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if HAS_WHITENOISE:
    MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

db_name = os.getenv("DJANGO_DB_NAME", "").strip()

if db_name:
    db_options = {}
    db_sslmode = os.getenv("DJANGO_DB_SSLMODE", "").strip()
    if db_sslmode:
        db_options["sslmode"] = db_sslmode

    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": db_name,
            "USER": os.getenv("DJANGO_DB_USER", "postgres"),
            "PASSWORD": os.getenv("DJANGO_DB_PASSWORD", ""),
            "HOST": os.getenv("DJANGO_DB_HOST", "127.0.0.1"),
            "PORT": env_int("DJANGO_DB_PORT", 5432),
            "CONN_MAX_AGE": env_int("DJANGO_DB_CONN_MAX_AGE", 60),
            "OPTIONS": db_options,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Asmara"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
if HAS_WHITENOISE:
    STORAGES = {
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        }
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

local_origins = "http://localhost:5173,http://127.0.0.1:5173"
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env_list("DJANGO_CORS_ALLOWED_ORIGINS", local_origins if DEBUG else "")
CSRF_TRUSTED_ORIGINS = env_list("DJANGO_CSRF_TRUSTED_ORIGINS", local_origins if DEBUG else "")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ]
}
