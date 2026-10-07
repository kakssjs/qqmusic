// GitHub Pages has no server runtime. Keep local records real and never fake AI.
const key = 'melo-github-pages-v1';
type Event = {id:string;type:string;payload:Record<string,unknown>;createdAt:string};
function read(): Event[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('浏览器中的记忆格式无效。');
  return data;
}
export async function pagesRequest(url: string, options: RequestInit = {}) {
  try {
    if (url !== '/api/session') return Response.json({error:'GitHub Pages 不提供 AI 服务。请通过页面底部「AI 完整在线版」使用聊天与 AI 分析。'}, {status:503});
    const method = options.method || 'GET';
    if (method === 'DELETE') {localStorage.removeItem(key); return Response.json({ok:true});}
    if (method === 'POST') {
      const input = JSON.parse(String(options.body));
      const event: Event = {id:input.id || crypto.randomUUID(),type:input.type,payload:input.payload,createdAt:new Date().toISOString()};
      const events = [event,...read().filter(item=>item.id!==event.id)];
      localStorage.setItem(key,JSON.stringify(events));
      return Response.json({event});
    }
    return Response.json({events:read(),aiConnected:false});
  } catch {return Response.json({error:'无法读写浏览器记忆，请检查浏览器存储权限。'},{status:500});}
}
