import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // In a real app, strict env handling needed.

const ai = new GoogleGenAI({ apiKey });

export const checkContentWithGemini = async (text: string, type: 'proofread' | 'expand') => {
  if (!apiKey) {
    console.warn("Gemini API Key missing");
    return "API Key is missing. Unable to use AI features.";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    let prompt = "";
    
    if (type === 'proofread') {
      prompt = `Proofread and improve the clarity of the following text for a book review. Keep the original tone but fix grammar and flow:\n\n"${text}"`;
    } else {
      prompt = `Expand on the following thoughts for a book review. Make it more insightful but keep it under 150 words added:\n\n"${text}"`;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Fallback to original
  }
};
