/**
 * Gemini AI Client
 * Handles AI-powered email classification for job tracking
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Gets or creates Gemini client instance
 */
function getGeminiClient(): GoogleGenerativeAI {
    if(!geminiClient){
        if(!process.env.GEMINI_API_KEY){
            throw new Error('Missing GEMINI_API_KEY environment variable');
        }
        geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return geminiClient;
}

/**
 * Gets the Gemini Flash model for fast, free inference
 */
export function getGeminiModel(){
    const client = getGeminiClient();
    return client.getGenerativeModel({ model: 'gemini-2.0-flash-lite'}); // Try gemini-pro instead
}

