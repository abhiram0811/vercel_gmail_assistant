/**
 * Index Emails to Pinecone
 * 
 * This script:
 * 1. Fetches today's emails from Gmail
 * 2. Creates embeddings for each email
 * 3. Stores them in Pinecone vector database
 */

import { getTodaysEmails } from './test-auth.js';
import { embedEmails } from './embeddings.js';
import { initializePinecone, upsertEmails, getIndexStats } from './pinecone-client.js';

async function main() {
  console.log('📧 Gmail → Pinecone Indexing Pipeline\n');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Step 1: Initialize Pinecone
    await initializePinecone();
    
    // Step 2: Fetch emails from Gmail
    console.log('📥 Fetching emails from Gmail...\n');
    const emails = await getTodaysEmails();
    
    if (emails.length === 0) {
      console.log('No emails to index.');
      return;
    }
    
    // Step 3: Create embeddings
    const embeddedEmails = await embedEmails(emails);
    
    // Step 4: Upload to Pinecone
    await upsertEmails(embeddedEmails);
    
    // Step 5: Show stats
    const stats = await getIndexStats();
    console.log('📊 Index Statistics:');
    console.log(`   Total vectors: ${stats.totalRecordCount}`);
    console.log(`   Dimension: ${stats.dimension}`);
    
    console.log('\n✅ Indexing complete!');
    console.log('\n💡 Next: Run search-emails.js to query your data!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main();