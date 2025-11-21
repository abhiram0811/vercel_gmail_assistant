/**
 * Pinecone Vector Database Client
 * 
 * LEARNING: Vector databases store embeddings and let you
 * search by similarity instead of exact matches
 * 
 * Traditional DB: "Find emails with subject = 'Meeting'"
 * Vector DB: "Find emails similar to 'project discussion'"
 */
import { Pinecone } from "@pinecone-database/pinecone";

import { configDotenv } from "dotenv";


configDotenv();

const INDEX_NAME = 'gmail-emails';

let pineconeClient = null;
let index = null;

/**
 * Initialize Pinecone connection
 * 
 * LEARNING: This sets up connection to your vector database
 * You only need to do this once per script run
 */

export async function initializePinecone() {
    if (pineconeClient) {
        return { client: pineconeClient, index };
    }
    console.log('Connecting to Pinecone...');

    pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    //Check if the index exists
    const indexList = await pineconeClient.listIndexes();
    const indexExists = indexList.indexes?.some(idx => idx.name === INDEX_NAME);

    if (!indexExists) {
        console.log(`Creating a new Index: ${INDEX_NAME}...`);

        await pineconeClient.createIndex({
            name: INDEX_NAME,
            dimension: 1536, // OpenAI embedding size
            metric: 'cosine', // Measures similarity between vectors
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            }
        });
        console.log('Waiting for the idx to be ready...');
        await new Promise(resolve => setTimeout(resolve, 60000));
    }

    index = pineconeClient.index(INDEX_NAME);
    console.log(`Pinecone connected!\n`);

    return { client: pineconeClient, index };
}

/**
 * Upsert (insert or update) emails into Pinecone
 * 
 * LEARNING: "Upsert" = Update if exists, Insert if new
 * We send vectors with metadata to Pinecone
 * 
 * @param {Array} embeddedEmails - Array of {id, values, metadata}
 */
export async function upsertEmails(embeddedEmails) {
    const { index } = await initializePinecone();

    console.log(`Uploading ${embeddedEmails.length} emails to Pinecone...`);

    const batchSize = 100;
    for (let i = 0; i < embeddedEmails.length; i = i + batchSize) {
        const batch = embeddedEmails.slice(i, i + batchSize);
        await index.upsert(batch);
        console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log('All emails uploaded!\n');
}

/**
 * Search for similar emails
 * 
 * LEARNING: This is the magic! Search by MEANING, not keywords
 * 
 * @param {string} queryText - What to search for
 * @param {number} topK - How many results to return
 * @returns {Promise<Array>} Similar emails
 */
export async function searchEmails(queryText, topK = 5) {
    const { index } = await initializePinecone();

    const { createEmbedding } = await import('./embeddings.js');
    const queryEmbedding = await createEmbedding(queryText);

    console.log(`Searching for:"${queryText}"\n`);

    //Query Pinecone
    const results = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true
    });


    console.log(`These are the returned results from the Promise's response of the Index.query method from Pinecone SDK\n${results}`);
    return results.matches;

}

/**
 * Get index statistics
 */
export async function getIndexStats() {
  const { index } = await initializePinecone();
  const stats = await index.describeIndexStats();
  return stats;
}