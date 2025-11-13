import OpenAI from "openai";
import { configDotenv } from "dotenv";
import { text } from "express";
import { texttospeech } from "googleapis/build/src/apis/texttospeech";

configDotenv();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

/**
 * Creates a text embedding (vector representation)
 * 
 * LEARNING: Embeddings are like coordinates in meaning-space
 * - Input: "Hello world" 
 * - Output: [0.123, -0.456, 0.789, ...] (1536 numbers for OpenAI)
 * 
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Vector of numbers
 */

export async function createEmbedding(text){
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
            encoding_format: 'float'
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error creating embeddings');
        throw error;
    }
}

/**
 * Prepares email for embedding
 * 
 * LEARNING: We combine subject + from + snippet into one text
 * This gives the AI context about the email's meaning
 * 
 * @param {Object} emailData - Gmail API email object
 * @returns {Object} Prepared data with text and metadata
 */
export async function prepareEmailForEmbedding(emailData) {
    const headers = emailData.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';

    const snippet = emailData.snippet || '';

    const textToEmbed = `
        From: ${from},
        Subject: ${subject},
        Content: ${snippet}
        `.trim();
    
    return {
        id: emailData.id,
        text: textToEmbed,
        metadata: {
            subject,
            from,
            date,
            snippet: snippet.substring(0, 200)
        }
    };   
}

/**
 * Batch create embeddings for multiple emails
 * 
 * LEARNING: Processing in batches is more efficient
 * But we'll do them sequentially to avoid rate limits
 * 
 * @param {Array} emails - Array of Gmail email objects
 * @returns {Promise<Array>} Array of embedded email data
 */
export async function embedEmails(emails) {
    console.log(`Creating embeddings for ${emails.length} emails....`);

    const embeddedEmails = [];

    for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const prepared = prepareEmailForEmbedding(email.data);
    
    console.log(`   Processing ${i + 1}/${emails.length}: ${prepared.metadata.subject}`);
    
    // Create embedding
    const embedding = await createEmbedding(prepared.text);
     embeddedEmails.push({
      id: prepared.id,
      values: embedding, // The vector!
      metadata: prepared.metadata
    });
    await new Promise(resolve => setTimeout(resolve, 100));
}
    console.log('All embeddings created! \n');
    return embeddedEmails;
}