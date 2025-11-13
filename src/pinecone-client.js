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

