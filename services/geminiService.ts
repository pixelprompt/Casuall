
import { GoogleGenAI } from "@google/genai";
import { TEAM_DATA } from "../constants";

const SYSTEM_INSTRUCTION = `
You are the AI Mission Control Assistant. Your objective is to help team members and stakeholders navigate the current project workflow.
Context:
${JSON.stringify(TEAM_DATA, null, 2)}

Instructions:
1. Provide concise, professional, and slightly futuristic/technical responses.
2. If asked who is doing what, refer to the provided team data.
3. Be helpful but efficient. Use technical jargon where appropriate (e.g., 'workflow integration', 'logistics optimization', 'model deployment').
`;

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I am unable to process that command at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: System link interrupted. Please check your neural connection.";
  }
};
