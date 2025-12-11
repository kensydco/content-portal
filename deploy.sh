#!/bin/bash
# Deployment Script for Google Cloud Run

set -e

PROJECT_ID="content-portal-prod-480202"
REGION="us-central1"
SERVICE_NAME="content-portal"

echo "================================================"
echo "Deploying to Google Cloud Run"
echo "================================================"
echo ""

# Load environment variables
if [ ! -f .env ]; then
    echo "Error: .env file not found. Run setup.sh first."
    exit 1
fi

# Load specific variables from .env
GOOGLE_PROJECT_ID=$(grep GOOGLE_PROJECT_ID .env | cut -d '=' -f2)
GOOGLE_CLIENT_EMAIL=$(grep GOOGLE_CLIENT_EMAIL .env | cut -d '=' -f2)
SPREADSHEET_ID=$(grep SPREADSHEET_ID .env | cut -d '=' -f2)
DRIVE_FOLDER_ID=$(grep DRIVE_FOLDER_ID .env | cut -d '=' -f2)
WAIVER_URL=$(grep WAIVER_URL .env | cut -d '=' -f2)

echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo ""

# Build the container image using Cloud Build
echo "Building container image (this will take a few minutes)..."
COMMIT_SHA=$(git rev-parse --short HEAD)
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=COMMIT_SHA=$COMMIT_SHA \
  --project=$PROJECT_ID

if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

IMAGE_URL="gcr.io/$PROJECT_ID/$SERVICE_NAME:$COMMIT_SHA"
echo ""
echo "✓ Build complete: $IMAGE_URL"
echo ""

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URL \
  --region $REGION \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_PROJECT_ID=$GOOGLE_PROJECT_ID" \
  --set-env-vars "GOOGLE_CLIENT_EMAIL=$GOOGLE_CLIENT_EMAIL" \
  --set-env-vars "SPREADSHEET_ID=$SPREADSHEET_ID" \
  --set-env-vars "DRIVE_FOLDER_ID=$DRIVE_FOLDER_ID" \
  --set-env-vars "WAIVER_URL=$WAIVER_URL" \
  --set-env-vars "CONTENT_SHEET_NAME=Content_Log" \
  --set-env-vars "AUDIT_SHEET_NAME=Admin_Audit_Log" \
  --set-env-vars "CATEGORIES_SHEET_NAME=Categories" \
  --set-env-vars "CONFIG_SHEET_NAME=Configuration" \
  --set-env-vars "ADMINS_SHEET_NAME=Admins" \
  --set-secrets "GOOGLE_PRIVATE_KEY=google-private-key:latest" \
  --set-secrets "JWT_SECRET=jwt-secret:latest" \
  --set-secrets "AUTOMATION_API_KEY=automation-api-key:latest"

echo ""
echo "✓ Deployment complete!"
echo ""

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
  --region $REGION \
  --format="value(status.url)")

echo "================================================"
echo "YOUR APPLICATION IS LIVE!"
echo "================================================"
echo ""
echo "Member Upload: $SERVICE_URL/"
echo "Admin Login: $SERVICE_URL/admin/login"
echo ""
echo "Admin Credentials:"
echo "  Email: kenneth.burnett@hotworx.net"
echo "  Password: [the one you provided]"
echo ""
echo "================================================"
