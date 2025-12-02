# Social Media Content Ingest Portal

Mobile-first web application for collecting user-generated content for social media usage. Single deployment architecture on Google Cloud Run.

## Architecture

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Express + TypeScript + Node.js 20
- **Storage:** Google Drive (files) + Google Sheets (metadata)
- **Deployment:** Single container on Google Cloud Run

## Features

### Member Portal
- Mobile-optimized upload interface
- Support for images (.jpg, .jpeg, .png, .heic) and videos (.mp4, .mov)
- File size up to 500MB
- Content categorization
- Waiver agreement tracking
- QR code source tracking

### Admin Dashboard
- Submission review and management
- Bulk actions (approve, reject, archive)
- Content scheduling (start/end dates)
- Category management
- Role-based access control (SuperAdmin, Editor, Viewer)
- Audit logging

### API
- RESTful API for all operations
- JWT-based authentication
- Rate limiting
- Automation endpoint for downstream integrations

## Quick Start (Local Development)

### Prerequisites
- Node.js 20.x
- Google Cloud project with Drive and Sheets APIs enabled
- Service account JSON credentials

### 1. Clone and Install

```bash
git clone <repo-url>
cd content-ingest-portal

# Install all dependencies (root, client, and server)
npm run install:all
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Google credentials and settings
```

### 3. Set Up Google Sheets

Create a Google Spreadsheet with these sheet tabs:

1. **Content_Log** - Headers:
   - Submission_ID, Timestamp, Uploader_Name, Uploader_Email, Uploader_Phone, File_Drive_URL, File_ID, File_Size_MB, Upload_Device, Category, Description, Source_QR_ID, Waiver_Agreed, Waiver_Timestamp, AI_Tags, Duplicate_Detected, Admin_Start_Date, Admin_End_Date, Status, Admin_Notes, Archive_Flag

2. **Admin_Audit_Log** - Headers:
   - Audit_ID, Timestamp, Admin_Email, Action_Type, Target_ID, Old_Value, New_Value, Notes

3. **Categories** - Headers:
   - Category_ID, Name, Description, Is_Active, Created_At

4. **Configuration** - Headers:
   - Key, Value

5. **Admins** - Headers:
   - Admin_ID, Email, Password_Hash, Role, Is_Active, Created_At, Last_Login

Share the spreadsheet with your service account email (Editor access).

### 4. Create Initial Admin

Add a row to the Admins sheet:

```
Admin_ID: (use a UUID generator like https://www.uuidgenerator.net/)
Email: admin@yourcompany.com
Password_Hash: (use bcrypt to hash your password, cost factor 12)
Role: SuperAdmin
Is_Active: TRUE
Created_At: 2025-01-01T00:00:00Z
Last_Login: (leave empty)
```

To generate a bcrypt hash, you can use online tools or Node.js:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 12);
console.log(hash);
```

### 5. Run Development Server

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:8080
- API calls from client are proxied to server automatically

## Production Deployment (Google Cloud Run)

### 1. Set Up Secrets

```bash
# Create secrets in Secret Manager
echo -n "your-jwt-secret-min-32-chars" | \
  gcloud secrets create jwt-secret --data-file=-

echo -n "your-automation-api-key" | \
  gcloud secrets create automation-api-key --data-file=-

# For the Google private key (from service account JSON)
# Extract the private_key field from your service account JSON
gcloud secrets create google-private-key --data-file=private-key.txt

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

for SECRET in jwt-secret automation-api-key google-private-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 2. Deploy

```bash
gcloud run deploy content-portal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_PROJECT_ID=your-project-id" \
  --set-env-vars "GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com" \
  --set-env-vars "SPREADSHEET_ID=your-spreadsheet-id" \
  --set-env-vars "DRIVE_FOLDER_ID=your-folder-id" \
  --set-secrets "GOOGLE_PRIVATE_KEY=google-private-key:latest" \
  --set-secrets "JWT_SECRET=jwt-secret:latest" \
  --set-secrets "AUTOMATION_API_KEY=automation-api-key:latest"
```

### 3. Get Your URL

```bash
gcloud run services describe content-portal \
  --region us-central1 \
  --format="value(status.url)"
```

## Project Structure

```
/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utility functions
│   │   ├── context/          # React contexts
│   │   └── types/            # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── tsconfig.json
│
├── Dockerfile                # Multi-stage build
├── package.json              # Root scripts
├── .env.example              # Environment template
└── README.md
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/upload | Submit content (member) | None |
| POST | /api/auth/login | Admin login | None |
| POST | /api/auth/logout | Admin logout | JWT |
| GET | /api/auth/me | Get current user | JWT |
| GET | /api/admin/submissions | List submissions | JWT (Viewer+) |
| GET | /api/admin/submissions/:id | Get submission | JWT (Viewer+) |
| PATCH | /api/admin/submissions/:id | Update submission | JWT (Editor+) |
| POST | /api/admin/submissions/bulk | Bulk actions | JWT (Editor+) |
| GET | /api/admin/categories | List categories | JWT (Viewer+) |
| POST | /api/admin/categories | Create category | JWT (SuperAdmin) |
| PATCH | /api/admin/categories/:id | Update category | JWT (SuperAdmin) |
| DELETE | /api/admin/categories/:id | Delete category | JWT (SuperAdmin) |
| GET | /api/config/public | Get public config | None |
| GET | /api/config | Get full config | JWT (SuperAdmin) |
| PATCH | /api/config | Update config | JWT (SuperAdmin) |
| GET | /api/automation/content | Get approved content | API Key or JWT |

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables
- `GOOGLE_PROJECT_ID` - Your Google Cloud project ID
- `GOOGLE_CLIENT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `SPREADSHEET_ID` - Main Google Spreadsheet ID
- `DRIVE_FOLDER_ID` - Google Drive folder for uploads
- `JWT_SECRET` - Secret for JWT signing (min 32 characters)

## Security Features

- JWT-based authentication
- Role-based access control (SuperAdmin, Editor, Viewer)
- Rate limiting on uploads (5/hour/IP)
- Rate limiting on login (5 attempts/15 min)
- Input validation with Zod
- File type and size validation
- Helmet.js security headers
- CORS configuration
- Audit logging for all admin actions

## Scripts

```bash
# Development
npm run dev                 # Run both client and server
npm run dev:client          # Run client only
npm run dev:server          # Run server only

# Building
npm run build               # Build both client and server
npm run build:client        # Build client only
npm run build:server        # Build server only

# Production
npm start                   # Start production server

# Installation
npm run install:all         # Install all dependencies

# Deployment
npm run deploy              # Deploy to Cloud Run
```

## Troubleshooting

### Common Issues

1. **Google Sheets API errors**
   - Ensure the service account has Editor access to the spreadsheet
   - Verify the SPREADSHEET_ID is correct
   - Check that all required sheet tabs exist with correct headers

2. **Google Drive upload fails**
   - Ensure the service account has Editor access to the Drive folder
   - Verify DRIVE_FOLDER_ID is correct
   - Check file size is under 500MB

3. **JWT authentication errors**
   - Ensure JWT_SECRET is at least 32 characters
   - Check token hasn't expired (default 8 hours)
   - Verify Authorization header format: `Bearer <token>`

4. **Build fails**
   - Delete node_modules and package-lock.json in all directories
   - Run `npm run install:all` again
   - Check Node.js version is 20.x

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
