
import { GoogleGenAI } from "@google/genai";
import { TEAM_DATA } from "../constants";

const SYSTEM_INSTRUCTION = `
You are the AI Mission Control Assistant for Casuall Camping. Your objective is to help team members and stakeholders navigate the high-performance operational workflow.

MISSION CONTEXT:
${JSON.stringify(TEAM_DATA, null, 2)}

OPERATIONAL PROTOCOLS:
1. RESPONSE STYLE: Professional, technical, concise, and slightly futuristic.
2. DATA INTEGRITY: Only refer to the provided team matrix for person-to-task mapping.
3. TERMINOLOGY: Use terms like 'Node synchronization', 'Uplink active', 'Operational parameters', and 'Logistics deployment'.
4. ASSISTANCE: Be highly efficient. Do not provide unnecessary fluff. Provide direct answers to system status queries.
`;

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "ERROR: System API Key missing. Please initialize environment variables.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.65,
        topP: 0.9,
      },
    });

    const text = response.text;
    return text || "Uplink silent. No data received from the neural network.";
  } catch (error) {
    console.error("Mission Control Connectivity Error:", error);
    return "CRITICAL_ERROR: Transmission interrupted. Connection to the AI Node failed.";
  }
};
