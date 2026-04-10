/**
 * README için screenshots/*.png üretir.
 * Önce: npm install && npx playwright install chromium
 * Çalıştır: npm run screenshots
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'screenshots');

async function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const addr = s.address();
      const p = typeof addr === 'object' && addr ? addr.port : 0;
      s.close(() => resolve(p));
    });
    s.on('error', reject);
  });
}

/** Windows’ta `npm` genelde shell üzerinden çalışmalı (Node 22+ spawn EINVAL). */
const npmShell = process.platform === 'win32';

function runBuild() {
  return new Promise((resolve, reject) => {
    const p = spawn('npm', ['run', 'build'], {
      cwd: root,
      shell: npmShell,
      stdio: 'inherit',
    });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`build exit ${code}`))));
  });
}

function startPreview(port) {
  return spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: root,
    shell: npmShell,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function waitForHttp(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 2500);
      const res = await fetch(url, { signal: ac.signal });
      clearTimeout(t);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not respond: ${url}`);
}

async function seedSampleCv(page, baseUrl) {
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'English' }).click();
  await page.getByLabel('Template').selectOption('developer');
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByText('Alex Morgan').first().waitFor({ state: 'visible', timeout: 15_000 });
  await new Promise((r) => setTimeout(r, 400));
}

mkdirSync(outDir, { recursive: true });

await runBuild();

const port = await getFreePort();
const base = `http://127.0.0.1:${port}`;
const preview = startPreview(port);
preview.stderr?.on('data', (b) => process.stderr.write(b));

try {
  await waitForHttp(base);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });

  // Desktop — genel görünüm
  {
    const page = await context.newPage({ viewport: { width: 1520, height: 920 } });
    await seedSampleCv(page, base);
    await page.locator('.app-shell').screenshot({ path: join(outDir, 'full-overview.png') });
    await page.close();
  }

  // Ayrı paneller (aynı oturumda yeniden yükle — hızlı)
  {
    const page = await context.newPage({ viewport: { width: 1520, height: 920 } });
    await seedSampleCv(page, base);
    await page.locator('.preview-panel').screenshot({ path: join(outDir, 'cv-preview.png') });
    await page.locator('.edit-panel').screenshot({ path: join(outDir, 'edit-form.png') });
    await page.close();
  }

  // Mobil
  {
    const page = await context.newPage({ viewport: { width: 390, height: 844 } });
    await seedSampleCv(page, base);
    await page.locator('.app-shell').screenshot({
      path: join(outDir, 'mobile-view.png'),
      fullPage: true,
    });
    await page.close();
  }

  await browser.close();
  console.log('Wrote:', ['full-overview.png', 'cv-preview.png', 'edit-form.png', 'mobile-view.png'].join(', '));
} finally {
  preview.kill('SIGTERM');
}
