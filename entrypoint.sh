#!/bin/bash
echo "Creating Migrations..."
python backend/manage.py makemigrations base_app
echo ====================================

echo "Starting Migrations..."
python backend/manage.py migrate
echo ====================================

python backend/manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL

echo "Starting Server..."
python backend/manage.py runserver 0.0.0.0:8000

