# Use the Python base image
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app

RUN apt-get update && apt-get install -y inotify-tools

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir -q requests

COPY . /app

RUN mkdir -p /app/

CMD ["./entrypoint.sh"]
