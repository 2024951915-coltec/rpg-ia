import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({quiet: true});

interface IGameMaster {
    /** Testa se a IA está funcional */
    test(): Promise<boolean>
}

const AI_API_KEY: string = process.env.GEMINI_API_KEY ?? '';

const ai: GoogleGenAI = new GoogleGenAI({
    apiKey: AI_API_KEY
})


/** Gerencia as funções de decisões do Game Master (IA) */
const GameMaster: IGameMaster = {

    test: async function (): Promise<boolean> {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: 'Are you functional?',
            config: {
                responseMimeType: 'application/json',
                responseJsonSchema: {
                    type: Type.OBJECT,
                    properties: {
                        functional: {type: Type.BOOLEAN, description:"If you got here, it's probably TRUE"},
                        message: {type: Type.STRING, description:"A message of your choice, to check functionality"}
                    }
                }
            }
        });

        const j = JSON.parse(response.text ?? '{"functional": "false", "message": "Failed to connect to Gemini"}');
        console.log("Gemini Test:", j.message);

        return j.functional;
    }

    
};

export { GameMaster };