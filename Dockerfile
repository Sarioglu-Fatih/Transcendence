# Use the Python base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files to the working directory
COPY . /app/


# Port to expose
EXPOSE 8000

# Command to run the Django server
CMD ["python", "project/manage.py", "runserver", "0.0.0.0:8000"]

