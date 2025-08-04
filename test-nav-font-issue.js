const puppeteer = require('puppeteer');

async function testNavFontIssue() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1200, height: 800 }
    });
    const page = await browser.newPage();

    console.log('Testing navigation font consistency issue...\n');

    // Go to homepage
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#universal-navigation');
    
    // Take screenshot of homepage nav
    console.log('Homepage navigation:');
    await page.screenshot({ 
        path: 'nav-homepage.png',
        clip: { x: 0, y: 0, width: 1200, height: 100 }
    });

    // Get computed styles of nav links on homepage
    const homeNavStyles = await page.evaluate(() => {
        const navLinks = document.querySelectorAll('.nav-links a');
        const styles = [];
        navLinks.forEach(link => {
            const computed = window.getComputedStyle(link);
            styles.push({
                text: link.textContent,
                fontSize: computed.fontSize,
                fontFamily: computed.fontFamily,
                fontWeight: computed.fontWeight,
                color: computed.color
            });
        });
        return styles;
    });

    console.log('Homepage nav link styles:');
    homeNavStyles.forEach(style => {
        console.log(`  ${style.text}: font-size=${style.fontSize}, weight=${style.fontWeight}`);
    });

    // Click on Philosophy dropdown
    console.log('\nClicking Philosophy dropdown...');
    await page.hover('.nav-dropdown:has(a:contains("Philosophy"))');
    await page.waitForTimeout(500);
    
    // Click on a philosophy page
    await page.click('a[href*="what-is-shoshin"]');
    await page.waitForNavigation();
    await page.waitForSelector('#universal-navigation');
    
    // Take screenshot of philosophy page nav
    console.log('\nPhilosophy page navigation:');
    await page.screenshot({ 
        path: 'nav-philosophy.png',
        clip: { x: 0, y: 0, width: 1200, height: 100 }
    });

    // Get computed styles of nav links on philosophy page
    const philosophyNavStyles = await page.evaluate(() => {
        const navLinks = document.querySelectorAll('.nav-links a');
        const styles = [];
        navLinks.forEach(link => {
            const computed = window.getComputedStyle(link);
            styles.push({
                text: link.textContent,
                fontSize: computed.fontSize,
                fontFamily: computed.fontFamily,
                fontWeight: computed.fontWeight,
                color: computed.color
            });
        });
        return styles;
    });

    console.log('Philosophy page nav link styles:');
    philosophyNavStyles.forEach(style => {
        console.log(`  ${style.text}: font-size=${style.fontSize}, weight=${style.fontWeight}`);
    });

    // Compare differences
    console.log('\n=== DIFFERENCES DETECTED ===');
    for (let i = 0; i < Math.min(homeNavStyles.length, philosophyNavStyles.length); i++) {
        const home = homeNavStyles[i];
        const phil = philosophyNavStyles[i];
        if (home.text === phil.text) {
            if (home.fontSize !== phil.fontSize) {
                console.log(`Font size mismatch for "${home.text}": Home=${home.fontSize}, Philosophy=${phil.fontSize}`);
            }
            if (home.fontWeight !== phil.fontWeight) {
                console.log(`Font weight mismatch for "${home.text}": Home=${home.fontWeight}, Philosophy=${phil.fontWeight}`);
            }
            if (home.fontFamily !== phil.fontFamily) {
                console.log(`Font family mismatch for "${home.text}": Home=${home.fontFamily}, Philosophy=${phil.fontFamily}`);
            }
        }
    }

    // Check for subnav existence
    const hasSubnav = await page.$('.philosophy-subnav');
    if (hasSubnav) {
        console.log('\nPhilosophy subnav detected - this may be affecting main nav styling');
        
        const subnavStyles = await page.evaluate(() => {
            const subnav = document.querySelector('.philosophy-subnav');
            if (subnav) {
                const computed = window.getComputedStyle(subnav);
                return {
                    fontSize: computed.fontSize,
                    fontFamily: computed.fontFamily
                };
            }
            return null;
        });
        
        if (subnavStyles) {
            console.log(`Subnav styles: font-size=${subnavStyles.fontSize}, font-family=${subnavStyles.fontFamily}`);
        }
    }

    await browser.close();
    console.log('\nTest complete. Check nav-homepage.png and nav-philosophy.png for visual comparison.');
}

testNavFontIssue().catch(console.error);