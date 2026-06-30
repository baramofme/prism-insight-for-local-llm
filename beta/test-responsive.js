const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1500, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3039/dashboard');
  await page.waitForTimeout(2000);
  
  console.log('\n=== WIDE (1500px) ===');
  const leftPanel = await page.locator('[data-testid="left-sidebar"]').boundingBox();
  const centerPanel = await page.locator('[data-testid="center-content"]').boundingBox();
  const rightPanel = await page.locator('[data-testid="research-panel"]').boundingBox();
  
  console.log('Left:', leftPanel ? `${leftPanel.x}, w=${leftPanel.width}` : 'not found');
  console.log('Center:', centerPanel ? `${centerPanel.x}, w=${centerPanel.width}` : 'not found');
  console.log('Right:', rightPanel ? `${rightPanel.x}, w=${rightPanel.width}` : 'not found');
  
  const wrapper = await page.locator('[data-testid="stock-detail-wrapper"]').boundingBox();
  console.log('Wrapper:', wrapper ? `x=${wrapper.x}, w=${wrapper.width}` : 'not found');
  
  await browser.close();
})();
