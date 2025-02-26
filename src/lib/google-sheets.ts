/**
 * Google Sheets integration for waitlist functionality (DEPRECATED)
 *
 * This was a simplified testing implementation that appended email addresses
 * to a publicly editable Google Sheet.
 *
 * DEPRECATED: This has been replaced by the waitlist-storage.ts module.
 */

/**
 * DEPRECATED: Use waitlist-storage.ts instead.
 * This function is kept for reference purposes only.
 */
export async function addToWaitlist(
  email: string,
  metadata: { timestamp: string; source: string }
): Promise<boolean> {
  console.warn('⚠️ google-sheets.ts is deprecated. Use waitlist-storage.ts instead.');
  console.log('[DEPRECATED] Would add to waitlist:', { email, metadata });
  return true;
}

/**
 * DEPRECATED: USE THE WAITLIST-STORAGE.TS MODULE INSTEAD
 *
 * This file contains the original integration with Google Sheets
 * and is maintained for reference only. All new code should use
 * the waitlist-storage.ts module which supports multiple storage backends.
 */

/*
// Example Google Apps Script implementation for reference:

export async function addToWaitlistForReal(
  email: string,
  metadata: { timestamp: string; source: string }
): Promise<boolean> {
  try {
    // Google Apps Script web app URL
    const WEBAPP_URL = 'https://script.google.com/macros/s/your-script-id/exec';

    const response = await axios.post(WEBAPP_URL, {
      email,
      timestamp: metadata.timestamp,
      source: metadata.source
    });

    if (response.status !== 200) {
      throw new Error(`Failed to add to waitlist: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
}
*/

// For a production implementation, consider using a third-party service
// that abstracts away the complexity of Google Sheets API authentication
// Examples: Sheet.best, SheetDB, Retool, or a custom Google Apps Script