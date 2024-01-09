# Use a small Nginx image as a base
FROM nginx:latest


# Copy repo
COPY . /usr/share/nginx/html/

# Copy the custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

# Expose port 80 (default HTTP port)
EXPOSE 80