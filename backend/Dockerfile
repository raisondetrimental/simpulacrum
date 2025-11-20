# Use lightweight Python
FROM python:3.10-slim

WORKDIR /app

# Install only the API dependencies
COPY requirements-app.txt .
RUN pip install --no-cache-dir -r requirements-app.txt

# Copy entire backend code
COPY . .

# Expose the port used by Gunicorn
EXPOSE 8000

# Start Flask using Gunicorn and the application factory output
CMD ["gunicorn", "-b", "0.0.0.0:8000", "--timeout", "600", "-k", "gthread", "--log-level", "info", "--access-logfile", "-", "--error-logfile", "-", "src.app:app"]


