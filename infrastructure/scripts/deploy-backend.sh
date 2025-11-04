#!/bin/bash
# Deploy Flask backend to Azure App Service

set -e

echo "🚀 Deploying Meridian Dashboard Backend to Azure App Service"
echo ""

# Configuration
RESOURCE_GROUP="meridian-dashboard-rg"
APP_NAME="meridian-dashboard-backend"
LOCATION="eastus"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
echo "Checking Azure login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Not logged in to Azure. Running az login..."
    az login
fi
echo "✅ Azure login confirmed"
echo ""

# Navigate to project root
cd "$(dirname "$0")/../.."

# Create deployment package
echo "📦 Creating deployment package..."
cd backend
zip -r ../deploy.zip src/ startup.py requirements/ -x "*.pyc" -x "*__pycache__*"
cd ..
echo "✅ Deployment package created: deploy.zip"
echo ""

# Deploy to Azure
echo "☁️  Deploying to Azure App Service: $APP_NAME"
az webapp deploy \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --src-path deploy.zip \
    --type zip

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Application URL: https://$APP_NAME.azurewebsites.net"
    echo ""
    echo "Next steps:"
    echo "  - Set environment variables in Azure Portal"
    echo "  - Configure CORS if needed"
    echo "  - Test API endpoints"
else
    echo ""
    echo "❌ Deployment failed"
    exit 1
fi

# Clean up
rm deploy.zip
