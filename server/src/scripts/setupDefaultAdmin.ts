import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getSheetsClient } from '../utils/googleAuth';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

/**
 * Script to set up a default admin account
 * Email: kenneth.burnett@hotworx.net
 * Password: password
 */
async function setupDefaultAdmin() {
  try {
    const defaultEmail = 'kenneth.burnett@hotworx.net';
    const defaultPassword = 'password';
    const defaultRole = 'Super Admin';

    logger.info('Setting up default admin account', { email: defaultEmail });

    // Hash the password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Get sheets client
    const sheets = await getSheetsClient();
    const spreadsheetId = env.SPREADSHEET_ID;
    const sheetName = env.ADMINS_SHEET_NAME;

    // Check if admin already exists
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:G`,
    });

    const rows = response.data.values || [];
    const existingAdmin = rows.slice(1).find((row) => row[1] === defaultEmail);

    if (existingAdmin) {
      logger.info('Admin already exists, updating password', { email: defaultEmail });

      // Find row index and update password
      const rowIndex = rows.findIndex((row, idx) => idx > 0 && row[1] === defaultEmail);

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!C${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[passwordHash]],
        },
      });

      // Also ensure the admin is active
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!E${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[true]],
        },
      });

      logger.info('Admin password updated successfully');
    } else {
      logger.info('Creating new admin account', { email: defaultEmail });

      // Create new admin
      const adminId = uuidv4();
      const createdAt = new Date().toISOString();

      const row = [
        adminId,
        defaultEmail,
        passwordHash,
        defaultRole,
        true, // isActive
        createdAt,
        '', // lastLogin
        '', // resetToken
        '', // tokenExpiry
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:I`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });

      logger.info('Admin account created successfully');
    }

    console.log('✅ Default admin setup complete!');
    console.log(`   Email: ${defaultEmail}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log(`   Role: ${defaultRole}`);

  } catch (error) {
    logger.error('Failed to setup default admin', error);
    console.error('❌ Failed to setup default admin:', error);
    throw error;
  }
}

// Run the script
setupDefaultAdmin()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
