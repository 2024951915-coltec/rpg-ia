import {positionMapRows} from './ascii-layout.mjs';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dataDir } from './db.mjs';
import { demo, story, illustration } from './master.mjs';

const motifs = [
  [/espacial|lunar|orbital|planeta|nave/, ['      .-"""-.','----=[  (o)  ]=----','      `-...-\'']],
  [/floresta|mata|bosque|selva/, ['    /\\','   /++\\','  /++++\\','    ||']],
  [/cidade|urbano|cyberpunk|predio/, ['    _|_','   |o o|',' __|o o|__','|[]|o o|[]|']],
  [/marinho|oceano|pirata|praia|navio/, ['     |\\','     | \\',' ____|__\\',' \\______/' ]],
  [/caverna|tunel|catacumba|esgoto/, ['    _____',' __/     \\__','/   .---.   \\','___/     \\___']],
  [/castelo|medieval|fortaleza|portao/, [' |_|_|   |_|_|',' |   |___|   |',' | []  _  [] |','_|____| |____|_']],
];
const hills = ['     /\\','    /  \\','   / /\\ \\','__/ /  \\ \\__'];
function motif(text) {
  const normalized=text.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
  return motifs.find(([pattern])=>pattern.test(normalized))?.[1];
}
function landscape(theme,place,seed){
  const grid=Array.from({length:18},()=>Array(76).fill(' '));
  function stamp(x,y,lines){
    for(const [dy,line] of lines.entries())
      for(const [dx,ch] of [...line].entries())if(ch!==' ')grid[y+dy][x+dx]=ch;
  }
  for(let i=0;i<20;i++)grid[seed[i]%6][seed[i+1]%76]=i%4===0?'*':'.';
  const background=motif(theme)||hills;
  const foreground=motif(place.nome+' '+place.descricao)||background;
  stamp(2+seed[0]%8,7,background);
  stamp(28+seed[1]%8,8,foreground);
  stamp(54+seed[2]%5,6,background);
  grid[13].fill('_');
  for(let i=0;i<4;i++)stamp(36-i*3+(seed[4]%5),14+i,['/']);
  return grid.map(row=>row.join(''));
}
export async function mapImage(room,place){
  const description=place.nome+'. '+place.descricao+'. '+place.prompt;
  if(room.modo_mapa!=='ascii')return illustration('Paisagem panorâmica de '+description);
  const seed=createHash('sha256').update(JSON.stringify([room.id,room.tema,place])).digest();
  let lines=landscape(room.tema,place,seed);
  if(!demo){
    const art=await story('Desenhe uma paisagem panorâmica com caracteres ASCII imprimíveis. Tema: '+room.tema+'. Local: '+description+'. Retorne linhas em um array JSON, sem legendas ou Markdown. Use 8 a 18 linhas de até 76 colunas.',{linhas:['      /\\','_____/  \\_____']});
    if(Array.isArray(art?.linhas)&&art.linhas.length>=4&&art.linhas.every(x=>typeof x==='string')&&art.linhas.join('').trim())
      lines=art.linhas.slice(0,18).map(line=>line.replace(/[^ -~]/g,' ').slice(0,76));
  }
  const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const rows=lines.map((line,i)=>'<text x="12" y="'+(20+i*17)+'">'+escape(line)+'</text>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 770 320"><rect width="770" height="320" fill="#15252a"/><g xml:space="preserve" fill="#a3e1c2" font-family="monospace" font-size="16">'+rows+'</g></svg>';
  const file='mapa-'+createHash('sha256').update(svg).digest('hex')+'.svg';
  writeFileSync(dataDir+'/imagens/'+file,positionMapRows(svg));
  return '/imagens/'+file;
}
