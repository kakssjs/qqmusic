import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const directory=path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  root:path.join(directory,'pages'),base:'/qqmusic/',publicDir:path.join(directory,'public'),
  resolve:{alias:{'@':directory}},
  plugins:[{
    name:'melo-pages-adapter',enforce:'pre',
    transform(code,id){
      if (!id.replaceAll('\\','/').includes('/components/melo/') || !/\.tsx?$/.test(id)) return;
      code=code.replace(/(["'])\/(mascot\/[^"']+|hero-clouds\.(?:mp4|jpg)|cloud-ice-scene\.webp)\1/g,(_,quote,asset)=>`${quote}/qqmusic/${asset}${quote}`);
      if(id.endsWith('useLiveMelo.ts')) code=`import {pagesRequest} from '${path.join(directory,'pages/local-api.ts').replaceAll('\\','/')}';\n`+code.replace(/\bfetch\(/g,'pagesRequest(');
      return {code,map:null};
    }
  },react()],
  css:{postcss:directory},build:{outDir:path.join(directory,'dist-pages'),emptyOutDir:true},
});
