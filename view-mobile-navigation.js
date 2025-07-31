const puppeteer = require('puppeteer');

async function viewMobileNavigation() {
    console.log('🚀 Launching browser to view mobile navigation...');
    
    const browser = await puppeteer.launch({
        headless: false, // Show the browser window
        devtools: true, // Open DevTools automatically
        defaultViewport: {
            width: 375,
            height: 812 // iPhone X size
        },
        args: [
            '--window-size=400,900',
            '--window-position=100,50'
        ]
    });

    const page = await browser.newPage();
    
    console.log('📱 Opening page in mobile view...');
    await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
    });

    // Wait a bit for the universal navigation to load
    await page.waitForTimeout(2000);

    console.log('👆 Opening mobile menu...');
    try {
        // Click the mobile menu toggle
        await page.click('.mobile-toggle');
        await page.waitForTimeout(1000);

        console.log('📋 Testing About dropdown...');
        // Click on About dropdown
        await page.evaluate(() => {
            const aboutLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                .find(a => a.textContent.includes('About'));
            if (aboutLink) aboutLink.click();
        });
        await page.waitForTimeout(2000);

        console.log('📋 Testing Training dropdown...');
        // Click on Training dropdown
        await page.evaluate(() => {
            const trainingLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                .find(a => a.textContent.includes('Training'));
            if (trainingLink) trainingLink.click();
        });
        await page.waitForTimeout(2000);

        console.log('📋 Testing Philosophy dropdown...');
        // Click on Philosophy dropdown
        await page.evaluate(() => {
            const philosophyLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                .find(a => a.textContent.includes('Philosophy'));
            if (philosophyLink) philosophyLink.click();
        });
        await page.waitForTimeout(2000);

        console.log('✅ Mobile navigation demonstration complete!');
        console.log('🔍 You can now interact with the browser window.');
        console.log('💡 Press Ctrl+C to close when done.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    // Keep browser open for manual inspection
    await new Promise(() => {});
}

viewMobileNavigation().catch(console.error);