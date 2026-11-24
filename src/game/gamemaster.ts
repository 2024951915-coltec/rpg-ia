import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config({quiet: true});

const AI_API_KEY: string = process.env.GEMINI_API_KEY ?? '';

const ai: GoogleGenAI = new GoogleGenAI({
    apiKey: AI_API_KEY, httpOptions: { timeout: 60000 }
})

import { type IConflict, type IPACheck, type ISkillCheck, ValidStats} from  './resolution.js'
import { type ICharacter, type Skill, type PrimAttr} from "./rules.js";
import { type IContext } from "./rooms.js";

async function createConflict (prompt: string): Promise<[IConflict, IContext]> {
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    scene: {
                        type: Type.STRING,
                        description: 'The description of a RPG scene, in pt-BR, containing a conflict for the players to solve'
                    },
                    short_desc: {
                        type: Type.STRING,
                        description: 'A brief of the scene described, in English, to retain context for next conflicts'
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
                                    description: 'A valid skill to check. Must be one of the listed. DO NOT TRANSLATE IT TO pt-BR'
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
                                    description: `A valid primary attribute to check. Must be one of the listed. DO NOT TRANSLATE IT TO pt-BR.
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
    let context: IContext = {
        prevScene: json.short_desc,
        attemptedCheck: '',
        playerTested: '',
        passedCheck: false,
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



    return [conflict, context];
}

interface IGameMaster {
    /** Testa se a IA está funcional */
    test(): Promise<boolean>
    /** Cria um conflito, com uma lista de verificações de Perícia e AP */
    
    createInitialConflict(world_desc: string): Promise<[IConflict, IContext]>,
    createConflictWithContext(context: IContext): Promise<[IConflict, IContext]>
}

/** Gerencia as funções de decisões do Game Master (IA) */
const GameMaster: IGameMaster = {

    test: async function (): Promise<boolean> {
        const response = await ai.models.generateContent({
            model: process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash-lite',
            contents: 'Are you functional?',
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
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

    createInitialConflict: async function (world_desc: string): Promise<[IConflict, IContext]> {
        let ret: [IConflict, IContext] = 
        await createConflict(`
            You are an RPG game master. This is the first, introductory
            scene. Introduce the players to the world, with a challenge
            the first player must overcome. 
            
            This is the description of the RPG world you'll play in:
            ${world_desc}

            Write only in-world narrative in the scene field, without headings, narrator labels or restating the prompt. Make a simple challenge with low difficulty levels.
        `);

        return ret;
    },

    createConflictWithContext: async function(context: IContext): Promise<[IConflict, IContext]> {
        let conflict_result_message: string = (context.passedCheck)
        ? 'And they managed to do it with success!'
        : 'But they could not do it.'
        
        let ret: [IConflict, IContext] = 
        await createConflict(`
            You are an RPG game master. You are currently playing a game
            and just so happened describe this scene: ${context.prevScene};

            One of your players, ${context.playerTested}, attempted to do this:
            ${context.attemptedCheck}; ${conflict_result_message}

            Write only in-world narrative without headings, narrator labels or restating the prompt. You must now create a scene, describing what happens next.
        `);

        return ret;
    }
};

export { GameMaster };