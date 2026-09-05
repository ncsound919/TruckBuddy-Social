import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}
