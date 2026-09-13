import * as cheerio from 'cheerio';

async function inspect() {
  const res = await fetch('https://bigosoft.us', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  console.log('=== HEADER STRUCTURE ===');
  $('header a, nav a').each((i, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    const href = $(el).attr('href');
    const parentClass = $(el).parent().attr('class') || '';
    console.log(`${i}: "${text}" -> href: ${href} (parent: ${parentClass.slice(0, 40)})`);
  });

  console.log('\n=== PROOF ASSETS (PARTNERS, LOGOS, PORTFOLIO) ===');
  let proofCount = 0;
  $('img, svg, video').each((i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    const cls = $(el).attr('class') || '';
    const parent = $(el).closest('[id*="partner" i], [id*="client" i], [id*="portfolio" i], [class*="partner" i], [class*="portfolio" i], [class*="client" i], [class*="logo" i]');
    
    const isProof = 
      /partner|client|portfolio|brand|customer|trusted|sponsor/i.test(src) ||
      /partner|client|portfolio|brand|customer|trusted|sponsor/i.test(alt) ||
      parent.length > 0;

    if (isProof) {
      proofCount++;
      if (proofCount <= 10) {
        console.log(`Proof item #${proofCount}: tag: ${el.tagName}, alt: "${alt}", src: ${src.slice(0, 50)}`);
      }
    }
  });
  console.log(`Total verified proof items: ${proofCount}`);

  console.log('\n=== VIDEO / SHOWREEL DETECTION ===');
  const hasVideo = $('video').length > 0 || $('iframe[src*="youtube" i], iframe[src*="vimeo" i]').length > 0;
  console.log('Has video/showreel:', hasVideo, '(video count:', $('video').length, ')');
}

inspect();
