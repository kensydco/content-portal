# Studio Features - Implementation Guide

## ✅ Completed

1. **Frontend Upload Form**
   - Studio dropdown added
   - Pre-populated with Collierville (TN0045) and Ithaca (NY0017)
   - Required field validation
   - Attempts to load from API with fallback

2. **Fixed Issues**
   - Waiver checkbox validation now works correctly
   - Deploy script handles .env files with spaces

## 🚧 Remaining Work

To complete the studio features with social media handles management, you need to:

### 1. Update Google Sheets (Manual - 10 minutes)

Add a new **Studios** tab to your Content Portal Database spreadsheet:

**Tab Name:** `Studios`

**Headers (Row 1, A1:H1):**
```
Studio_ID	Name	City	State	Instagram	Facebook	TikTok	Is_Active
```

**Sample Data (Rows 2-3):**
```
TN0045	Collierville	Collierville	TN	@hotworx_collierville	facebook.com/hotworxcollierville	@hotworx_collierville	TRUE
NY0017	Ithaca	Ithaca	NY	@hotworx_ithaca	facebook.com/hotworxithaca	@hotworx_ithaca	TRUE
```

### 2. Update Backend Types

Add to `/home/user/content-portal/server/src/types/index.ts`:

```typescript
export interface Studio {
  studioId: string;
  name: string;
  city: string;
  state: string;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  isActive: boolean;
}
```

Also add to client `/home/user/content-portal/client/src/types/index.ts`.

### 3. Update Submission Type

In both server and client `types/index.ts`, add `studio` field to `Submission` interface:

```typescript
export interface Submission {
  // ... existing fields ...
  studio: string;  // Add this line after category
  category: string;
  // ... rest of fields ...
}
```

### 4. Update Google Sheets Content_Log

Add `Studio` column after `Upload_Device` and before `Category`:

**New Headers (Row 1, A1:V1):**
```
Submission_ID	Timestamp	Uploader_Name	Uploader_Email	Uploader_Phone	File_Drive_URL	File_ID	File_Size_MB	Upload_Device	Studio	Category	Description	Source_QR_ID	Waiver_Agreed	Waiver_Timestamp	AI_Tags	Duplicate_Detected	Admin_Start_Date	Admin_End_Date	Status	Admin_Notes	Archive_Flag
```

### 5. Update Backend Upload Validation

In `/home/user/content-portal/server/src/utils/validation.ts`:

```typescript
export const uploadSchema = z.object({
  uploaderName: z.string().min(2).max(100),
  uploaderEmail: z.string().email(),
  uploaderPhone: z.string().regex(/^(\+?1?\d{10,14})?$/).optional(),
  studio: z.string().min(1).max(20),  // Add this line
  category: z.string().min(1).max(50),
  description: z.string().max(280).optional(),
  sourceQrId: z.string().max(50).optional(),
  waiverAgreed: z.literal('true'),
  waiverTimestamp: z.string().datetime(),
});
```

### 6. Update Backend Upload Controller

In `/home/user/content-portal/server/src/controllers/uploadController.ts`, update the submission object to include studio field (around line 60):

```typescript
const submission: Submission = {
  submissionId,
  timestamp: new Date().toISOString(),
  uploaderName,
  uploaderEmail,
  uploaderPhone: uploaderPhone || null,
  fileDriveUrl: driveResult.webViewLink,
  fileId: driveResult.fileId,
  fileSizeMb: parseFloat((driveResult.size / (1024 * 1024)).toFixed(2)),
  uploadDevice,
  studio,  // Add this line
  category,
  // ... rest
};
```

### 7. Update Sheets Service

In `/home/user/content-portal/server/src/services/sheetsService.ts`:

**Update appendSubmission** (around line 30):
```typescript
const row = [
  submission.submissionId,
  submission.timestamp,
  submission.uploaderName,
  submission.uploaderEmail,
  submission.uploaderPhone || '',
  submission.fileDriveUrl,
  submission.fileId,
  submission.fileSizeMb,
  submission.uploadDevice,
  submission.studio,  // Add this line
  submission.category,
  // ... rest
];
```

