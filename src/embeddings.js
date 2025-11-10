import OpenAI from "openai";
import { configDotenv } from "dotenv";

configDotenv();

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

