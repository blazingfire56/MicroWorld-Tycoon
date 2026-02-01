
import { GoogleGenAI } from "@google/genai";
import { GameState, MarketPrice } from "../types";

export const getAIAdvice = async (gameState: GameState): Promise<string> => {
  // Always initialize with the named apiKey parameter.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activeEventStr = gameState.activeEvent 
    ? `DOGAĐAJ: ${gameState.activeEvent.name} (${gameState.activeEvent.description})`
    : "Mirna je atmosfera.";

  try {
    // Using ai.models.generateContent with systemInstruction in the config as recommended.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Situacija u gradu:
        - Resursi: ${JSON.stringify(gameState.resources)}
        - Broj zgrada: ${gameState.buildings.length}
        - Dan simulacije: ${gameState.day}
        - Trenutna reputacija: ${gameState.reputation}/100
        - Sreća radnika: ${gameState.happiness}/100
        - Trenutni događaj: ${activeEventStr}
        - Aktivni zadaci: ${gameState.activeQuests.filter(q => !q.isCompleted).map(q => q.title).join(', ')}
      `,
      config: {
        systemInstruction: "Ti si elitni ekonomski savetnik za tajkune u igri MicroWorld Tycoon. Tvoj zadatak je da pružiš JEDAN ultra-profesionalan, kratak savet na SRPSKOM jeziku. Budi direktan, koristi stručnu terminologiju (investicija, likvidnost, optimizacija). Maksimum 140 karaktera.",
      }
    });

    // Access the .text property directly.
    return response.text?.trim() || "Direktore, podaci stižu. Fokusirajte se na likvidnost.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Analiza tržišta u toku. Ostanite fokusirani na rast.";
  }
};