**Update getSubmissions** (around line 60):
```typescript
submissions = dataRows.map((row): Submission => ({
  submissionId: row[0] || '',
  timestamp: row[1] || '',
  uploaderName: row[2] || '',
  uploaderEmail: row[3] || '',
  uploaderPhone: row[4] || null,
  fileDriveUrl: row[5] || '',
  fileId: row[6] || '',
  fileSizeMb: parseFloat(row[7] || '0'),
  uploadDevice: (row[8] || 'Unknown') as any,
  studio: row[9] || '',  // Add this line
  category: row[10] || '',  // Was row[9], now row[10]
  description: row[11] || null,  // Was row[10], now row[11]
  // ... rest - increment all row indices by 1
}));
```

**Add Studios Methods** (end of SheetsService class):
```typescript
// Studios Operations
async getStudios(): Promise<Studio[]> {
  try {
    const { sheets, spreadsheetId } = await this.getSheet('Studios');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Studios!A:H',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map((row): Studio => ({
      studioId: row[0] || '',
      name: row[1] || '',
      city: row[2] || '',
      state: row[3] || '',
      instagram: row[4] || null,
      facebook: row[5] || null,
      tiktok: row[6] || null,
      isActive: row[7] === 'TRUE' || row[7] === true,
    }));
  } catch (error) {
    logger.error('Failed to get studios', error);
    throw new Error('Failed to retrieve studios');
  }
}

async appendStudio(studio: Studio): Promise<void> {
  try {
    const { sheets, spreadsheetId } = await this.getSheet('Studios');

    const row = [
      studio.studioId,
      studio.name,
      studio.city,
      studio.state,
      studio.instagram || '',
      studio.facebook || '',
      studio.tiktok || '',
      studio.isActive,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Studios!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    logger.info('Studio created', { studioId: studio.studioId });
  } catch (error) {
    logger.error('Failed to append studio', error);
    throw new Error('Failed to create studio');
  }
}

async updateStudio(studioId: string, updates: Partial<Studio>): Promise<Studio> {
  try {
    const { sheets, spreadsheetId } = await this.getSheet('Studios');

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Studios!A:H',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[0] === studioId);

    if (rowIndex === -1) {
      throw new Error('Studio not found');
    }

    const currentRow = rows[rowIndex];
    const current: Studio = {
      studioId: currentRow[0],
      name: currentRow[1],
      city: currentRow[2],
      state: currentRow[3],
      instagram: currentRow[4] || null,
      facebook: currentRow[5] || null,
      tiktok: currentRow[6] || null,
      isActive: currentRow[7] === 'TRUE',
    };

    const updated = { ...current, ...updates };

    const updatedRow = [
      updated.studioId,
      updated.name,
      updated.city,
      updated.state,
      updated.instagram || '',
      updated.facebook || '',
      updated.tiktok || '',
      updated.isActive,
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Studios!A${rowIndex + 1}:H${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    });

    logger.info('Studio updated', { studioId });
    return updated;
  } catch (error) {
    logger.error('Failed to update studio', error);
    throw new Error('Failed to update studio');
  }
}
```

### 8. Create Studios Controller

Create `/home/user/content-portal/server/src/controllers/studiosController.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sheetsService } from '../services/sheetsService';
import { auditService } from '../services/auditService';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

export async function getPublicStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studios = await sheetsService.getStudios();
    const activeStudios = studios.filter((s) => s.isActive);

    res.status(200).json({
      success: true,
      data: {
        studios: activeStudios.map((s) => ({
          id: s.studioId,
          name: s.name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStudios(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studios = await sheetsService.getStudios();

    res.status(200).json({
      success: true,
      data: {
        studios,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createStudio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { studioId, name, city, state, instagram, facebook, tiktok } = req.body;
    const user = (req as AuthRequest).user!;

    // Check for duplicate ID
    const existingStudios = await sheetsService.getStudios();
    const duplicate = existingStudios.find((s) => s.studioId === studioId);

    if (duplicate) {
      throw new AppError(409, 'DUPLICATE_ID', 'Studio ID already exists');
    }

    const studio = {
      studioId,
      name,
      city,
      state,
      instagram: instagram || null,
      facebook: facebook || null,
      tiktok: tiktok || null,
      isActive: true,
    };

    await sheetsService.appendStudio(studio);
    await auditService.log(
      user.email,
      'CATEGORY_CREATE',
      studioId,
      null,
      { name, city, state }
    );

    res.status(201).json({
      success: true,
      data: studio,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStudio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = (req as AuthRequest).user!;

    const studios = await sheetsService.getStudios();
    const current = studios.find((s) => s.studioId === id);

    if (!current) {
      throw new AppError(404, 'NOT_FOUND', 'Studio not found');
    }

    const updated = await sheetsService.updateStudio(id, updates);
    await auditService.log(user.email, 'CATEGORY_UPDATE', id, current, updates);

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
```

