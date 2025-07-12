#!/bin/bash

# Production startup script
export FLASK_ENV=production
export FLASK_DEBUG=False

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create one based on .env.example"
    exit 1
fi

# Check if required environment variables are set
source .env

if [ -z "$SECRET_KEY" ] || [ "$SECRET_KEY" = "your-super-secret-key-change-this-in-production" ]; then
    echo "Error: Please set a secure SECRET_KEY in .env"
    exit 1
fi

if [ -z "$MONGODB_URI" ] || [[ "$MONGODB_URI" == *"username:password"* ]]; then
    echo "Error: Please set a valid MONGODB_URI in .env"
    exit 1
fi

echo "Starting production server..."
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 --access-logfile - --error-logfile - app:app