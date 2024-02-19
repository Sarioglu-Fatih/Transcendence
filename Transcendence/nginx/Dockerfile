# Use the official Nginx base image
FROM nginx:latest

# Remove the default Nginx configuration
RUN rm /etc/nginx/nginx.conf

# Copy your custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create a directory for SSL certificates
RUN mkdir -p /etc/nginx/certs

RUN apt update -y && apt upgrade -y

RUN apt install openssl -y

RUN openssl req -x509 -nodes -out /etc/nginx/certs/nginx.crt -keyout /etc/nginx/certs/nginx.key -subj "/C=FR/ST=RA/L=Lyon/O=42/OU=42/CN=login.42.fr/UID=login"


# Expose ports
EXPOSE 8000
EXPOSE 8443

# Set the working directory
WORKDIR /app

# Copy the application code
COPY . /app

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]