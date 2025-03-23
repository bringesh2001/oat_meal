#!/usr/bin/env bash
set -e

# 1. Activate the virtual environment
source /app/venv/bin/activate

pip install sentence-transformers
# 2. Run migrations (optional, but common)
python manage.py makemigrations users
python manage.py migrate
python manage.py makemigrations
python manage.py migrate

# 3. Start Gunicorn in the background
gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 6 \
    --timeout 120 &

# 4. Start Nginx in the foreground
exec nginx -g 'daemon off;'
