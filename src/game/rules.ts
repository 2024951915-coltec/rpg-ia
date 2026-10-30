/** 
 * Conjunto de Atributos Primários (*primatts*) de uma personagem 
 * 
 * Nenhum Atributo Primário deverá ter valor < -5 ou > 5
 */
interface IPrimAtts {
    /** (Força) Define a musculatura e força bruta da personagem */
    FCA: number,
    /** (Vitalidade) Define a resistência física e cardiologia da personagem */
    VTL: number,
    /** (Agilidade) Define a velocidade e capacidade de percepção da personagem */
    AGL: number,
    /** (Inteligência) Define a capacidade de raciocínio da personagem */
    INT: number,
    /** (Sociabilidade) Define a capacidade da personagem de comunicar-se e socializar-se */
    SCL: number
}

/** 
 * Uma chave para um Atributo Primário qualquer definido por `IPrimAtts` 
 */
type PrimAttr = keyof IPrimAtts;

/** 
 * Conjunto de Perícias (*skills*) de uma personagem 
 * 
 * Nenhuma Perícia deverá ter valor > 30 ou < 0, e valores fracionários são proibidos
 */
interface ISkills {
    /** (Persuasão) Capacidade de convencer ou coagir pacificamente uma PNJ 
     * 
     * O valor inicial de Persuasão é definido por `20 + SCL * 2` (máx: 30, min: 10)
     */
    persuasion: number,

    /** (Intimidação) Capacidade de convencer ou coagir violentamente uma PNJ 
     * 
     * O valor inicial de Intimidação é definido por `15 + SCL + FCA * 2` (máx: 30, min: 0)
     */
    intimidation: number,

    /** (Barganha) Capacidade de barganhar com uma PNJ, obtendo melhores preços 
     * 
     * O valor inicial de Barganha é definido por `15 + SCL * 3` (máx: 30, min: 0)
     */
    barter: number,

    /** (Acampamento) Capacidade de construir barracas e abrigos para acampar quando não se há suprimentos
     * 
     * O valor inicial de Acampamento é definido por `18 + INT + VTL * 2` (máx: 30 (c/ cap), min: 3)
     */
    camping: number,

    /** (Caça) Capacidade de caçar por comida quando não se há suprimentos
     * 
     * O valor inicial de Caça é definido por `18 + INT + AGL * 2, 30` (máx: 30 (c/ cap), min 3)
     */
    hunting: number,

    /** (Sobrevivência) Capacidade de sobreviver em situações adversas, ou quando não se está acampando
     * 
     * O valor inicial de Sobrevivência é definido por `15 + VTL * 3` (máx: 30, min: 0)
     */
    survival: number,

    /** (Armas Brancas) Capacidade de usar armas afiadas (ex.: espadas, lanças)
     * 
     * O valor inicial de Armas Brancas é definido por `20 + AGL + FCA` (máx: 30, min: 10)
     */
    blade: number,

    /** (Armas Cegas) Capacidade de usar armas cegas (ex.: maças, martelos)
     * 
     * O valor inicial de Armas Cegas é definido por `10 + FCA * 3` (máx: 25, min: 0 (c/ cap))
     */
    blunt: number,

    /** (Longa Distância) Capacidade de usar armas de longa distância (ex.: arcos, bestas) 
     * 
     * O valor inicial de Longa Distância é definido por `15 + AGL * 2` (máx: 25, min: 5)
     */
    ranged: number,

    /** (Armadura Leve) Capacidade de usar armaduras leves (de couro ou cota de malha)
     * 
     * O valor inicial de Armas Brancas é definido por `20 + AGL + VTL` (máx: 30, min: 10)
     */
    light_armor: number,

    /** (Armadura Pesada) Capacidade de usar armaduras de placas
     * 
     * O valor inicial de Armas Cegas é definido por `10 + VTL + FCA * 2` (máx: 25, min: 0 (c/ cap))
     */
    heavy_armor: number,

    /** (Feitiçaria) Capacidade de lançar feitiços
     * 
     * O valor inicial de Feitiçaria é definido por `10 + INT * 3` (máx: 25, min: 0 (c/ cap))
     */
    spellcasting: number,

    /** (Primeiros-socorros) Capacidade de curar ferimentos (sem usar magia) 
     * 
     * O valor inicial de Primeiros-socorros é definido por `15 + INT + VTL * 2` (máx: 30, min: 0)
     */
    first_aid: number,

    /** (Restauração) Capacidade de curar ferimentos (usando magia)
     * 
     * O valor inicial de Primeiros-socorros é definido por `10 + VTL + INT * 2` (máx: 25, min: 0)
     */
    restoration: number,
}

/** Uma chave para uma Perícia qualquer definida por `ISkills` */
type Skill = keyof ISkills;


/** O tipo de uma personagem */
interface ICharacter {
    /** Nome da personagem */
    name: string,

    /** (Pontos de Vida (ou PV)) Define quanto dano a personagem pode levar até morrer
     * 
     * Ao criar a personagem, é definido por `25 + VTL`, e isso subirá para `10 + VTL` a cada nível
     */
    HP: number,
    /** (Pontos de Energia (ou PE)) Define quantas vezes a personagem poderá fazer ataques críticos
     * 
     * Ao criar a personagem, é definido por `20 + AGL`, e isso subirá para `5` a cada nível
     */
    EP: number,
    /** (Pontos de Magia (ou PM)) Define quantas vezes a personagem poderá lançar feitiços durante um combate
     * 
     * Ao criar a personagem, é definido por `20 + INT`, e isso subirá para `5 + INT` a cada nível.
     * Por causa disso, esse valor não aumentará ao subir de nível, se a personagem possui `INT = -5`
     */
    MP: number,
    /** (Pontos de Carga (ou PC)) Define quanto a personagem poderá carregar. Não inclui armas nem armaduras
     * 
     * Ao criar a personagem, é definido por `25 + FCA`, e isso subirá para `2 + FCA / 2`. 
     * Se `FCA <= 1`, então seu `WP` nunca aumentará
     */
    WP: number,

    /** O EXP que a personagem tem */
    EXP: {
        /** O número de EXP total que a personagem tem no momento.
         * 
         * Inicialmente esse valor é sempre 0, e subirá conforme você completa batalhas. Esse valor nunca diminue.
        */
        current: number,
        /** O total de EXP que a personagem deverá atingir para subir de nível 
         * 
         * Inicialmente esse valor é sempre 20, e subirá em 120% a cada nível. Esse valor nunca diminue.
        */
        total: number,
        /** O nível de experiência da personagem 
         * 
         * Inicialmente esse valor é sempre 0, e ele subirá em 1 toda vez que `EXP.current` superar `EXP.total`. Esse valor nunca diminue
        */
        lvl: number
    }

    /** Os Atributos Primários da personagem */
    atts: IPrimAtts,
    /** As Perícias da personagem */
    skills: ISkills,
}

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
    char.EXP.total += char.EXP.total * 1.20;
    char.EXP.lvl += 1;

    char.HP += 10 + char.atts.VTL;
    char.EP += 5;
    char.MP += 5 + char.atts.INT;
    char.WP += 2 - Math.floor(char.atts.FCA);
}