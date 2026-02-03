
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuizConfig } from '../types';

// AI instance initialization helper
const getAI = () => {
  // Try to get from process.env (Node/Vite) or import.meta.env
  const apiKey = (typeof process !== 'undefined' ? process.env.API_KEY : null) || (import.meta as any).env?.VITE_API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    console.error("API_KEY is missing. Please set it in Netlify Environment Variables.");
    // Return a dummy instance or handle gracefully
    throw new Error("Missing API Key");
  }
  return new GoogleGenAI({ apiKey });
};

export const extractChaptersFromContext = async (context: string): Promise<string[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract chapters from: ${context.substring(0, 5000)}`,
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
    return ["General Module 1", "PYQ Practice"];
  }
};

export const generateQuizQuestions = async (config: QuizConfig, context?: string): Promise<Question[]> => {
  try {
    const ai = getAI();
    const prompt = `Create ${config.questionCount} Hindi MCQs for topic: ${config.topic}. Return JSON array.`;
    
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
    console.error("Gemini Error:", error);
    throw error;
  }
};
