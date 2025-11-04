#!/bin/bash
# Deploy React frontend to Azure Static Web Apps

set -e

echo "🚀 Deploying Meridian Dashboard Frontend to Azure Static Web Apps"
echo ""

# Configuration
RESOURCE_GROUP="meridian-dashboard-rg"
APP_NAME="meridian-dashboard-frontend"

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

# Navigate to frontend directory
cd "$(dirname "$0")/../../frontend"

# Build frontend
echo "📦 Building frontend for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Deploy using Azure Static Web Apps CLI or Azure CLI
echo "☁️  Deploying to Azure Static Web Apps..."
echo ""
echo "⚠️  Note: Azure Static Web Apps deployment typically uses GitHub Actions"
echo "    or SWA CLI. For manual deployment:"
echo ""
echo "    1. Using SWA CLI:"
echo "       npm install -g @azure/static-web-apps-cli"
echo "       swa deploy ./dist --app-name $APP_NAME"
echo ""
echo "    2. Using Azure Portal:"
echo "       - Navigate to Static Web App resource"
echo "       - Upload dist/ folder manually"
echo ""
echo "    3. Using GitHub Actions (recommended):"
echo "       - Push to GitHub"
echo "       - Automatic deployment via workflow"
echo ""

echo "Build artifacts ready at: frontend/dist/"
