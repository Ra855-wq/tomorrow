import { GoogleGenAI } from "@google/genai";

const getClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateWisdom = async (prompt: string, theme: string): Promise<string> => {
  try {
    const ai = getClient();
    
    let systemInstruction = "You are the ancient Book of Wisdom from the Tomorrowland festival. You speak in a mystical, poetic, and inspiring tone. You focus on themes of unity, love, music, tomorrow, and magic. Your responses should be short, profound verses.";

    if (theme === 'ADSCENDO') {
      systemInstruction += " Focus on flight, birds, wind, the Great Library, and ascending to new heights.";
    } else if (theme === 'LIFE') {
      systemInstruction += " Focus on nature, the world of Silvyra, blooming, organic growth, and the connection between all living things.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
      }
    });

    return response.text || "The pages are silent today...";
  } catch (error) {
    console.error("The Book of Wisdom is closed:", error);
    return "The magic is faint... try again later.";
  }
};
