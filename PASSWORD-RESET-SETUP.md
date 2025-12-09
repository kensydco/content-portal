# Password Reset Feature - Setup Guide

## ✅ What Was Implemented

I've successfully implemented a complete password reset system for admin users who cannot login to the portal. This allows admins to reset their password using a secure token-based system.

### Features

**For Admins:**
- Request a password reset token using email address
- Receive a secure, one-time use token (expires in 1 hour)
- Reset password using the token
- Auto-redirect to login after successful reset

**Security Features:**
- Cryptographically secure tokens (32-byte hex strings)
- Tokens expire after 1 hour
- One-time use (cleared after successful password reset)
- Rate limiting on reset requests (prevents abuse)
- No information leakage (same response whether email exists or not)
- Password strength validation (minimum 8 characters)

### User Flow

1. Admin goes to login page
2. Clicks "Forgot password?" link
3. Enters email address
4. Receives reset token on screen (in production: would be emailed)
5. Copies token and clicks "Continue to Reset Password"
6. Enters token, new password, and confirms password
7. Password is reset
8. Auto-redirected to login page

---

## 🔧 What You Need To Do

### Step 1: Update Google Sheets Admins Tab (REQUIRED)

The password reset feature requires two new columns in your Admins sheet to store reset tokens.

#### Add New Columns

1. Open your "Content Portal Database" spreadsheet
2. Navigate to the **Admins** tab
3. **Add two new columns** after column G (Last_Login):
   - **Column H**: `Reset_Token`
   - **Column I**: `Token_Expiry`

**Updated Admins tab headers (A1:I1):**
```
Admin_ID	Email	Password_Hash	Role	Is_Active	Created_At	Last_Login	Reset_Token	Token_Expiry
```

**Complete column mapping:**
- A: Admin_ID
- B: Email
- C: Password_Hash
- D: Role
- E: Is_Active
- F: Created_At
- G: Last_Login
- H: Reset_Token (NEW)
- I: Token_Expiry (NEW)

### Step 2: Deploy Changes

Once you've updated the Google Sheets Admins tab:

```bash
cd /home/user/content-portal

# Deploy to production
./deploy.sh
```

### Step 3: Test Password Reset

1. **Navigate to login page**
   - Visit your app URL and go to `/admin/login`

2. **Request reset token**
   - Click "Forgot password?" link
   - Enter your admin email: `kenneth.burnett@hotworx.net`
   - Click "Request Reset Token"
   - You'll see the reset token displayed on screen

3. **Copy the token**
   - Click the copy button next to the token
   - Token will be copied to clipboard

4. **Reset your password**
   - Click "Continue to Reset Password"
   - Paste the token in the "Reset Token" field
   - Enter your new password (minimum 8 characters)
   - Confirm the password
   - Click "Reset Password"

5. **Login with new password**
   - You'll be redirected to the login page
   - Login with your email and new password

---

## API Endpoints

### Request Password Reset
**POST** `/api/auth/request-reset`

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "resetToken": "a1b2c3d4e5f6...",
    "message": "Reset token generated. In production, this would be emailed to you.",
    "expiresIn": "1 hour"
  }
}
```

**Security Note:** Returns same message whether email exists or not to prevent email enumeration attacks.

### Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "resetToken": "a1b2c3d4e5f6...",
  "newPassword": "newSecurePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "message": "Password has been reset successfully. You can now login with your new password."
  }
}
```

**Error Responses:**
- Invalid or expired token: `400 - INVALID_TOKEN`
- Weak password: `400 - WEAK_PASSWORD`
- Account inactive: `403 - ACCOUNT_INACTIVE`

---

## How It Works (Technical Details)

### Token Generation
1. Admin enters email on forgot password page
2. System checks if admin exists and is active
3. Generates a cryptographically secure 32-byte hex token using `crypto.randomBytes(32)`
4. Calculates expiry time (current time + 1 hour)
5. Stores token and expiry in Admins sheet (columns H and I)
6. Returns token to user (in production: would email it)

### Token Validation
1. Admin enters token on reset password page
2. System searches Admins sheet for matching token
3. Validates token hasn't expired (compares Token_Expiry with current time)
4. Returns admin details if valid, null if invalid/expired

### Password Reset
1. Admin submits valid token and new password
2. System validates password strength (min 8 characters)
3. Hashes new password using bcrypt (cost factor 12)
4. Updates Password_Hash in Admins sheet
5. Clears Reset_Token and Token_Expiry (prevents token reuse)
6. Returns success message

