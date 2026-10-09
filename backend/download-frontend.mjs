import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const [manifestFile,root,revision]=process.argv.slice(2);
if(!/^[a-f0-9]{40}$/.test(revision))throw Error('Invalid revision');
const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
let index=0,completed=0;
await Promise.all(Array.from({length:2},async()=>{
  while(index<manifest.length){
    const item=manifest[index++];
    if(item.path.includes('..')||path.isAbsolute(item.path))throw Error('Invalid path');
    const target=path.resolve(root,item.path);
    if(!target.startsWith(path.resolve(root)+path.sep))throw Error('Invalid target');
    await mkdir(path.dirname(target),{recursive:true});
    try {if(createHash('sha256').update(await readFile(target)).digest('hex')===item.sha256){completed++;continue;}} catch {}
    let success=false;
    for(let attempt=0;attempt<8;attempt++){
      try{
        const source=attempt%2===0?`https://raw.githubusercontent.com/kakssjs/qqmusic/${revision}/docs/${item.path}`:`https://cdn.jsdelivr.net/gh/kakssjs/qqmusic@${revision}/docs/${item.path}`;
        await run('curl.exe',['--fail','--location','--retry','2','--connect-timeout','20','--max-time','180','--silent','--show-error','--output',target,source],{timeout:600000});
        const bytes=await readFile(target);
        if(createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Checksum mismatch');
        await writeFile(target,bytes);success=true;break;
      }catch(error){if(attempt===7)throw Error(`${item.path}: ${error.message} ${error.cause?.message||''}`);await new Promise(resolve=>setTimeout(resolve,2000));}
    }
    if(success&&++completed%20===0)console.log(`Downloaded ${completed}/${manifest.length}`);
  }
}));
console.log(`Verified ${completed} frontend files`);
