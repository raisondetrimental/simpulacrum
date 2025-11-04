# Azure App Service Deployment

This directory contains configuration files for deploying the Flask backend to Azure App Service.

## Files

- **`.deployment`** - Azure deployment configuration (tells Azure how to deploy)
- **`deploy.sh`** - Deployment script executed by Azure during deployment
- **`README.md`** - This file

## Deployment Process

The backend is deployed to Azure App Service (Linux) using:
- Python 3.x runtime
- Gunicorn as WSGI server
- Port 8000 (Azure standard)

## Entry Point

The application entry point is `backend/startup.py`, which:
- Sets FLASK_ENV=production
- Imports app from `backend/src/app.py`
- Runs on port 8000

## Manual Deployment

To deploy manually to Azure:

```bash
cd backend
zip -r ../deploy.zip src/ startup.py requirements/
az webapp deploy --name <app-name> --resource-group <rg-name> --src-path ../deploy.zip --type zip
```

## Environment Variables

Set these in Azure App Service configuration:
- `PORT=8000` (required by Azure)
- `DATA_DIR=/home/site/data` (Azure persistent storage)
- `FLASK_ENV=production`
- `SECRET_KEY` (generate secure key for sessions)

## Notes

- Excel COM automation NOT supported on Linux (requires Windows VM)
- Storage directory should be mounted as persistent volume
- CORS configured in `backend/src/config.py`
