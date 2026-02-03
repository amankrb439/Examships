
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from '../types';

/**
 * AI Instance Initialization
 * Always use process.env.API_KEY as strictly required by the system.
 */
const getAI = () => {
  // Use a global access pattern that works across build tools
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : (window as any).process?.env?.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.warn("API_KEY not found in process.env. Ensure it is set in Vercel Environment Variables.");
    // Fallback to avoid complete crash during boot, will error only on API call
    throw new Error("Missing API Key");
  }
  return new GoogleGenAI({ apiKey });
};

export const extractChaptersFromContext = async (context: string): Promise<string[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract chapters from this context: ${context.substring(0, 5000)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Extract Chapters Error:", error);
    return ["General Module 1", "Revision Set", "PYQ Practice"];
  }
};

export const generateQuizQuestions = async (config: QuizConfig, context?: string): Promise<Question[]> => {
  try {
    const ai = getAI();
    const prompt = `Act as an expert examiner. Generate ${config.questionCount} high-quality Multiple Choice Questions in Hindi for the topic: "${config.topic}". 
    Focus on NCERT patterns and previous year competitive exams. 
    Ensure the JSON matches the schema exactly.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctAnswerIndex"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Question Generation Error:", error);
    throw error;
  }
};
