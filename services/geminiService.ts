
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCounselorResponse = async (userPrompt: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Education Counselor for JEE and NEET students in India. 
      Current context: ${context}.
      User question: ${userPrompt}`,
      config: {
        systemInstruction: "Be professional, encouraging, and informative. Help parents and students understand which institutes are better based on their verified results and fee structure. Keep responses concise and formatted with clear bullet points where necessary.",
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error connecting to my knowledge base. Please try again in a moment.";
  }
};
