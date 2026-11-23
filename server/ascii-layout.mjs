// Marca a coluna de cada símbolo para que o navegador não dependa de espaços.
export function positionMapRows(svg) {
  return svg.replace(/<text x="12" y="(\d+)">([^<]*)<\/text>/g, (_,y,line)=>{
    const cells=line.match(/&(?:amp|lt|gt);|./g)||[];
    return cells.map((symbol,column)=>symbol===' '?'':'<text x="'+(12+column*10)+'" y="'+y+'">'+symbol+'</text>').join('');
  });
}
