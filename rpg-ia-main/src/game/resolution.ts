import type { ICharacter, PrimAttr, Skill, ISkills } from "./rules.js"

/** Simula a rolagem de múltiplos dados rolados
 * 
 * Note-se que rolar múltiplos dados aumenta a chance de cair valores 
 * médios; Por exemplo, se eu lanço 2 dados de 6 faces, a chance de cair
 * 6 será maior do que cair 2 ou 12, já que a quantidade de combinações
 * de rolagens que dão 6 (1 e 5, 2 e 4, 3 e 3) são maiores do que o
 * número de combinações necessários para cair 2 (apenas 1 e 1) ou 12
 * (apenas 6 e 6)
 * 
 * @param n Número de dados rolados. Com valores n > 1, a rolagem vai 
 * levar em consideração a distribuição normal (ou seja, valores médios 
 * terão maior chance de cair)
 * @param faces Número de faces dos dados rolados
 * @returns Um número aleatório, entre `n` e `n * faces`, levando 
 * em consideração a distribuição normal (ou seja, valores médios 
 * terão maior chance de cair)
 */
function droll(n: number, faces: number): number
{
    let sum: number = 0;
    for(let i = 0; i < n; i ++)
    {
        sum += Math.ceil(Math.random() * faces);
    }

    return sum;
}

/** As estatísticas de AP e Perícia que são válidas 
 * 
 * Usado apenas para os prompts de IA
 */
interface IValidStats {

    /** As estatísticas de AP que são válidas 
     * 
     * Usado apenas para os prompts de IA
     */
    pas: string[],

    /** As estatísticas de Perícia que são válidas 
     * 
     * Usado apenas para os prompts de IA
     */
    skills: string[]
}

/** Uma verificação de Perícia, com descrição e nível de dificuldade */
interface ISkillCheck {
    /** A descrição da verificação, explicando o que se está tentando e justificar a escolha da Perícia */
    desc: string,
    /** A Perícia em verificação */
    skill: Skill,
    /** O nível de dificuldade entre 0 a 5, o que define o nível necessário de Perícia */
    diff: number
}

/** Uma verificação de AP, com descrição e nível de dificuldade */
interface IPACheck {
    /** A descrição da verificação, explicando o que se está tentando e justificar a escolha do AP */
    desc: string,
    /** O AP em verificação */
    pa: PrimAttr,
    /** O nível de dificuldade entre 0 a 5, o que define o nível necessário de AP */
    diff: number
}

/** A descrição de uma cena de "conflito", em que há um desafio para a personagem resolver */
interface IConflict {
    /** Uma descrição da cena, explicando o conflito das personagens */
    scene: string,
    /** Ações especificas que podem requerir uma Perícia */
    skillchecks: ISkillCheck[],
    /** Ações especificas que podem requerir um Atributo Primário */
    pachecks: IPACheck[]
}

/** As estatísticas de AP e Perícia que são válidas 
 * 
 * Usado apenas para os prompts de IA
 */
const ValidStats: IValidStats = {
    pas: ['AGL','FCA','INT','SCL','VTL'],
    skills: [
        'barter','blade','blunt',
        'camping','first_aid','heavy_armor',
        'hunting','intimidation','light_armor',
        'persuasion','ranged','restoration',
        'spellcasting','survival'
    ]
}

interface ICheck {
    /** Simula uma verificação de Perícia de uma personagem
     * 
     * @param char A personagem cuja Perícia será verificada
     * @param skillcheck As regras para verificação de Perícia
     * @returns `false`, exceto se:
     *  - `char.skills[skillcheck.skill] >= skillcheck.diff * 6`
     *  - `roll < char.skills[skillcheck.skill] && roll != 30`
     *  - `roll = 3`
     * 
     * (Considera-se `roll` o resultado da rolagem de dados `3d10`)
     */
    Skill(char: ICharacter, skillcheck: ISkillCheck): boolean;

    /** Simula uma verificação de Atributo Primário de uma personagem
     * 
     * @param char A personagem cujo Atributo Primário será verificado
     * @param skillcheck As regras para verificação de Atributo Primário
     * @returns `false`, exceto se:
     *  - `char.atts[pacheck.pa] >= skillcheck.diff && char.atts[pacheck.pa] > roll - 6`
     *  - `char.atts[pacheck.pa] >= 0 && char.atts[pacheck.pa] > roll`
     *  - `char.atts[pacheck.pa] < 0 && char.atts[pacheck.pa] > roll - 6`
     * 
     * (Considera-se `roll` o resultado da rolagem de dados `2d5`)
     */
    PA(char: ICharacter, pacheck: IPACheck): boolean
}

/** Define as funções de verificação de Perícia e AP */
const Check: ICheck = {
    Skill: function (char: ICharacter, skillcheck: ISkillCheck): boolean 
    {
        let roll: number = droll(3, 10);
        let skill: number = char.skills[skillcheck.skill];

        if(skill > skillcheck.diff * 6 || roll == 3)
            return true;
        else
            return roll < skill && roll != 30;
    },


    PA: function (char: ICharacter, pacheck: IPACheck): boolean 
    {
        let roll: number = droll(2, 5);
        let pa: number = char.atts[pacheck.pa]

        if(pa >= pacheck.diff || pa < 0)
            return roll - 6 <= pa;
        else
            return roll <= pa;
    }
}

export {Check, ValidStats, type ISkillCheck, type IPACheck, type IConflict};