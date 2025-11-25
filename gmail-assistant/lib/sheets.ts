/**
 * Google Sheets Client
 * Manages job application tracking spreadsheet
 */
import { OAuth2Client } from 'google-auth-library';
import type { JobApplication } from './types';
import { google } from 'googleapis';
import { version } from 'os';

const SHEET_NAME = 'Sheet1'; // Match your Google Sheet tab name
const HEADER_ROW = ['Job Title', 'Company', 'Date Applied', 'Status', 'Last Updated', 'Email ID', 'Notes'];

function getSheetsId() {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
        throw new Error('Missing GOOGLE_SHEET_ID environment variable')
    }
    return sheetId;
}

// Read all job applications from the sheet
export async function getAllApplications(auth: OAuth2Client): Promise<JobApplication[]> {
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = getSheetsId();

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${SHEET_NAME}!A2:G`
        });

        const rows = response.data.values || [];

        return rows.map((row, index) => ({
            jobTitle: row[0] || '',
            companyName: row[1] || '',
            dateApplied: row[2] || undefined,
            status: (row[3] || 'applied') as JobApplication['status'],
            lastUpdated: row[4] || new Date().toISOString(),
            emailId: row[5] || '',
            notes: row[6] || undefined,
            sheetRowId: index + 2, // +2 because: 0-indexed + skip header
        }));
    } catch (error) {
        console.error('Error reading from sheet:', error);
        throw new Error('Failed to read applications from Google Sheets');
    }
}

export async function addApplication(
    auth: OAuth2Client, 
    application: JobApplication): Promise<void> {

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = getSheetsId();

    // Format dates to be readable
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const row = [
        application.jobTitle,
        application.companyName,
        application.dateApplied ? formatDate(application.dateApplied) : '',
        application.status,
        formatDate(application.lastUpdated),
        application.emailId.substring(0, 16), // Truncate email ID for readability
        application.notes || '',
    ];

    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${SHEET_NAME}!A2:G`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row]
            }
        });
    } catch (error) {
        console.error('Error adding to sheet:', error);
        throw new Error('Failed to add application to Google Sheets');
    }
}

export async function updateApplication(auth: OAuth2Client, application: JobApplication): Promise<void> {
    if (!application.sheetRowId) {
        throw new Error('Cannot update application without sheetRowId')
    }

    const sheets = google.sheets({version:'v4', auth});
    const sheetId = getSheetsId();

    // Format dates to be readable
    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    const row = [
        application.jobTitle,
        application.companyName,
        application.dateApplied ? formatDate(application.dateApplied) : '',
        application.status,
        formatDate(application.lastUpdated),
        application.emailId.substring(0, 16), // Truncate for readability
        application.notes || '',
    ];

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${SHEET_NAME}!A${application.sheetRowId}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row],
            }
        })
    } catch (error) {
        console.error('Error updating sheet:', error);
        throw new Error('Failed to update application in Google Sheets');
    }
}