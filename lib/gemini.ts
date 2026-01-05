import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK
// The API key is injected via vite.config.ts define property
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
