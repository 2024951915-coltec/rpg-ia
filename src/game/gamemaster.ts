import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({quiet: true});

const AI_API_KEY: string = process.env.GEMINI_API_KEY ?? '';

const ai: GoogleGenAI = new GoogleGenAI({
    apiKey: AI_API_KEY
})

import { type IConflict, type IPACheck, type ISkillCheck, ValidStats} from  './resolution.js'
import { type ICharacter, type Skill, type PrimAttr} from "./rules.js";

interface IGameMaster {
    /** Testa se a IA está funcional */
    test(): Promise<boolean>
    /** Cria um conflito, com uma lista de verificações de Perícia e AP */
    createConflict(): Promise<IConflict>
}

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
                    },
                    required: ['functional', 'message']
                }
            }
        });

        const j = JSON.parse(response.text ?? '{"functional": "false", "message": "Failed to connect to Gemini"}');
        console.log("Gemini Test:", j.message);

        return j.functional;
    },

    createConflict: async function (): Promise<IConflict> {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: `Create an RPG scene containing a \"conflict\" 
            for the player to solve, as well as skill/attribute checks 
            for the player. Some parts must be translated to pt-BR, 
            however, do NOT attempt to do that unless specifically told to`,
            config: {
                responseMimeType: 'application/json',
                responseJsonSchema: {
                 type: Type.OBJECT,
                    properties: {
                        scene: {
                            type: Type.STRING,
                            description: 'The description of a RPG scene, in pt-BR, containing a conflict for the players to solve'
                        },
                        skillchecks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    desc: {
                                        type: Type.STRING,
                                        description: 'A description of what the skill check will attempt to do, in pt-BR'
                                    },
                                    skill: {
                                        type: Type.STRING,
                                        enum: ValidStats.skills,
                                        description: 'A valid skill to check. Must be one of the listed, and DO NOT TRANSLATE IT TO pt-BR'
                                    },
                                    diff: {
                                        type: Type.INTEGER,
                                        description: 'The level of difficulty of this check, which will determine the level of the skill in check. Must be between 0 and 5'
                                    }
                                }
                            },
                            minItems: 1,
                            description: 'A list of actions involving character skills to solve. Must contain at least one item'
                        },
                        pachecks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    desc: {
                                        type: Type.STRING,
                                        description: 'A description of what the primary attribute check will attempt to do, in pt-BR'
                                    },
                                    pa: {
                                        type: Type.STRING,
                                        enum: ValidStats.pas,
                                        description: `A valid primary attribute to check. Must be one of the listed, and DO NOT TRANSLATE IT TO pt-BR.
                                        Consider each as follows:
                                        AGL: Agility
                                        FCA: Strength
                                        VTL: Vitality
                                        INT: Inteligence
                                        SCL: Sociability`
                                    },
                                    diff: {
                                        type: Type.INTEGER,
                                        description: 'The level of difficulty of this check, which will determine the level of the primary attribute in check. Must be between 0 and 5'
                                    }
                                }
                            },
                            description: 'A list of actions involving physical/mental primary attributes (PAs) to solve'
                        }
                    },
                    required: ["scene", "skillchecks", "pachecks"]
                }
            }
        });

        const json = JSON.parse(response.text ?? '');
        let conflict: IConflict = {
            scene: json.scene,
            skillchecks: [],
            pachecks: []
        }

        json.skillchecks.forEach((el: any) => {
            let sc: ISkillCheck = {
                desc: el.desc,
                skill: el.skill as Skill,
                diff: el.diff
            }

            conflict.skillchecks.push(sc);
        });

        json.pachecks.forEach((el: any) => {
            let pac: IPACheck = {
                desc: el.desc,
                pa: el.pa as PrimAttr,
                diff: el.diff
            }

            conflict.pachecks.push(pac);
        });

        return conflict;
    }
};

export { GameMaster };