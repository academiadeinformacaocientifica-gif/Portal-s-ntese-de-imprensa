import { GoogleGenAI, Type } from "@google/genai";
import { Category } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestCategoryAndSummary(title: string, content: string): Promise<{ category: Category, summary: string }> {
  const prompt = `Analyze the following news article and provide a category and a short summary (in Portuguese).
  
  Categories to choose from: Política, Economia, Sociedade, Cultura, Saúde/IA, Meio Ambiente.
  
  Title: ${title}
  Content: ${content}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "The most appropriate category from the provided list.",
          },
          summary: {
            type: Type.STRING,
            description: "A professional and concise summary in Portuguese.",
          },
        },
        required: ["category", "summary"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return {
      category: (result.category as Category) || 'Sociedade',
      summary: result.summary || content.slice(0, 200) + '...',
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      category: 'Sociedade',
      summary: content.slice(0, 200) + '...',
    };
  }
}
