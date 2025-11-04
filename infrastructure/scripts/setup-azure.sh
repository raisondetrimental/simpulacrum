#!/bin/bash
# Set up Azure resources for Meridian Dashboard

set -e

echo "☁️  Meridian Dashboard - Azure Resource Setup"
echo ""

# Configuration
RESOURCE_GROUP="meridian-dashboard-rg"
LOCATION="eastus"
BACKEND_APP_NAME="meridian-dashboard-backend"
FRONTEND_APP_NAME="meridian-dashboard-frontend"
APP_SERVICE_PLAN="meridian-dashboard-plan"
SKU="B1"  # Basic tier

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure
echo "Checking Azure login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Not logged in to Azure. Running az login..."
    az login
fi
echo "✅ Azure login confirmed"
echo ""

# Create Resource Group
echo "1️⃣  Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
echo "✅ Resource group created"
echo ""

# Create App Service Plan
echo "2️⃣  Creating App Service Plan: $APP_SERVICE_PLAN"
az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --is-linux \
    --sku "$SKU"
echo "✅ App Service Plan created"
echo ""

# Create Backend Web App
echo "3️⃣  Creating backend web app: $BACKEND_APP_NAME"
az webapp create \
    --name "$BACKEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --runtime "PYTHON:3.11"
echo "✅ Backend web app created"
echo ""

# Configure Backend App Settings
echo "4️⃣  Configuring backend app settings..."
az webapp config appsettings set \
    --name "$BACKEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings \
        PORT=8000 \
        FLASK_ENV=production \
        DATA_DIR=/home/site/data \
        STORAGE_DIR=/home/site/storage
echo "✅ Backend configured"
echo ""

# Create Static Web App (Frontend)
echo "5️⃣  Creating frontend static web app: $FRONTEND_APP_NAME"
az staticwebapp create \
    --name "$FRONTEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Free
echo "✅ Frontend static web app created"
echo ""

# Summary
echo "🎉 Azure resources created successfully!"
echo ""
echo "Resources:"
echo "  Resource Group:  $RESOURCE_GROUP"
echo "  App Service Plan: $APP_SERVICE_PLAN (SKU: $SKU)"
echo "  Backend App:     https://$BACKEND_APP_NAME.azurewebsites.net"
echo "  Frontend App:    https://$FRONTEND_APP_NAME.azurestaticapps.net"
echo ""
echo "Next steps:"
echo "  1. Deploy backend:  ./infrastructure/scripts/deploy-backend.sh"
echo "  2. Deploy frontend: ./infrastructure/scripts/deploy-frontend.sh"
echo "  3. Configure CORS in backend to allow frontend domain"
echo "  4. Set SECRET_KEY in backend app settings (generate secure key)"
