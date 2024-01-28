#!/bin/bash
echo "Creating Migrations..."
sleep 3
python manage.py makemigrations api
echo ====================================

echo "Starting Migrations..."
python manage.py migrate
echo ====================================

python manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL

python manage.py collectstatic --noinput

echo "Starting Server..."
# Create a folder for daphne.sock
SOCK_DIR="/app/daphne_sock"
mkdir -p $SOCK_DIR

# Remove daphne.sock if it exists
if [ -e $SOCK_DIR/daphne.sock ]; then
    rm $SOCK_DIR/daphne.sock
    rm $SOCK_DIR/daphne.sock.lock
fi

while inotifywait -e modify,create,delete,move -r /app; do
    python manage.py collectstatic --noinput
done &
   
# daphne backend.asgi:application -u $SOCK_DIR/daphne.sock
hupper -m daphne -u $SOCK_DIR/daphne.sock backend.asgi:application -v
   