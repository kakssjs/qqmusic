import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const [manifestFile,root,revision]=process.argv.slice(2);
if(!/^[a-f0-9]{40}$/.test(revision))throw Error('Invalid revision');
const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
let index=0,completed=0;
await Promise.all(Array.from({length:5},async()=>{
  while(index<manifest.length){
    const item=manifest[index++];
    if(item.path.includes('..')||path.isAbsolute(item.path))throw Error('Invalid path');
    const target=path.resolve(root,item.path);
    if(!target.startsWith(path.resolve(root)+path.sep))throw Error('Invalid target');
    await mkdir(path.dirname(target),{recursive:true});
    try {if(createHash('sha256').update(await readFile(target)).digest('hex')===item.sha256){completed++;continue;}} catch {}
    let success=false;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const response=await fetch(`https://raw.githubusercontent.com/kakssjs/qqmusic/${revision}/docs/${item.path}`,{signal:AbortSignal.timeout(300000)});
        if(!response.ok)throw Error(`HTTP ${response.status}`);
        const bytes=Buffer.from(await response.arrayBuffer());
        if(createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Checksum mismatch');
        await writeFile(target,bytes);success=true;break;
      }catch(error){if(attempt===2)throw Error(`${item.path}: ${error.message}`);}
    }
    if(success&&++completed%20===0)console.log(`Downloaded ${completed}/${manifest.length}`);
  }
}));
console.log(`Verified ${completed} frontend files`);
