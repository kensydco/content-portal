# Google Sheets Setup Guide

## Create Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet named: **Content Portal Database**
3. Share with service account email (from setup.sh output) as **Editor**
4. Copy Spreadsheet ID from URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## Create These 5 Tabs

### Tab 1: Content_Log

**Row 1 Headers (A1:U1):**
```
Submission_ID	Timestamp	Uploader_Name	Uploader_Email	Uploader_Phone	File_Drive_URL	File_ID	File_Size_MB	Upload_Device	Category	Description	Source_QR_ID	Waiver_Agreed	Waiver_Timestamp	AI_Tags	Duplicate_Detected	Admin_Start_Date	Admin_End_Date	Status	Admin_Notes	Archive_Flag
```

Leave rows 2+ empty (will be filled by uploads).

---

### Tab 2: Admin_Audit_Log

**Row 1 Headers (A1:H1):**
```
Audit_ID	Timestamp	Admin_Email	Action_Type	Target_ID	Old_Value	New_Value	Notes
```

Leave rows 2+ empty (will be filled automatically).

---

### Tab 3: Categories

**Row 1 Headers (A1:E1):**
```
Category_ID	Name	Description	Is_Active	Created_At
```

**Add these sample categories (rows 2-4):**

| Category_ID | Name | Description | Is_Active | Created_At |
|-------------|------|-------------|-----------|------------|
| cat-001 | Workout | Fitness and training content | TRUE | 2025-01-01T00:00:00Z |
| cat-002 | Event | Special events and gatherings | TRUE | 2025-01-01T00:00:00Z |
| cat-003 | Testimonial | Member testimonials | TRUE | 2025-01-01T00:00:00Z |

---

### Tab 4: Configuration

**Row 1 Headers (A1:B1):**
```
Key	Value
```

**Add these configuration values (rows 2-6):**

| Key | Value |
|-----|-------|
| WAIVER_URL | https://drive.google.com/file/d/1MjyAYAcSe1_KJeCfSSSTs67TnupdLEmw/view?usp=drive_link |
| DEFAULT_START_OFFSET_DAYS | 2 |
| DEFAULT_END_OFFSET_DAYS | 30 |
| MAX_FILE_SIZE_MB | 500 |
| RATE_LIMIT_UPLOADS_PER_HOUR | 5 |

---

### Tab 5: Admins

**Row 1 Headers (A1:G1):**
```
Admin_ID	Email	Password_Hash	Role	Is_Active	Created_At	Last_Login
```

**Add your admin user (row 2):**

| Admin_ID | Email | Password_Hash | Role | Is_Active | Created_At | Last_Login |
|----------|-------|---------------|------|-----------|------------|------------|
| admin-001 | kenneth.burnett@hotworx.net | $2a$12$bV/pSDTrkcCPvvU3AldWgOGXlCfOO21Uvpbj/LYvisv.T/YE.DETi | SuperAdmin | TRUE | 2025-01-01T00:00:00Z | |

**Important Notes:**
- The password hash above is for: `klbHwx1!`
- Admin_ID can be any unique identifier (e.g., admin-001)
- Leave Last_Login column empty
- Role must be exactly: `SuperAdmin`, `Editor`, or `Viewer`
- Is_Active must be exactly: `TRUE` or `FALSE`

---

## Formatting Tips

1. **Use Tab-separated values** - When copying the headers, each word separated by tabs goes into separate cells
2. **No extra spaces** - Make sure there are no leading/trailing spaces in any cell
3. **Exact spelling** - Header names must match exactly (case-sensitive)
4. **Date format** - Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
5. **Boolean values** - Use `TRUE` or `FALSE` (all caps)

---

## Quick Copy-Paste

### Content_Log Headers (copy and paste into A1):
```
Submission_ID	Timestamp	Uploader_Name	Uploader_Email	Uploader_Phone	File_Drive_URL	File_ID	File_Size_MB	Upload_Device	Category	Description	Source_QR_ID	Waiver_Agreed	Waiver_Timestamp	AI_Tags	Duplicate_Detected	Admin_Start_Date	Admin_End_Date	Status	Admin_Notes	Archive_Flag
```

### Admin_Audit_Log Headers (copy and paste into A1):
```
Audit_ID	Timestamp	Admin_Email	Action_Type	Target_ID	Old_Value	New_Value	Notes
```

### Categories Headers + Data (copy and paste into A1):
```
Category_ID	Name	Description	Is_Active	Created_At
cat-001	Workout	Fitness and training content	TRUE	2025-01-01T00:00:00Z
cat-002	Event	Special events and gatherings	TRUE	2025-01-01T00:00:00Z
cat-003	Testimonial	Member testimonials	TRUE	2025-01-01T00:00:00Z
```

### Configuration Headers + Data (copy and paste into A1):
```
Key	Value
WAIVER_URL	https://drive.google.com/file/d/1MjyAYAcSe1_KJeCfSSSTs67TnupdLEmw/view?usp=drive_link
DEFAULT_START_OFFSET_DAYS	2
DEFAULT_END_OFFSET_DAYS	30
MAX_FILE_SIZE_MB	500
RATE_LIMIT_UPLOADS_PER_HOUR	5
```

### Admins Headers + Data (copy and paste into A1):
```
Admin_ID	Email	Password_Hash	Role	Is_Active	Created_At	Last_Login
admin-001	kenneth.burnett@hotworx.net	$2a$12$bV/pSDTrkcCPvvU3AldWgOGXlCfOO21Uvpbj/LYvisv.T/YE.DETi	SuperAdmin	TRUE	2025-01-01T00:00:00Z
```

---

## Verification Checklist

- [ ] All 5 tabs created with exact names
- [ ] All headers in row 1 for each tab
- [ ] 3 categories added to Categories tab
- [ ] 5 config values added to Configuration tab
- [ ] 1 admin user added to Admins tab
- [ ] Spreadsheet shared with service account email as Editor
- [ ] Spreadsheet ID copied and saved
