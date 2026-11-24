import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dataDir } from './db.mjs';

export function asciiPortrait(role, appearance) {
  const traits = (role+' '+appearance).toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');
  const hat = /mag[oa]|brux[oa]|feiticeir/.test(traits) ? ['     /\\     ', '    /__\\    ', '   /____\\   '] :
    ['            ', '   .----.   ', /cach|encaracol/.test(traits) ? '  (~~~~~~)  ' : '  /______\\  '];
  const eyes = /oculos/.test(traits) ? '  |(o)(o)|  ' : /cicatriz/.test(traits) ? '  | /  o |  ' : '  | o  o |  ';
  const chin = /barba|barbudo/.test(traits) ? '   \\####/   ' : '   \\____/   ';
  const colors = {verde:'#8ee0ac',azul:'#93c5fd',vermelh:'#ffa5a5',rox:'#dbb6ff',dourad:'#f3cd7b'};
  const color = Object.entries(colors).find(([word])=>traits.includes(word))?.[1] || '#e3e7eb';
  const lines = [...hat,eyes,'  |  --  |  ',chin,'   /|  |\\   ','  /_|__|_\\  '];
  const rows = lines.map((line,i)=>'<text x="24" y="'+(26+i*22)+'">'+line+'</text>').join('');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#17222b"/><g fill="'+color+'" font-family="monospace" font-size="20" xml:space="preserve">'+rows+'</g></svg>';
  const file = randomUUID()+'.svg';
  writeFileSync(dataDir+'/imagens/'+file,svg);
  return '/imagens/'+file;
}
