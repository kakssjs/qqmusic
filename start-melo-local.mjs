import { spawn } from 'node:child_process';
import { existsSync, openSync, closeSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = path.dirname(fileURLToPath(import.meta.url));
const project = path.join(workspace, 'melo');
const vite = path.join(project, 'node_modules', 'vite', 'bin', 'vite.js');
const address = 'http://127.0.0.1:4173/qqmusic/';

async function siteIsReady() {
  try {
    const response = await fetch(address, { signal: AbortSignal.timeout(1200) });
    return response.ok && (await response.text()).includes('<title>Melo');
  } catch {
    return false;
  }
}

try {
  if (await siteIsReady()) {
    console.log('Melo 本地网站已在运行。');
    process.exit(0);
  }
  if (!existsSync(vite) || !existsSync(path.join(project, 'dist-pages', 'index.html'))) {
    throw new Error('请先进入 melo 安装依赖，并运行 npx vite build --config vite.pages.config.mjs。');
  }
  const output = openSync(path.join(workspace, 'local-preview.stdout.log'), 'a');
  const errors = openSync(path.join(workspace, 'local-preview.stderr.log'), 'a');
  try {
    const server = spawn(process.execPath, [vite, 'preview', '--config',
      'vite.pages.config.mjs', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      cwd: project,
      detached: true,
      windowsHide: true,
      stdio: ['ignore', output, errors],
    });
    server.on('error', (error) => {
      console.error('启动失败：' + error.message);
      process.exitCode = 1;
    });
    server.unref();
  } finally {
    closeSync(output);
    closeSync(errors);
  }
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await siteIsReady()) {
      console.log('Melo 本地网站已启动：' + address);
      process.exit(0);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('网站未能启动，请查看 local-preview.stderr.log。');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
