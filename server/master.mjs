import {GoogleGenAI} from '@google/genai';
import {randomUUID} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {dataDir} from './db.mjs';
export const demo=process.env.RPG_MODE==='demo';
const ai=!demo && process.env.GEMINI_API_KEY ? new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY,httpOptions:{timeout:60000}}):null;
function client(){if(!ai)throw Error('Configure GEMINI_API_KEY no servidor ou selecione RPG_MODE=demo.');return ai;}
export async function story(prompt,example){
 if(demo)return structuredClone(example);
 const r=await client().models.generateContent({model:process.env.GEMINI_TEXT_MODEL||'gemini-3.5-flash-lite',contents:prompt+' Responda em português, em JSON com a estrutura deste exemplo: '+JSON.stringify(example),config:{responseMimeType:'application/json'}});
 return JSON.parse(r.text);
}
export async function illustration(prompt){
 if(process.env.LOCAL_IMAGE_API){
   const endpoint=new URL('/sdapi/v1/txt2img',process.env.LOCAL_IMAGE_API);
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:'Digital fantasy painting, no lettering. '+prompt,steps:20,width:512,height:512}),signal:AbortSignal.timeout(180000)});
   if(!response.ok)throw Error('O servidor local de imagens não conseguiu gerar a ilustração.');
   const pixels=(await response.json()).images?.[0];
   if(!pixels)throw Error('O servidor local não retornou uma imagem.');
   const name=randomUUID()+'.png';
   writeFileSync(dataDir+'/imagens/'+name,Buffer.from(pixels.replace(/^data:image\/png;base64,/,''),'base64'));
   return '/imagens/'+name;
 }
 if(demo)return '/demo.svg';
 const r=await client().models.generateContent({model:process.env.GEMINI_IMAGE_MODEL||'gemini-2.5-flash-image',contents:'Ilustração de RPG de mesa em pintura digital, sem texto. '+prompt,config:{responseModalities:['TEXT','IMAGE']}});
 const d=r.candidates?.[0]?.content?.parts?.map(p=>p.inlineData).find(x=>x?.data);
 const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[d?.mimeType];
 if(!ext)throw Error('O modelo não devolveu imagem. Confira o modelo e tente novamente.');
 const name=randomUUID()+'.'+ext;writeFileSync(dataDir+'/imagens/'+name,Buffer.from(d.data,'base64'));return '/imagens/'+name;
}
export async function campaign(theme){
 const c=await story('Crie um prelúdio, um objetivo e três locais ligados para esta campanha: '+theme,{preludio:'Um mensageiro desapareceu antes de entregar sua carta.',objetivo:'Recuperar a carta perdida.',locais:[{nome:'Portão',descricao:'A sentinela espera junto à entrada.',prompt:'Portão antigo ao amanhecer'},{nome:'Arquivo',descricao:'Passos ecoam entre os documentos.',prompt:'Arquivo subterrâneo iluminado por velas'},{nome:'Observatório',descricao:'Uma carta repousa junto à luneta.',prompt:'Observatório abandonado sob o luar'}]});
 if(!c.preludio||!c.objetivo||!Array.isArray(c.locais)||c.locais.length<2||!c.locais.every(m=>m.nome&&m.descricao&&m.prompt))throw Error('A campanha recebida está incompleta. Tente novamente.');return c;
}
