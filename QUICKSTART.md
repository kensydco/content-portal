# 🚀 Quick Start Guide - Content Portal Setup

**Estimated time:** 30-45 minutes

## Prerequisites

✅ Google Cloud account with billing enabled
✅ `gcloud` CLI installed ([Install Guide](https://cloud.google.com/sdk/docs/install))
✅ Git installed
✅ Node.js 20.x installed

---

## Step-by-Step Instructions

### 1️⃣ Authenticate with Google Cloud (2 min)

```bash
# Login to Google Cloud
gcloud auth login

# Login for application default credentials
gcloud auth application-default login
```

---

### 2️⃣ Run Setup Script (10 min)

```bash
cd /home/user/content-portal

# Make scripts executable
chmod +x setup.sh deploy.sh

# Run automated setup
./setup.sh
```

**What this does:**
- ✅ Enables Google Cloud APIs
- ✅ Creates service account
- ✅ Generates secure secrets
- ✅ Creates Secret Manager entries
- ✅ Extracts credentials

**You'll be prompted to enter:**
- Drive Folder ID (complete step 3 first)
- Spreadsheet ID (complete step 4 first)

---

### 3️⃣ Create Google Drive Folder (3 min)

1. Open [Google Drive](https://drive.google.com)
2. Click **+ New** → **Folder**
3. Name it: **Content Portal Uploads**
4. Right-click the folder → **Share**
5. Click **Add people and groups**
6. Paste service account email from setup script output:
   ```
   content-portal-sa@content-portal-prod-480202.iam.gserviceaccount.com
   ```
7. Set role to: **Editor**
8. Uncheck "Notify people"
9. Click **Share**
10. Copy the **Folder ID** from URL:
    ```
    https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9
                                            ↑ Copy this
    ```

**Save this ID** - you'll paste it into the setup script.

---

### 4️⃣ Create Google Sheets Database (10 min)

#### A. Create Spreadsheet

1. Open [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create new spreadsheet
3. Rename to: **Content Portal Database**
4. Click **Share** button (top right)
5. Add service account email: `content-portal-sa@content-portal-prod-480202.iam.gserviceaccount.com`
6. Set role to: **Editor**
7. Uncheck "Notify people"
8. Click **Share**
9. Copy the **Spreadsheet ID** from URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123XYZ456/edit
                                              ↑ Copy this
   ```

**Save this ID** - you'll paste it into the setup script.

#### B. Create Sheet Tabs

You need to create **5 tabs** (sheets) with specific data. The easiest way is copy-paste:

**Delete the default "Sheet1" tab first.**

##### Tab 1: Content_Log
1. Create new tab (click **+** at bottom), rename to: **Content_Log**
2. Click cell **A1**
3. Copy this entire block and paste:
```
Submission_ID	Timestamp	Uploader_Name	Uploader_Email	Uploader_Phone	File_Drive_URL	File_ID	File_Size_MB	Upload_Device	Category	Description	Source_QR_ID	Waiver_Agreed	Waiver_Timestamp	AI_Tags	Duplicate_Detected	Admin_Start_Date	Admin_End_Date	Status	Admin_Notes	Archive_Flag
```

##### Tab 2: Admin_Audit_Log
1. Create new tab, rename to: **Admin_Audit_Log**
2. Click cell **A1**
3. Copy and paste:
```
Audit_ID	Timestamp	Admin_Email	Action_Type	Target_ID	Old_Value	New_Value	Notes
```

##### Tab 3: Categories
1. Create new tab, rename to: **Categories**
2. Click cell **A1**
3. Copy and paste:
```
Category_ID	Name	Description	Is_Active	Created_At
cat-001	Workout	Fitness and training content	TRUE	2025-01-01T00:00:00Z
cat-002	Event	Special events and gatherings	TRUE	2025-01-01T00:00:00Z
cat-003	Testimonial	Member testimonials	TRUE	2025-01-01T00:00:00Z
```

##### Tab 4: Configuration
1. Create new tab, rename to: **Configuration**
2. Click cell **A1**
3. Copy and paste:
```
Key	Value
WAIVER_URL	https://drive.google.com/file/d/1MjyAYAcSe1_KJeCfSSSTs67TnupdLEmw/view?usp=drive_link
DEFAULT_START_OFFSET_DAYS	2
DEFAULT_END_OFFSET_DAYS	30
MAX_FILE_SIZE_MB	500
RATE_LIMIT_UPLOADS_PER_HOUR	5
```

##### Tab 5: Admins
1. Create new tab, rename to: **Admins**
2. Click cell **A1**
3. Copy and paste:
```
Admin_ID	Email	Password_Hash	Role	Is_Active	Created_At	Last_Login
admin-001	kenneth.burnett@hotworx.net	$2a$12$bV/pSDTrkcCPvvU3AldWgOGXlCfOO21Uvpbj/LYvisv.T/YE.DETi	SuperAdmin	TRUE	2025-01-01T00:00:00Z
```

**Verify:** You should now have 5 tabs at the bottom of your spreadsheet.

---

### 5️⃣ Complete Setup Script

Go back to your terminal where `setup.sh` is waiting for input:

1. Paste your **Drive Folder ID** when prompted
2. Paste your **Spreadsheet ID** when prompted

The script will complete and create:
- `.env` file with all configuration
- `service-account-key.json` with credentials
- `deployment-info.txt` with important info

---

### 6️⃣ Test Locally (5 min)

```bash
# Install all dependencies
npm run install:all

# Start development server
npm run dev
```

**Test it works:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8080/api/health

**Quick tests:**
1. Open http://localhost:5173 - Should see upload form
2. Open http://localhost:5173/admin/login
3. Login with:
   - Email: `kenneth.burnett@hotworx.net`
   - Password: `klbHwx1!`
4. Should reach admin dashboard

If all works, press `Ctrl+C` to stop the dev server.

---

### 7️⃣ Deploy to Production (10 min)

```bash
# Deploy to Google Cloud Run
./deploy.sh
```

This will:
- Build the Docker image (~5 min)
- Push to Google Cloud
- Deploy to Cloud Run
- Output your live URL

**Expected output:**
```
✓ Deployment complete!
================================================
YOUR APPLICATION IS LIVE!
================================================

Member Upload: https://content-portal-xxxxx.run.app/
Admin Login: https://content-portal-xxxxx.run.app/admin/login

Admin Credentials:
  Email: kenneth.burnett@hotworx.net
  Password: klbHwx1!
================================================
```

---

### 8️⃣ Verify Production (5 min)

1. **Test Member Upload:**
   - Visit: `https://content-portal-xxxxx.run.app/`
   - Upload a test image or video
   - Check Google Drive folder for the file
   - Check Google Sheets "Content_Log" tab for the entry

2. **Test Admin Dashboard:**
   - Visit: `https://content-portal-xxxxx.run.app/admin/login`
   - Login with your credentials
   - Should see the test submission
   - Try approving/rejecting it

---

## 🎉 You're Done!

Your Content Portal is now live and ready to use!

### Important URLs to Save:

- **Member Upload:** `https://content-portal-xxxxx.run.app/`
- **Admin Dashboard:** `https://content-portal-xxxxx.run.app/admin/login`
- **Google Drive Folder:** [Your folder URL]
- **Google Sheets Database:** [Your spreadsheet URL]

### Admin Credentials:

- **Email:** kenneth.burnett@hotworx.net
- **Password:** klbHwx1!

---

## 🔒 Security Recommendations

After deployment:

1. **Change waiver URL** in Configuration sheet to your actual waiver page
2. **Add more admins** in the Admins sheet if needed
3. **Consider changing your password** (update hash in Admins sheet)
4. **Keep `service-account-key.json` secure** - don't commit to git
5. **Monitor costs** in Google Cloud Console

---

## 📚 Next Steps

- **Add QR codes** - Create QR codes linking to: `https://your-url.run.app/?qr_id=location-name`
- **Add categories** - Edit Categories sheet to add more content types
- **Customize branding** - Update app name and colors
- **Set up monitoring** - Enable Cloud Run metrics in Google Cloud Console

---

## 🆘 Troubleshooting

**Setup script fails with "permission denied":**
```bash
chmod +x setup.sh deploy.sh
```

**"gcloud: command not found":**
- Install gcloud CLI: https://cloud.google.com/sdk/docs/install

**Deployment fails with billing error:**
- Enable billing: https://console.cloud.google.com/billing

**Can't login to admin:**
- Verify password hash in Admins sheet matches
- Check email is exact: `kenneth.burnett@hotworx.net`
- Try regenerating hash: `node -e "console.log(require('bcryptjs').hashSync('klbHwx1!', 12))"`

**Upload fails in production:**
- Check Drive folder is shared with service account
- Verify Drive Folder ID is correct in .env
- Check Cloud Run logs: `gcloud run logs read content-portal --region us-central1`

---

Need help? Check the main README.md or deployment-info.txt for additional details.
