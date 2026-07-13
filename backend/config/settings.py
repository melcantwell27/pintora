"""
Django settings for Pintora.

Environment variables are loaded from backend/.env (see backend/.env.example).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-dev-only-change-me",
)

DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "allauth",
    "allauth.account",
    "allauth.headless",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "users",
    "recipes",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"

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

WSGI_APPLICATION = "config.wsgi.application"

_database_url = os.environ.get("DATABASE_URL")
if _database_url:
    import dj_database_url
    DATABASES = {"default": dj_database_url.config(conn_max_age=600, ssl_require=True)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("POSTGRES_DB", "pintora"),
            "USER": os.environ.get("POSTGRES_USER", "pintora"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "pintora"),
            "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SITE_ID = 1

AUTH_USER_MODEL = "users.User"

# django-allauth
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*", "password2*"]
ACCOUNT_EMAIL_VERIFICATION = "optional"

# Dev: print auth emails to the terminal instead of requiring SMTP.
if DEBUG:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# allauth headless — SPA API under /_allauth/. Email links (verify/reset) point
# back to the Next.js app rather than Django's built-in views.
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3001")
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": f"{FRONTEND_ORIGIN}/account/verify-email/{{key}}",
    "account_reset_password": f"{FRONTEND_ORIGIN}/account/password/reset",
    "account_reset_password_from_key": (
        f"{FRONTEND_ORIGIN}/account/password/reset/key/{{key}}"
    ),
    "account_signup": f"{FRONTEND_ORIGIN}/signup",
    # Fallback if the social handshake loses its state.
    "socialaccount_login_error": f"{FRONTEND_ORIGIN}/login",
}

# Google social login. Credentials come from env, so no DB SocialApp is needed.
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.environ.get("GOOGLE_OAUTH_CLIENT_ID", ""),
            "secret": os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET", ""),
            "key": "",
        },
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
    }
}
# Let Google-verified emails log a user in and skip extra verification.
SOCIALACCOUNT_EMAIL_AUTHENTICATION = True
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"

# django-cors-headers — Next.js dev server
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3001",
    ).split(",")
    if origin.strip()
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CSRF_TRUSTED_ORIGINS",
        "http://localhost:3001",
    ).split(",")
    if origin.strip()
]

# Cookie settings — dev uses Lax (same-site localhost), production uses None+Secure
# because the SPA and API are on different DigitalOcean subdomains.
# CSRF_COOKIE_HTTPONLY must stay False so JS can read the token for X-CSRFToken.
_cross_site = not DEBUG
SESSION_COOKIE_SAMESITE = "None" if _cross_site else "Lax"
SESSION_COOKIE_SECURE = _cross_site
CSRF_COOKIE_SAMESITE = "None" if _cross_site else "Lax"
CSRF_COOKIE_SECURE = _cross_site
CSRF_COOKIE_HTTPONLY = False

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Pintora API",
    "DESCRIPTION": "Share and discover Ninja Creami recipes.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
