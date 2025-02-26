/**
 * Google Apps Script to handle form submissions for the waitlist
 *
 * How to use:
 * 1. Go to https://script.google.com/ and create a new project
 * 2. Copy and paste this code into the editor
 * 3. Replace SHEET_ID with your Google Sheet ID
 * 4. Deploy as a web app (Publish > Deploy as web app)
 *    - Set "Who has access" to "Anyone, even anonymous"
 * 5. Use the web app URL as your endpoint in the waitlist form
 */

// ID of the Google Sheet
const SHEET_ID = '1kLbMDfwm--nh37BqmevZmMA7PG1FU8zRHbb3rOqPfAs';
const SHEET_TAB_NAME = 'Sheet1';

/**
 * Process POST requests to the web app
 */
function doPost(e) {
  try {
    // Parse the POST data
    const data = JSON.parse(e.postData.contents);

    // Get the email and metadata
    const email = data.email;
    const timestamp = data.timestamp || new Date().toISOString();
    const source = data.source || 'direct';

    // Log the submission for debugging
    console.log('Received waitlist submission:', { email, timestamp, source });

    // Append to the Google Sheet
    appendToSheet(email, timestamp, source);

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Email added to waitlist'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log error and return error response
    console.error('Error processing request:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to process request'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Waitlist API is running'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Append data to the Google Sheet
 */
function appendToSheet(email, timestamp, source) {
  try {
    // Open the Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_TAB_NAME);

    // If we didn't find the sheet, create it
    if (!sheet) {
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const newSheet = ss.insertSheet(SHEET_TAB_NAME);

      // Add headers
      newSheet.appendRow(['Email', 'Timestamp', 'Source']);

      // Append the data
      newSheet.appendRow([email, timestamp, source]);
    } else {
      // Append to existing sheet
      sheet.appendRow([email, timestamp, source]);
    }

    console.log('Successfully appended to sheet:', email);
    return true;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
}