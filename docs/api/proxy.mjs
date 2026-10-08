// Same-origin transport to the existing Melo backend. No model credentials in this project.
const allowed=new Set(['session','chat','emotion','story','health']);
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const route=String(req.query.route||'');if(!allowed.has(route)||!['GET','POST','DELETE'].includes(req.method)){res.status(404).json({error:'接口不存在。'});return;}
 const headers={'Content-Type':'application/json'};const token=req.headers['x-melo-session'];if(typeof token==='string'&&/^[a-f0-9]{64}$/.test(token))headers['X-Melo-Session']=token;
 const body=req.method==='POST'?JSON.stringify(req.body||{}):undefined;if(body&&body.length>12000){res.status(413).json({error:'输入太长。'});return;}
 try{const r=await fetch('https://123.56.102.46/api/'+route,{method:req.method,headers,body,signal:AbortSignal.timeout(28000)});const data=await r.json();res.status(r.status).json(data);}
 catch{res.status(503).json({error:'Melo 暂时连不上云端，输入仍然保留。可以重试，或进入预设演示。'});}
}
