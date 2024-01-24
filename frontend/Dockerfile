# Use a small Nginx image as a base
FROM nginx:latest

# Copy repo
COPY . /usr/share/nginx/html/

# Copy the custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

RUN apt-get update

RUN mkdir -p /etc/nginx/ssl

RUN apt-get install openssl -y

RUN openssl req -x509 -nodes -out /etc/nginx/ssl/transcendence.crt -keyout /etc/nginx/ssl/transcendence.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=login.42.fr/UID=login"

EXPOSE 8001