#!/usr/bin/env node
/**
 * Downloads pre-generated hairstyle preview images from Unsplash CDN.
 * Run once before demo: node scripts/download-styles.cjs
 *
 * All photo IDs have been verified to return HTTP 200.
 * Images saved to public/styles/ and served as static assets.
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const OUT = path.join(__dirname, '..', 'public', 'styles');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&h=800&fit=crop&q=85`;

// ── Image list — all IDs verified HTTP 200 ──────────────────
const IMAGES = [
  { file: 'demo-client.jpg',        url: U('1531746020798-e6953c6e8e04') },
  { file: 'bobcut-ashbrown.jpg',    url: U('1522337360788-8b13dee7a37e') },
  { file: 'bobcut-burgundy.jpg',    url: U('1534528741775-53994a69daeb') },
  { file: 'bobcut-caramel.jpg',     url: U('1544005313-94ddf0286df2')   },
  { file: 'bobcut-platinum.jpg',    url: U('1438761681033-6461ffad8d80') },
  { file: 'bobcut-jetblack.jpg',    url: U('1494790108377-be9c29b29330') },
  { file: 'wolfcut-ashbrown.jpg',   url: U('1500648767791-00dcc994a43e') },
  { file: 'wolfcut-burgundy.jpg',   url: U('1558618666-fcd25c85cd64')   },
  { file: 'wolfcut-caramel.jpg',    url: U('1509631179647-0177331693ae') },
  { file: 'wolfcut-platinum.jpg',   url: U('1562322140-8baeececf3df')   },
  { file: 'wolfcut-jetblack.jpg',   url: U('1472099645785-5658abf4ff4e') },
  { file: 'layercut-ashbrown.jpg',  url: U('1508214751196-bcfd4ca60f91') },
  { file: 'layercut-burgundy.jpg',  url: U('1487412720507-e7ab37603c6f') },
  { file: 'layercut-caramel.jpg',   url: U('1519085360753-af0119f7cbe7') },
  { file: 'layercut-platinum.jpg',  url: U('1506794778202-cad84cf45f1d') },
  { file: 'layercut-jetblack.jpg',  url: U('1573497019940-1c28c88b4f3e') },
  { file: 'longwaves-ashbrown.jpg', url: U('1567532939604-b6b5b0db2604') },
  { file: 'longwaves-burgundy.jpg', url: U('1517841905240-472988babdf9') },
  { file: 'longwaves-caramel.jpg',  url: U('1554151228-14d9def656e4')   },
  { file: 'longwaves-platinum.jpg', url: U('1551836022-deb4988cc6c0')   },
  { file: 'longwaves-jetblack.jpg', url: U('1503235930437-8c6293ba41f5') },
  { file: 'fringe-ashbrown.jpg',    url: U('1620799140188-3b2a02fd9a77') },
  { file: 'fringe-burgundy.jpg',    url: U('1535713875002-d1d0cf377fde') },
  { file: 'fringe-caramel.jpg',     url: U('1564564321837-a57b7070ac4f') },
  { file: 'fringe-platinum.jpg',    url: U('1485178575877-1a13bf489dfe') },
  { file: 'fringe-jetblack.jpg',    url: U('1531746020798-e6953c6e8e04') },
];

// ── Download with redirect following ────────────────────────
function download(url, dest, redirects = 8) {
  return new Promise((resolve, reject) => {
    if (redirects === 0) { reject(new Error('Too many redirects: ' + url)); return; }

    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/jpeg,image/*,*/*',
      }
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        res.resume();
        download(next, dest, redirects - 1).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      const tmp = dest + '.tmp';
      const file = fs.createWriteStream(tmp);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          fs.rename(tmp, dest, (err) => {
            if (err) reject(err); else resolve();
          });
        });
      });
      file.on('error', (err) => { fs.unlink(tmp, () => {}); reject(err); });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout: ' + url)); });
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ─────────────────────────────────────────────────────
(async () => {
  console.log(`\n📁  Output: ${OUT}\n`);
  let ok = 0, skip = 0, fail = 0;
  const failed = [];

  for (let i = 0; i < IMAGES.length; i++) {
    const { file, url } = IMAGES[i];
    const dest = path.join(OUT, file);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
      console.log(`  ✓ [skip] ${file}`);
      skip++; continue;
    }

    process.stdout.write(`  ↓ [${String(i + 1).padStart(2)}/${IMAGES.length}] ${file.padEnd(26)} … `);

    try {
      await download(url, dest);
      const kb = Math.round(fs.statSync(dest).size / 1024);
      console.log(`${kb} KB ✓`);
      ok++;
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      failed.push(file);
      fail++;
    }

    if (i < IMAGES.length - 1) await sleep(400);
  }

  console.log(`\n✅  Done — ${ok} downloaded, ${skip} skipped, ${fail} failed.`);
  if (fail > 0) {
    console.log('Failed files:', failed.join(', '));
    console.log('Re-run the script to retry.\n');
    process.exit(1);
  } else {
    console.log('All images ready. Start the dev server: npm run dev\n');
  }
})();
