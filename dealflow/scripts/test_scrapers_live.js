async function testLiveScraping() {
  console.log('=== TESTING LIVE MERCHANT STORE SCRAPERS ===');

  const testUrls = [
    { store: 'Flipkart', url: 'https://www.flipkart.com/boat-10000-mah-22-5-w-slim-pocket-size-power-bank/p/itm1c8172901c22d' },
    { store: 'Amazon', url: 'https://www.amazon.in/dp/B0CX249CZX' },
    { store: 'AJIO', url: 'https://www.ajio.com/s/70-to-100-percent-off-4891-62871' }
  ];

  for (const item of testUrls) {
    const t0 = Date.now();
    try {
      const res = await fetch('https://api.rudranil.me/api/v1/deals/quick-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url })
      });
      const dur = Date.now() - t0;
      const data = await res.json();
      console.log(`\n[${res.status === 200 ? 'PASS' : 'FAIL'}] ${item.store} Scrape (${dur}ms):`);
      console.log(`  Title:        ${data.prod_name || 'N/A'}`);
      console.log(`  Sale Price:   ₹${data.price}`);
      console.log(`  MRP:          ₹${data.mrp}`);
      console.log(`  Discount:     ${data.discount}% off`);
      console.log(`  Image:        ${data.img_url ? (data.img_url.slice(0, 60) + '...') : 'None'}`);
      console.log(`  Affiliate:    ${data.aff_url ? (data.aff_url.slice(0, 60) + '...') : 'None'}`);
    } catch (e) {
      console.log(`[FAIL] ${item.store} error: ${e.message}`);
    }
  }
}

testLiveScraping();
