import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
export const dataDir=process.env.DATA_DIR || 'data';
mkdirSync(dataDir+'/imagens',{recursive:true});
export const db=new DatabaseSync(dataDir+'/rpg.sqlite');
db.exec(readFileSync('docs/schema.sql','utf8'));
if(!db.prepare('PRAGMA table_info(salas)').all().some(column=>column.name==='modo_mapa')){
  db.exec("ALTER TABLE salas ADD COLUMN modo_mapa TEXT DEFAULT 'auto'");
}
export const one=(sql,...args)=>db.prepare(sql).get(...args);
export const all=(sql,...args)=>db.prepare(sql).all(...args);
export const run=(sql,...args)=>db.prepare(sql).run(...args);
export function transaction(fn){
  db.exec('BEGIN IMMEDIATE');
  try {const result=fn();db.exec('COMMIT');return result;} catch(e){db.exec('ROLLBACK');throw e;}
}