### Security Measures
- **No information leakage**: Same response whether email exists or not
- **Rate limiting**: Login rate limiter also applies to reset requests
- **Token expiry**: Tokens automatically expire after 1 hour
- **One-time use**: Tokens are cleared after successful password reset
- **Secure hashing**: Passwords are hashed with bcrypt cost factor 12
- **HTTPS only**: All API calls should be over HTTPS in production

---

## Frontend Pages

### Forgot Password Page
**Route:** `/admin/forgot-password`

**Features:**
- Email input with validation
- Request reset token button
- Displays generated token on screen
- Copy-to-clipboard functionality
- Link to continue to reset password page
- Link back to login page

### Reset Password Page
**Route:** `/admin/reset-password`

**Features:**
- Reset token input field
- New password input (with strength validation)
- Confirm password input (with match validation)
- Reset password button
- Success screen with auto-redirect
- Link back to login page

### Login Page Enhancement
**Route:** `/admin/login`

**New Feature:**
- "Forgot password?" link below login button
- Links to `/admin/forgot-password`

---

## Database Schema

### Admins Tab (Updated)

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | Admin_ID | String | Unique identifier (UUID) |
| B | Email | String | Admin email address |
| C | Password_Hash | String | Bcrypt hashed password |
| D | Role | String | SuperAdmin, Editor, or Viewer |
| E | Is_Active | Boolean | TRUE or FALSE |
| F | Created_At | String | ISO timestamp |
| G | Last_Login | String | ISO timestamp (nullable) |
| H | Reset_Token | String | Password reset token (NEW) |
| I | Token_Expiry | String | Token expiration timestamp (NEW) |

**Example data with reset token:**
```
UUID123	kenneth.burnett@hotworx.net	$2a$12$bV...	SuperAdmin	TRUE	2024-12-01T00:00:00Z	2024-12-08T15:30:00Z	a1b2c3d4e5f6...	2024-12-08T16:30:00Z
```

---

## Troubleshooting

### Issue: "Invalid or expired reset token"
**Possible causes:**
- Token has expired (older than 1 hour)
- Token was already used
- Token was typed incorrectly
- Admins sheet doesn't have Reset_Token and Token_Expiry columns

**Solution:**
- Request a new reset token
- Make sure Admins sheet has columns H and I
- Copy the token exactly (use copy button)
- Use token within 1 hour of generation

### Issue: "Password must be at least 8 characters"
**Solution:** Enter a password with minimum 8 characters

### Issue: Can't access forgot password page
**Solution:**
- Make sure you've deployed the latest code
- Check that routes are configured in App.tsx
- Clear browser cache and try again

### Issue: Reset token not being stored
**Solution:**
- Verify Admins sheet has columns H (Reset_Token) and I (Token_Expiry)
- Check Google Sheets API permissions
- Check server logs for errors

---

## Future Enhancements

When you're ready, you can enhance this feature with:

1. **Email Integration**
   - Integrate SendGrid, AWS SES, or similar email service
   - Send reset token via email instead of displaying on screen
   - Email template with branded design and reset link

2. **Reset Link Instead of Token**
   - Generate URL like `/admin/reset-password?token=abc123`
   - User clicks link in email instead of copying token
   - Better user experience

3. **Token History**
   - Track all reset attempts in audit log
   - Alert admins of suspicious reset requests

4. **Multi-Factor Reset Verification**
   - Require SMS code or authenticator app
   - Additional security layer for sensitive accounts

---

## Testing Checklist

- [ ] Google Sheets Admins tab updated with columns H and I
- [ ] Application deployed with `./deploy.sh`
- [ ] Can access forgot password page from login
- [ ] Can request reset token with valid email
- [ ] Token is displayed on screen with copy button
- [ ] Can copy token to clipboard
- [ ] Can access reset password page
- [ ] Can paste token and set new password
- [ ] Password strength validation works (min 8 chars)
- [ ] Password confirmation validation works
- [ ] Can successfully reset password
- [ ] Can login with new password
- [ ] Token is cleared after successful reset
- [ ] Token expires after 1 hour
- [ ] Rate limiting prevents abuse

---

## Summary

✅ Password reset backend endpoints implemented
✅ Password reset frontend pages implemented
✅ Secure token generation and validation
✅ Google Sheets integration for token storage
✅ User-friendly UI with copy-to-clipboard

🔧 **Action Required:** Add Reset_Token and Token_Expiry columns to Admins sheet
🚀 **Then:** Run `./deploy.sh` to deploy

Once you complete the Google Sheets update and deploy, you'll be able to reset your password anytime you can't login!
