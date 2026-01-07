import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (aiClient) return aiClient;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }

  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
};

export const getAISupport = async (userQuestion: string) => {
  try {
    const ai = getClient();
    if (!ai) {
      return "Desculpe, o serviço de IA está temporariamente indisponível (Chave de API não configurada).";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Updated to stable model name just in case
      contents: userQuestion,
      config: {
        systemInstruction: `Você é um assistente virtual acolhedor do consultório do Psicanalista Messias Tavares. 
        Messias Tavares é um psicanalista de orientação freudiana e lacaniana. 
        Seu tom deve ser extremamente humano, ético, calmo e acolhedor. 
        Não faça diagnósticos. Não prometa cura. 
        Explique que a psicanálise é um processo de investigação do inconsciente. 
        Ajude o usuário a entender as opções: 
        - Consulta Inicial (R$ 170): Obrigatória antes de iniciar a terapia.
        - Pacote Essencial (4 sessões - R$ 540): Recomendado para quem está começando.
        - Pacote Continuidade (8 sessões - R$ 1.040): Para quem busca constância.
        - Pacote Processo Terapêutico (12 sessões - R$ 1.500): Para um trabalho contínuo e profundo.
        Seja breve e reconfortante. Responda em Português do Brasil.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, tive um pequeno problema técnico. Como posso te ajudar com o agendamento hoje?";
  }
};