import type { ICharacter, IPrimAtts, Skill } from "./rules.js";

/** Cria uma personagem com nome, Atributos Primários, e Perícias selecionadas para melhorar
 * 
 * @param name O nome da personagem
 * @param pa Os Atributos Primários da personagem, conforme definidos pelo jogador
 * @param tagged_skills As Perícias da personagem que foram escolhidas para serem aumentadas em 1
 * 
 * @returns Uma personagem (`ICharacter`)
 */
function createCharacter(name: string, pa: IPrimAtts, tagged_skills: [Skill, Skill, Skill]): ICharacter
{
    let char: ICharacter = {
        name: name,
        atts: pa,

        HP: 25 + pa.VTL,
        EP: 20 + pa.AGL,
        MP: 20 + pa.INT,
        WP: 25 + pa.FCA,

        EXP: {
            current: 0,
            total: 20,
            lvl: 0
        },

        skills: {
            persuasion: 20 + pa.SCL * 2,
            intimidation: 15 + pa.SCL + pa.FCA * 2,
            barter: 15 + pa.SCL * 3,

            camping: Math.min(18 + pa.INT + pa.VTL * 2, 30),
            hunting: Math.min(18 + pa.INT + pa.AGL * 2, 30),
            survival: 15 + pa.VTL * 3,

            blade: 20 + pa.AGL + pa.FCA,
            blunt: Math.max(10 + pa.FCA * 3, 0),
            ranged: 15 + pa.AGL * 2,
            spellcasting: Math.max(10 + pa.INT * 3, 0),
            
            light_armor: 20 + pa.AGL + pa.VTL,
            heavy_armor: Math.max(10 + pa.VTL + pa.FCA * 2, 0),

            first_aid: 15 + pa.INT + pa.VTL * 2,
            restoration: Math.max(10 + pa.VTL + pa.INT * 2, 0)
        }
    }

    tagged_skills.forEach(skill => {
        if(char.skills[skill] <= 5)
            char.skills[skill] += 1;
        else
            char.skills[skill] = Math.min(30, Math.floor(char.skills[skill] * 1.15));
    });

    return char;
}

/** Aumenta a EXP de uma personagem. Se a EXP dela superar o máximo de EXP, ela subirá de nível.
 * 
 * @param char A personagem a ganhar EXP
 * @param exp o total de EXP que ela irá ganhar
 */
function giveEXP(char: ICharacter, exp: number): void
{
    char.EXP.current += exp;

    if(char.EXP.current >= char.EXP.total)
    {
        levelUp(char);
    }
}

/** Sobe o nível de uma personagem. 
 * 
 * (OBS.: Essa função é chamada automaticamente pela função `giveEXP()` e, por conta disso, não é compartilhada pelo módulo)
 * 
 * @param char Uma personagem para subir de nível
 *
 */
function levelUp(char: ICharacter): void
{
    char.EXP.total += char.EXP.total * 1.2;
    char.EXP.lvl += 1;

    char.HP += 10 + char.atts.VTL;
    char.EP += 5;
    char.MP += 5 + char.atts.INT;
    char.WP += 2 - Math.floor(char.atts.FCA);
}

export {createCharacter, giveEXP};