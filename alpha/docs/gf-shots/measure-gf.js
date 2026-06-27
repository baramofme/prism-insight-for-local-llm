const path = require('path');
const fs = require('fs');
const SHOTS_DIR = path.resolve(__dirname);

async function main() {
  const { chromium } = require('/home/baramofme/.nvm/versions/node/v24.15.0/lib/node_modules/playwright');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.google.com/finance/quote/000660:KRX', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.setViewportSize({ width: 1680, height: 900 });
    await page.waitForTimeout(1000);

    // gf-main 영역 DOM 구조 덤프
    const domDump = await page.evaluate(() => {
      function walk(el, depth) {
        if (depth > 8 || !el || el.nodeType !== 1) return '';
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '';
        const txt = (el.textContent || '').trim().slice(0, 50).replace(/\s+/g, ' ');
        const visible = el.getBoundingClientRect().width > 0;
        if (!visible) return '';
        let out = '  '.repeat(depth) + `<${tag}`;
        if (cls) out += ` class="${cls}"`;
        if (txt && el.children.length <= 1) out += `> "${txt}"`;
        else out += '>';
        out += '\n';
        for (const child of el.children) {
          out += walk(child, depth + 1);
        }
        return out;
      }

      // gf-main 영역 우선
      const main = document.querySelector('[data-gf="gf-main"]');
      if (main) return '=== gf-main ===\n' + walk(main, 0);

      // fallback
      const main2 = document.querySelector('main, [role="main"], .tUJHGd');
      if (main2) return '=== main fallback ===\n' + walk(main2, 0);
      return 'No gf-main found';
    });

    // 모든 텍스트 인덱싱 (특정 문구 검색용)
    const textIndex = await page.evaluate(() => {
      const idx = [];
      const all = document.querySelectorAll('h1, h2, h3, h4, span, div, a, p');
      for (const el of all) {
        const t = (el.textContent || '').trim();
        if (t.length > 1 && t.length < 60) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const s = window.getComputedStyle(el);
            idx.push({
              text: t.slice(0, 40),
              tag: el.tagName,
              x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
              fs: s.fontSize, fw: s.fontWeight, color: s.color,
            });
          }
        }
      }
      // y position으로 정렬
      idx.sort((a, b) => a.y - b.y);
      return idx;
    });

    console.log('=== gf-main DOM ===');
    console.log(domDump);
    console.log('\n=== Text Index (top 40) ===');
    console.log(JSON.stringify(textIndex.slice(0, 40), null, 2));
    console.log('\n=== All text items count:', textIndex.length);

    await page.screenshot({ path: path.join(SHOTS_DIR, 'stockheader-1680.png'), type: 'png' });
    console.log('Screenshot saved');

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
