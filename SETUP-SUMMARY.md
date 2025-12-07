# 🎯 Setup Summary - What I've Prepared For You

## ✅ What's Been Done

I've created a complete automated setup for your Content Portal. Here's everything that's ready:

### 📦 Generated Files

1. **`setup.sh`** - Automated setup script
   - Configures Google Cloud project
   - Creates service account
   - Generates secure secrets
   - Creates Secret Manager entries
   - Generates .env file

2. **`deploy.sh`** - One-command deployment script
   - Builds Docker image
   - Deploys to Cloud Run
   - Returns your live URL

3. **`QUICKSTART.md`** - Complete step-by-step guide
   - 8 easy steps to get live
   - Copy-paste instructions for Sheets
   - Troubleshooting tips

4. **`sheets-setup.md`** - Google Sheets reference
   - All 5 tabs with headers
   - Pre-filled data to copy-paste
   - Verification checklist

### 🔐 Your Credentials (Pre-configured)

**Admin Account:**
- Email: `kenneth.burnett@hotworx.net`
- Password: `klbHwx1!`
- Role: SuperAdmin
- Password Hash: `$2a$12$bV/pSDTrkcCPvvU3AldWgOGXlCfOO21Uvpbj/LYvisv.T/YE.DETi`

**Project:**
- Project ID: `content-portal-prod-480202`
- Region: `us-central1`
- Service Account: `content-portal-sa@content-portal-prod-480202.iam.gserviceaccount.com`

**Application:**
- Waiver URL: `https://drive.google.com/file/d/1MjyAYAcSe1_KJeCfSSSTs67TnupdLEmw/view?usp=drive_link`
- Max File Size: 500 MB
- Allowed Types: .jpg, .jpeg, .png, .heic, .mp4, .mov

---

## 🚀 Next Steps - What YOU Need To Do

### Prerequisites Check:

```bash
# Verify you have these installed:
gcloud --version    # Should be installed
node --version      # Should be 20.x
npm --version       # Should be installed
```

If missing, install:
- gcloud: https://cloud.google.com/sdk/docs/install
- Node.js 20: https://nodejs.org/

### The 3-Step Process:

#### **STEP 1: Run Setup Script (10 min)**

```bash
cd /home/user/content-portal

# Authenticate with Google Cloud
gcloud auth login
gcloud auth application-default login

# Run automated setup
./setup.sh
```

The script will pause twice to ask you for:
1. Google Drive Folder ID
2. Google Sheets Spreadsheet ID

#### **STEP 2: Create Google Resources (15 min)**

**A. Create Drive Folder:**
1. Go to https://drive.google.com
2. Create folder: "Content Portal Uploads"
3. Share with: `content-portal-sa@content-portal-prod-480202.iam.gserviceaccount.com` (Editor)
4. Copy Folder ID from URL
5. Paste into setup script

**B. Create Sheets Database:**
1. Go to https://sheets.google.com
2. Create spreadsheet: "Content Portal Database"
3. Share with: `content-portal-sa@content-portal-prod-480202.iam.gserviceaccount.com` (Editor)
4. Create 5 tabs (use copy-paste from QUICKSTART.md)
5. Copy Spreadsheet ID from URL
6. Paste into setup script

**Full details in QUICKSTART.md** with exact copy-paste blocks!

#### **STEP 3: Deploy (10 min)**

```bash
# Test locally first (optional but recommended)
npm run install:all
npm run dev

# Deploy to production
./deploy.sh
```

Your app will be live at: `https://content-portal-xxxxx.run.app`

---

## 📋 Google Sheets Quick Reference

You need 5 tabs with these EXACT names:

1. **Content_Log** - Stores all uploads (21 columns)
2. **Admin_Audit_Log** - Tracks admin actions (8 columns)
3. **Categories** - Content categories (5 columns) - **3 rows of data**
4. **Configuration** - App settings (2 columns) - **5 rows of data**
5. **Admins** - Admin users (7 columns) - **1 row of data**

**Pro tip:** Open QUICKSTART.md and use the copy-paste blocks for each tab!

---

## 🎯 Expected Timeline

| Task | Time | Status |
|------|------|--------|
| Install prerequisites | 5-10 min | You do this |
| Run setup script | 10 min | Automated |
| Create Drive folder | 3 min | You do this |
| Create Sheets database | 10 min | You do this |
| Test locally | 5 min | Optional |
| Deploy to Cloud Run | 10 min | Automated |
| **TOTAL** | **35-45 min** | |

---

## 💰 Cost Estimate

After deployment, you'll pay:

- **Cloud Run:** $0-15/month (generous free tier)
  - Free tier: 2 million requests/month
  - 360,000 GB-seconds/month free

- **Secret Manager:** ~$0.10/month
  - 6 secrets × $0.06 = $0.36/month

- **Google Drive/Sheets:** FREE
  - Included in Google Workspace or personal account

**Expected monthly cost: $5-15** for moderate usage

---

## 🔒 Security Notes

The setup includes:

✅ Secure password hashing (bcrypt cost 12)
✅ JWT tokens (auto-generated 32-char secret)
✅ Google Cloud Secret Manager for sensitive data
✅ Service account with minimal permissions
✅ Rate limiting (5 uploads/hour, 5 login attempts)
✅ Input validation on all endpoints
✅ Audit logging for compliance

**After deployment:**
- Don't commit `service-account-key.json` to git
- Keep `deployment-info.txt` secure
- Consider changing admin password after first login

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| `setup.sh` | Automated Google Cloud setup |
| `deploy.sh` | One-command deployment |
| `QUICKSTART.md` | Step-by-step instructions |
| `sheets-setup.md` | Google Sheets reference |
| `README.md` | Full documentation |
| `.env.example` | Environment template |
| `Dockerfile` | Production build config |
| `package.json` | Root build scripts |

---

## 🆘 If Something Goes Wrong

**Setup script fails:**
```bash
# Make scripts executable
chmod +x setup.sh deploy.sh

# Re-run authentication
gcloud auth login
gcloud auth application-default login
```

**Can't find service account email:**
```bash
# It's always this format:
content-portal-sa@content-portal-prod-480202.iam.gserviceaccount.com
```

**Forgot to save Drive/Sheets ID:**
- Drive: Click folder → Get link → ID is in URL after `/folders/`
- Sheets: Open spreadsheet → ID is in URL after `/d/`

**Need to regenerate password hash:**
```bash
node -e "console.log(require('bcryptjs').hashSync('klbHwx1!', 12))"
```

---

## 🎉 What Happens After Deployment

Once `./deploy.sh` completes:

1. You get a live URL like: `https://content-portal-abc123.run.app`
2. Members can upload at: `https://content-portal-abc123.run.app/`
3. You can login at: `https://content-portal-abc123.run.app/admin/login`
4. Uploads appear in Google Drive folder
5. Metadata appears in Sheets "Content_Log" tab
6. You can approve/reject in admin dashboard

---

## 📞 Need Help?

1. Check **QUICKSTART.md** for step-by-step instructions
2. Check **README.md** for detailed documentation
3. Check Cloud Run logs:
   ```bash
   gcloud run logs read content-portal --region us-central1
   ```

---

## ✨ Summary

**What I did:** Created all setup scripts and documentation
**What you need to do:** Run 3 commands and create 2 Google resources (Drive folder + Sheets)
**Time required:** 35-45 minutes
**Result:** Live production app on Google Cloud Run

**Ready to start? Open QUICKSTART.md and follow the steps!**
