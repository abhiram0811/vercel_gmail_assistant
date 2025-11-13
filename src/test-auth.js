/**
 * Test Authentication Script
 * 
 * This script tests if we can successfully:
 * 1. Authenticate with Gmail
 * 2. Fetch a few emails
 * 3. Display basic email information
 * 
 * LEARNING: This demonstrates async/await patterns for API calls
 */

import dotenv from 'dotenv';
import { getAuthenticatedClient, isAuthenticated } from './auth.js';
import { startAuthServer } from './oauth-server.js';
import { cloudasset } from 'googleapis/build/src/apis/cloudasset/index.js';
import { cloudprofiler } from 'googleapis/build/src/apis/cloudprofiler/index.js';

// Load environment variables
dotenv.config();

/**
 * Fetches recent emails from Gmail
 * 
 * ASYNC LEARNING: 
 * - This function makes multiple async calls in sequence
 * - Each 'await' waits for the previous operation to complete
 * - Errors are caught and handled gracefully
 * 
 * @param {number} maxResults - How many emails to fetch
 */
async function fetchRecentEmails(maxResults = 5) {
  try {
    console.log('📧 Fetching recent emails...\n');
    
    // Get authenticated Gmail client
    const gmail = await getAuthenticatedClient();
    
    // ASYNC: Fetch list of message IDs
    // 'q' is a Gmail search query (like searching in Gmail web)
    const listResponse = await gmail.users.messages.list({
      userId: 'me', // 'me' = authenticated user
      maxResults: maxResults,
      q: '' // Empty query = all emails (you can filter: 'from:example@gmail.com')
    });
    
    const messages = listResponse.data.messages;
    
    if (!messages || messages.length === 0) {
      console.log('No emails found.');
      return [];
    }
    
    console.log(`Found ${messages.length} emails. Fetching details...\n`);
    
    // ASYNC LEARNING: Promise.all()
    // This runs multiple async operations IN PARALLEL
    // Much faster than doing them one by one!
    const emailDetailsPromises = messages.map(message => 
      gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full' // Get full email details
      })
    );
    
    // Wait for ALL email fetches to complete
    const emailDetails = await Promise.all(emailDetailsPromises);
    
    // Process and display emails
    emailDetails.forEach((response, index) => {
      const email = response.data;
      const headers = email.payload.headers;
      
      // Extract specific headers
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';
      
      console.log(`\n📩 Email ${index + 1}:`);
      console.log(`   From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Date: ${date}`);
      console.log(`   ID: ${email.id}`);
    });
    
    return emailDetails;
    
  } catch (error) {
    console.error('❌ Error fetching emails:', error.message);
    
    if (error.code === 401) {
      console.log('\n⚠️  Authentication expired. Please re-authenticate.');
      console.log('Run: node src/oauth-server.js');
    }
    
    throw error;
  }
}
/**
 * Fetches today's emails from Gmail
 * 
 */

async function getTodaysEmails() {
  try {
    console.log('📧 Fetching today\'s emails...\n');

    const gmail = await getAuthenticatedClient();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const year = startOfDay.getFullYear();
    const month = String(startOfDay.getMonth() + 1).padStart(2, '0');
    const day = String(startOfDay.getDate()).padStart(2, '0');
    const query = `after:${year}/${month}/${day}`;

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query
    });
    console.dir(listResponse, { depth: null });
    

    const messages = listResponse.data.messages;
    if (!messages || messages.length === 0) {
      console.log('No emails found from today.');
      return [];
    }
    console.log(`Messages with 2 whitespace indentation: ${JSON.stringify(messages[2], null, 2)}`)
    console.log(`Found ${messages.length} emails from today. Fetching details...\n`);

    const detailPromises = messages.map(message =>
      gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      })
    );
    
    const emailDetails = await Promise.all(detailPromises);
    console.log(emailDetails);

    emailDetails.forEach((response, index) => {
      const email = response.data;
      const headers = email.payload.headers;
      const subject = headers.find(h => h.name === 'Subject')?.value || '(No subject)';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';

      console.log(`\n📩 Today Email ${index + 1}:`);
      console.log(`   From: ${from}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Date: ${date}`);
      console.log(`   ID: ${email.id}`);
    });

    return emailDetails;
  } catch (error) {
    console.error('❌ Error fetching today\'s emails:', error.message);
    
    // LEARNING: Handle OAuth errors specifically
    if (error.message === 'invalid_grant') {
      console.log('\n⚠️  Your authentication has expired or been revoked.');
      console.log('📝 To fix this, run: node src/oauth-server.js');
      console.log('   Then come back and run this script again.\n');
    }
    
    throw error;
  }
}

/**
 * Main function - Entry point
 * 
 * ASYNC LEARNING: async/await makes async code look synchronous
 * Much easier to read than callbacks or .then() chains!
 */
async function main() {
  console.log('🔍 Gmail Authentication Test\n');
  console.log('=' .repeat(50) + '\n');
  
  // Check if already authenticated
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    console.log('❌ Not authenticated yet.');
    console.log('\n📝 Steps to authenticate:');
    console.log('1. Run: node src/oauth-server.js');
    console.log('2. Follow the browser prompts');
    console.log('3. Come back and run this script again\n');
    return;
  }
  
  console.log('✅ Authenticated!\n');
  
  try {
    // Fetch and display emails
    const emails = await getTodaysEmails();
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Successfully fetched ${emails.length} emails!`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the main function
main();
