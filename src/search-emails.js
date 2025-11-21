/**
 * Search Emails in Pinecone
 * 
 * This demonstrates SEMANTIC SEARCH - finding emails by meaning!
 */

import { searchEmails } from './pinecone-client.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('🔍 Email Semantic Search\n');
  console.log('='.repeat(60) + '\n');
  console.log('💡 TIP: Search by meaning, not just keywords!');
  console.log('   Examples:');
  console.log('   - "project updates"');
  console.log('   - "meeting invitations"');
  console.log('   - "payment confirmations"\n');
  
  while (true) {
    const query = await ask('\n🔎 Enter search query (or "quit" to exit): ');
    
    if (query.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      break;
    }
    
    if (!query.trim()) {
      continue;
    }
    
    try {
      const results = await searchEmails(query, 5);
      
      if (results.length === 0) {
        console.log('   No results found.');
        continue;
      }
      
      console.log(`\n📬 Found ${results.length} similar emails:\n`);
      
      results.forEach((result, index) => {
        const { metadata, score } = result;
        console.log(`${index + 1}. [Similarity: ${(score * 100).toFixed(1)}%]`);
        console.log(`   From: ${metadata.from}`);
        console.log(`   Subject: ${metadata.subject}`);
        console.log(`   Date: ${metadata.date}`);
        console.log(`   Preview: ${metadata.snippet}...\n`);
      });
      
    } catch (error) {
      console.error('❌ Search error:', error.message);
    }
  }
}

main();