const puppeteer = require('puppeteer');

async function testLearnMoreButtons() {
    console.log('🔄 Testing Learn More button functionality...');
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 375, height: 812 }); // iPhone X size
        
        console.log('📱 Navigating to localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        // Test Philosophy Value Cards Learn More buttons
        console.log('探 Testing philosophy value card Learn More buttons...');
        
        const philosophyButtons = await page.$$('.mobile-expand-button button');
        console.log(`Found ${philosophyButtons.length} philosophy Learn More buttons`);
        
        if (philosophyButtons.length > 0) {
            // Test first philosophy button
            const firstButton = philosophyButtons[0];
            const buttonText = await firstButton.evaluate(el => el.textContent);
            console.log(`First button text: "${buttonText}"`);
            
            // Click the button
            await firstButton.click();
            await page.waitForTimeout(500);
            
            // Check if button text changed
            const newButtonText = await firstButton.evaluate(el => el.textContent);
            console.log(`Button text after click: "${newButtonText}"`);
            
            if (newButtonText === 'Read Less') {
                console.log('✅ Philosophy Learn More button working - text changed correctly');
            } else {
                console.log('❌ Philosophy Learn More button not working - text did not change');
            }
        }
        
        // Test Journey Benefit Cards Learn More buttons
        console.log('探 Testing journey benefit card Learn More buttons...');
        
        const journeyButtons = await page.$$('.journey-benefit-card button[onclick*="toggleExpand"]');
        console.log(`Found ${journeyButtons.length} journey Learn More buttons`);
        
        if (journeyButtons.length > 0) {
            // Test first journey button
            const firstJourneyButton = journeyButtons[0];
            const buttonText = await firstJourneyButton.evaluate(el => el.textContent);
            console.log(`First journey button text: "${buttonText}"`);
            
            // Click the button
            await firstJourneyButton.click();
            await page.waitForTimeout(500);
            
            // Check if button text changed
            const newButtonText = await firstJourneyButton.evaluate(el => el.textContent);
            console.log(`Journey button text after click: "${newButtonText}"`);
            
            if (newButtonText === 'Read Less') {
                console.log('✅ Journey Learn More button working - text changed correctly');
            } else {
                console.log('❌ Journey Learn More button not working - text did not change');
            }
        }
        
        console.log('✅ Learn More button test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testLearnMoreButtons();