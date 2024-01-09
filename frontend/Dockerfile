# Use a small Nginx image as a base
FROM nginx:latest

# Copy the custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

# Expose port 80 (default HTTP port)
EXPOSE 80