### 9. Create Studios Routes

Create `/home/user/content-portal/server/src/routes/studiosRoutes.ts`:

```typescript
import { Router } from 'express';
import {
  getPublicStudios,
  getStudios,
  createStudio,
  updateStudio,
} from '../controllers/studiosController';
import { authenticate } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const studioSchema = z.object({
  studioId: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(200).optional(),
  tiktok: z.string().max(100).optional(),
});

// Public endpoint
router.get('/public', getPublicStudios);

// Admin endpoints
router.get('/', authenticate, getStudios);
router.post('/', authenticate, requireSuperAdmin, validateBody(studioSchema), createStudio);
router.patch('/', authenticate, requireSuperAdmin, validateBody(studioSchema.partial()), updateStudio);

export default router;
```

### 10. Update Routes Index

In `/home/user/content-portal/server/src/routes/index.ts`, add:

```typescript
import studiosRoutes from './studiosRoutes';

// ... in the router setup:
router.use('/studios', studiosRoutes);
```

### 11. Create Admin Studios Page

Create `/home/user/content-portal/client/src/pages/AdminStudiosPage.tsx`:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminLayout from '../components/layout/AdminLayout';
import StudioManager from '../components/admin/StudioManager';
import Spinner from '../components/ui/Spinner';

export default function AdminStudiosPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    } else if (!isLoading && user?.role !== 'SuperAdmin') {
      navigate('/admin/dashboard');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Studio Management</h1>
          <p className="text-neutral-600">
            Manage studio locations and their social media handles
          </p>
        </div>

        <StudioManager />
      </div>
    </AdminLayout>
  );
}
```

### 12. Create Studio Manager Component

Create `/home/user/content-portal/client/src/components/admin/StudioManager.tsx` (similar to CategoryManager but with social media fields).

### 13. Add Route in App.tsx

In `/home/user/content-portal/client/src/App.tsx`:

```typescript
import AdminStudiosPage from './pages/AdminStudiosPage';

// ... in Routes:
<Route path="/admin/studios" element={<AdminStudiosPage />} />
```

### 14. Update Admin Navigation

In `/home/user/content-portal/client/src/components/layout/AdminLayout.tsx`, add studios to nav:

```typescript
{ path: '/admin/studios', label: 'Studios', icon: Building },  // Import Building from lucide-react
```

## Quick Implementation Checklist

- [ ] Add Studios tab to Google Sheets
- [ ] Add sample studio data
- [ ] Update Content_Log headers to include Studio column
- [ ] Update backend types (server + client)
- [ ] Update upload validation
- [ ] Update upload controller
- [ ] Update sheets service (all row indices)
- [ ] Add studios methods to sheets service
- [ ] Create studios controller
- [ ] Create studios routes
- [ ] Update routes index
- [ ] Create Admin Studios page
- [ ] Create Studio Manager component
- [ ] Add route to App.tsx
- [ ] Update admin navigation

## Testing

After implementation:

1. Test upload form shows studio dropdown
2. Test upload includes studio in submission
3. Test admin can view studios
4. Test admin can add/edit studios
5. Test social media handles display correctly

## Time Estimate

- Manual Google Sheets updates: 10 minutes
- Backend implementation: 30 minutes
- Frontend implementation: 20 minutes
- Testing: 10 minutes

**Total: ~70 minutes**
