#!/bin/bash
echo "Creating Migrations..."
python project/manage.py makemigrations base_app
echo ====================================

echo "Starting Migrations..."
python project/manage.py migrate
echo ====================================

python project/manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL

echo "Starting Server..."
python project/manage.py runserver 0.0.0.0:8000

