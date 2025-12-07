#!/bin/bash
# Content Portal - Automated Setup Script
# Run this script on your local machine with gcloud CLI installed

set -e  # Exit on any error

echo "================================================"
echo "Content Portal - Automated Setup"
echo "================================================"
echo ""

# Configuration
PROJECT_ID="content-portal-prod-480202"
REGION="us-central1"
SA_NAME="content-portal-sa"
APP_NAME="content-portal"

echo "Setting up project: $PROJECT_ID"
echo ""

# Step 1: Set project
echo "Step 1/10: Configuring Google Cloud project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable APIs
echo "Step 2/10: Enabling required APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable drive.googleapis.com
gcloud services enable sheets.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable iam.googleapis.com

echo "✓ APIs enabled"

# Step 3: Create service account
echo "Step 3/10: Creating service account..."
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if service account exists
if gcloud iam service-accounts describe $SA_EMAIL >/dev/null 2>&1; then
    echo "Service account already exists: $SA_EMAIL"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="Content Portal Service Account"
    echo "✓ Service account created: $SA_EMAIL"
fi

# Step 4: Grant permissions
echo "Step 4/10: Granting service account permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None

echo "✓ Permissions granted"

# Step 5: Create service account key
echo "Step 5/10: Creating service account key..."
KEY_FILE="./service-account-key.json"
if [ -f "$KEY_FILE" ]; then
    echo "Key file already exists, skipping..."
else
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL
    echo "✓ Service account key created: $KEY_FILE"
fi

# Extract values from service account key
GOOGLE_PROJECT_ID=$(cat $KEY_FILE | grep -o '"project_id": "[^"]*' | cut -d'"' -f4)
GOOGLE_CLIENT_EMAIL=$(cat $KEY_FILE | grep -o '"client_email": "[^"]*' | cut -d'"' -f4)
GOOGLE_PRIVATE_KEY=$(cat $KEY_FILE | grep -o '"private_key": "[^"]*' | sed 's/"private_key": "//')

echo "✓ Service account credentials extracted"

# Step 6: Generate secrets
echo "Step 6/10: Generating secure secrets..."
JWT_SECRET=$(openssl rand -hex 32)
AUTOMATION_API_KEY=$(openssl rand -hex 32)

echo "✓ Secrets generated"

# Step 7: Create secrets in Secret Manager
echo "Step 7/10: Creating secrets in Secret Manager..."

# JWT Secret
if gcloud secrets describe jwt-secret >/dev/null 2>&1; then
    echo "jwt-secret already exists, updating..."
    echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-
else
    echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-
fi

# Automation API Key
if gcloud secrets describe automation-api-key >/dev/null 2>&1; then
    echo "automation-api-key already exists, updating..."
    echo -n "$AUTOMATION_API_KEY" | gcloud secrets versions add automation-api-key --data-file=-
else
    echo -n "$AUTOMATION_API_KEY" | gcloud secrets create automation-api-key --data-file=-
fi

# Google Private Key
if gcloud secrets describe google-private-key >/dev/null 2>&1; then
    echo "google-private-key already exists, updating..."
    echo -n "$GOOGLE_PRIVATE_KEY" | gcloud secrets versions add google-private-key --data-file=-
else
    echo -n "$GOOGLE_PRIVATE_KEY" | gcloud secrets create google-private-key --data-file=-
fi

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in jwt-secret automation-api-key google-private-key; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:${COMPUTE_SA}" \
        --role="roles/secretmanager.secretAccessor"
done

echo "✓ Secrets created in Secret Manager"

# Step 8: Display manual steps needed
echo ""
echo "================================================"
echo "MANUAL STEPS REQUIRED"
echo "================================================"
echo ""
echo "Step 8/10: Create Google Drive Folder"
echo "  1. Go to: https://drive.google.com"
echo "  2. Create new folder: 'Content Portal Uploads'"
echo "  3. Right-click → Share"
echo "  4. Add email: $SA_EMAIL"
echo "  5. Set permission: Editor"
echo "  6. Copy the Folder ID from URL"
echo "  7. Save it as: DRIVE_FOLDER_ID"
echo ""
read -p "Enter Drive Folder ID: " DRIVE_FOLDER_ID
echo ""

echo "Step 9/10: Create Google Sheets Database"
echo "  1. Go to: https://sheets.google.com"
echo "  2. Create new spreadsheet: 'Content Portal Database'"
echo "  3. Right-click → Share"
echo "  4. Add email: $SA_EMAIL"
echo "  5. Set permission: Editor"
echo "  6. Copy the Spreadsheet ID from URL"
echo "  7. Create 5 tabs (see sheets-setup.md for structure)"
echo ""
read -p "Enter Spreadsheet ID: " SPREADSHEET_ID
echo ""

# Step 10: Create .env file
echo "Step 10/10: Creating .env file..."
cat > .env << EOF
# ===========================================
# Server Configuration
# ===========================================
PORT=8080
NODE_ENV=development

# ===========================================
# Google Cloud Credentials
# ===========================================
GOOGLE_PROJECT_ID=$GOOGLE_PROJECT_ID
GOOGLE_CLIENT_EMAIL=$GOOGLE_CLIENT_EMAIL
GOOGLE_PRIVATE_KEY="$GOOGLE_PRIVATE_KEY"

# ===========================================
# Google Sheets IDs
# ===========================================
SPREADSHEET_ID=$SPREADSHEET_ID
CONTENT_SHEET_NAME=Content_Log
AUDIT_SHEET_NAME=Admin_Audit_Log
CATEGORIES_SHEET_NAME=Categories
CONFIG_SHEET_NAME=Configuration
ADMINS_SHEET_NAME=Admins

# ===========================================
# Google Drive
# ===========================================
DRIVE_FOLDER_ID=$DRIVE_FOLDER_ID

# ===========================================
# JWT Authentication
# ===========================================
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=8h

# ===========================================
# Rate Limiting
# ===========================================
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=5

# ===========================================
# Automation API
# ===========================================
AUTOMATION_API_KEY=$AUTOMATION_API_KEY

# ===========================================
# Application Settings
# ===========================================
APP_NAME=Content Ingest Portal
WAIVER_URL=https://drive.google.com/file/d/1MjyAYAcSe1_KJeCfSSSTs67TnupdLEmw/view?usp=drive_link
MAX_FILE_SIZE_MB=500
EOF

echo "✓ .env file created"

# Save credentials for later
cat > deployment-info.txt << EOF
================================================
DEPLOYMENT INFORMATION
================================================

Service Account Email: $SA_EMAIL
JWT Secret: $JWT_SECRET
Automation API Key: $AUTOMATION_API_KEY

SAVE THESE SECURELY!

================================================
NEXT STEPS
================================================

1. Complete Google Drive and Sheets setup (above)
2. Run: npm run install:all
3. Run: npm run dev (to test locally)
4. Run: ./deploy.sh (to deploy to Cloud Run)

================================================
EOF

echo ""
echo "✓ Setup complete!"
echo ""
echo "Important files created:"
echo "  - .env (environment variables)"
echo "  - service-account-key.json (credentials)"
echo "  - deployment-info.txt (important info)"
echo ""
echo "Next: Complete manual steps for Drive/Sheets, then run deployment script"
