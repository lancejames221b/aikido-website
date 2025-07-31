const puppeteer = require('puppeteer');

// Color codes for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Test configuration
const TEST_URL = 'http://localhost:3000';
const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE size
const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad size
const DESKTOP_VIEWPORT = { width: 1440, height: 900 }; // Desktop size

// Helper functions
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.cyan}${colors.bright}📱 ${msg}${colors.reset}\n`)
};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testMobileNavigationDropdowns() {
    let browser;
    let testsPassed = 0;
    let testsFailed = 0;

    try {
        log.section('Starting Comprehensive Mobile Navigation Dropdown Tests');
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new', // Use new headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        
        // Test 1: Mobile Viewport Navigation Test
        log.section('Test 1: Mobile Viewport Navigation');
        await page.setViewport(MOBILE_VIEWPORT);
        await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
        
        try {
            // Wait for universal navigation to load
            await page.waitForSelector('.universal-header', { timeout: 5000 });
            log.success('Universal navigation loaded successfully');
            
            // Check if mobile toggle is visible
            const mobileToggle = await page.$('.mobile-toggle');
            if (!mobileToggle) throw new Error('Mobile toggle button not found');
            
            const isToggleVisible = await page.evaluate(() => {
                const toggle = document.querySelector('.mobile-toggle');
                return window.getComputedStyle(toggle).display !== 'none';
            });
            
            if (!isToggleVisible) throw new Error('Mobile toggle not visible on mobile viewport');
            log.success('Mobile toggle button is visible');
            
            // Test mobile menu opening
            await mobileToggle.click();
            await delay(500); // Wait for animation
            
            const isMobileNavOpen = await page.evaluate(() => {
                const nav = document.querySelector('.mobile-nav');
                return nav && nav.classList.contains('open');
            });
            
            if (!isMobileNavOpen) throw new Error('Mobile navigation did not open');
            log.success('Mobile navigation menu opened successfully');
            
            testsPassed++;
        } catch (error) {
            log.error(`Mobile viewport test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 2: About Dropdown
        log.section('Test 2: About Dropdown Menu');
        try {
            // Find and click About dropdown
            const aboutDropdown = await page.$('.mobile-dropdown a[href*="about"]');
            if (!aboutDropdown) throw new Error('About dropdown not found');
            
            await aboutDropdown.click();
            await delay(300);
            
            // Check if dropdown opened
            const aboutDropdownOpen = await page.evaluate(() => {
                const aboutLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                    .find(a => a.textContent.includes('About'));
                if (!aboutLink) return false;
                const dropdown = aboutLink.nextElementSibling;
                return dropdown && dropdown.classList.contains('open');
            });
            
            if (!aboutDropdownOpen) throw new Error('About dropdown did not open');
            log.success('About dropdown opened successfully');
            
            // Check dropdown items
            const aboutItems = await page.evaluate(() => {
                const aboutLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                    .find(a => a.textContent.includes('About'));
                const dropdown = aboutLink.nextElementSibling;
                return Array.from(dropdown.querySelectorAll('a')).map(a => a.textContent.trim());
            });
            
            const expectedAboutItems = ['Instructors', 'Aikido World Alliance', 'The Path', 'Who Thrives Here'];
            const hasAllAboutItems = expectedAboutItems.every(item => 
                aboutItems.some(actual => actual.includes(item))
            );
            
            if (!hasAllAboutItems) {
                throw new Error(`Missing About dropdown items. Found: ${aboutItems.join(', ')}`);
            }
            log.success('All About dropdown items present');
            
            testsPassed++;
        } catch (error) {
            log.error(`About dropdown test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 3: Training Dropdown
        log.section('Test 3: Training Dropdown Menu');
        try {
            // First close About dropdown
            const aboutDropdown = await page.$('.mobile-dropdown a[href*="about"]');
            await aboutDropdown.click();
            await delay(300);
            
            // Find and click Training dropdown
            const trainingDropdown = await page.$('.mobile-dropdown a[href*="classes"]');
            if (!trainingDropdown) throw new Error('Training dropdown not found');
            
            await trainingDropdown.click();
            await delay(300);
            
            // Check if dropdown opened
            const trainingDropdownOpen = await page.evaluate(() => {
                const trainingLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                    .find(a => a.textContent.includes('Training'));
                if (!trainingLink) return false;
                const dropdown = trainingLink.nextElementSibling;
                return dropdown && dropdown.classList.contains('open');
            });
            
            if (!trainingDropdownOpen) throw new Error('Training dropdown did not open');
            log.success('Training dropdown opened successfully');
            
            // Check dropdown items
            const trainingItems = await page.evaluate(() => {
                const trainingLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                    .find(a => a.textContent.includes('Training'));
                const dropdown = trainingLink.nextElementSibling;
                return Array.from(dropdown.querySelectorAll('a')).map(a => a.textContent.trim());
            });
            
            const expectedTrainingItems = ['Adult Training', 'Kids Training', 'Training Gallery'];
            const hasAllTrainingItems = expectedTrainingItems.every(item => 
                trainingItems.some(actual => actual.includes(item))
            );
            
            if (!hasAllTrainingItems) {
                throw new Error(`Missing Training dropdown items. Found: ${trainingItems.join(', ')}`);
            }
            log.success('All Training dropdown items present');
            
            testsPassed++;
        } catch (error) {
            log.error(`Training dropdown test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 4: Philosophy Dropdown
        log.section('Test 4: Philosophy Dropdown Menu');
        try {
            // First close Training dropdown
            const trainingDropdown = await page.$('.mobile-dropdown a[href*="classes"]');
            await trainingDropdown.click();
            await delay(300);
            
            // Find and click Philosophy dropdown
            const philosophyDropdown = await page.$('.mobile-dropdown a[href*="philosophy"]');
            if (!philosophyDropdown) throw new Error('Philosophy dropdown not found');
            
            await philosophyDropdown.click();
            await delay(300);
            
            // Check if dropdown opened
            const philosophyDropdownOpen = await page.evaluate(() => {
                const philosophyLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                    .find(a => a.textContent.includes('Philosophy'));
                if (!philosophyLink) return false;
                const dropdown = philosophyLink.nextElementSibling;
                return dropdown && dropdown.classList.contains('open');
            });
            
            if (!philosophyDropdownOpen) throw new Error('Philosophy dropdown did not open');
            log.success('Philosophy dropdown opened successfully');
            
            // Check dropdown items
            const philosophyItems = await page.evaluate(() => {
                const philosophyLink = Array.from(document.querySelectorAll('.mobile-dropdown > a'))
                    .find(a => a.textContent.includes('Philosophy'));
                const dropdown = philosophyLink.nextElementSibling;
                return Array.from(dropdown.querySelectorAll('a')).map(a => a.textContent.trim());
            });
            
            const expectedPhilosophyItems = [
                'What is Shoshin', 
                'The Art of Peace', 
                'Honor & Values', 
                'Traditions', 
                'Health & Safety', 
                'Adult Beginners Journey'
            ];
            const hasAllPhilosophyItems = expectedPhilosophyItems.every(item => 
                philosophyItems.some(actual => actual.includes(item))
            );
            
            if (!hasAllPhilosophyItems) {
                throw new Error(`Missing Philosophy dropdown items. Found: ${philosophyItems.join(', ')}`);
            }
            log.success('All Philosophy dropdown items present');
            
            testsPassed++;
        } catch (error) {
            log.error(`Philosophy dropdown test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 5: Dropdown Visual Indicators
        log.section('Test 5: Dropdown Visual Indicators');
        try {
            // Check if + indicator is present
            const hasIndicators = await page.evaluate(() => {
                const dropdowns = document.querySelectorAll('.mobile-dropdown > a');
                return Array.from(dropdowns).every(link => {
                    const styles = window.getComputedStyle(link, '::after');
                    return styles.content && styles.content !== 'none';
                });
            });
            
            if (!hasIndicators) throw new Error('Dropdown indicators (+) not showing');
            log.success('Dropdown visual indicators are present');
            
            // Check if active class rotates indicator
            const philosophyDropdown = await page.$('.mobile-dropdown a[href*="philosophy"]');
            const hasActiveClass = await page.evaluate(el => el.classList.contains('active'), philosophyDropdown);
            
            if (!hasActiveClass) throw new Error('Active class not applied to open dropdown');
            log.success('Active class properly applied to open dropdowns');
            
            testsPassed++;
        } catch (error) {
            log.error(`Visual indicators test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 6: Accordion Behavior
        log.section('Test 6: Accordion Behavior (Only One Open)');
        try {
            // Open About dropdown
            const aboutDropdown = await page.$('.mobile-dropdown a[href*="about"]');
            await aboutDropdown.click();
            await delay(300);
            
            // Check that Philosophy dropdown closed
            const onlyOneOpen = await page.evaluate(() => {
                const openDropdowns = document.querySelectorAll('.mobile-dropdown-menu.open');
                return openDropdowns.length === 1;
            });
            
            if (!onlyOneOpen) throw new Error('Multiple dropdowns open simultaneously');
            log.success('Accordion behavior working - only one dropdown open at a time');
            
            testsPassed++;
        } catch (error) {
            log.error(`Accordion behavior test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 7: Responsive Behavior
        log.section('Test 7: Responsive Behavior');
        try {
            // Switch to desktop viewport
            await page.setViewport(DESKTOP_VIEWPORT);
            await delay(500);
            
            // Check that mobile nav is hidden
            const mobileNavHidden = await page.evaluate(() => {
                const mobileNav = document.querySelector('.mobile-nav');
                const mobileToggle = document.querySelector('.mobile-toggle');
                return window.getComputedStyle(mobileToggle).display === 'none';
            });
            
            if (!mobileNavHidden) throw new Error('Mobile navigation still visible on desktop');
            log.success('Mobile navigation properly hidden on desktop viewport');
            
            // Switch back to mobile
            await page.setViewport(MOBILE_VIEWPORT);
            await delay(500);
            
            const mobileNavVisible = await page.evaluate(() => {
                const mobileToggle = document.querySelector('.mobile-toggle');
                return window.getComputedStyle(mobileToggle).display !== 'none';
            });
            
            if (!mobileNavVisible) throw new Error('Mobile navigation not visible after switching back to mobile');
            log.success('Mobile navigation properly shown on mobile viewport');
            
            testsPassed++;
        } catch (error) {
            log.error(`Responsive behavior test failed: ${error.message}`);
            testsFailed++;
        }

        // Test 8: Navigation Links
        log.section('Test 8: Testing Navigation Links');
        try {
            // Open mobile menu if not open
            const isOpen = await page.evaluate(() => document.querySelector('.mobile-nav').classList.contains('open'));
            if (!isOpen) {
                await page.click('.mobile-toggle');
                await delay(300);
            }
            
            // Test clicking a dropdown link
            await page.click('.mobile-dropdown a[href*="philosophy"]');
            await delay(300);
            
            // Click on "What is Shoshin" link
            const shoshinLink = await page.$('.mobile-dropdown-menu.open a[href*="what-is-shoshin"]');
            if (!shoshinLink) throw new Error('Shoshin link not found in dropdown');
            
            // Get the href
            const href = await page.evaluate(el => el.getAttribute('href'), shoshinLink);
            log.success(`Found navigation link: ${href}`);
            
            testsPassed++;
        } catch (error) {
            log.error(`Navigation links test failed: ${error.message}`);
            testsFailed++;
        }

        // Test Summary
        log.section('Test Summary');
        const totalTests = testsPassed + testsFailed;
        log.info(`Total tests run: ${totalTests}`);
        log.success(`Tests passed: ${testsPassed}`);
        if (testsFailed > 0) {
            log.error(`Tests failed: ${testsFailed}`);
        }
        
        const successRate = ((testsPassed / totalTests) * 100).toFixed(1);
        if (testsFailed === 0) {
            log.success(`✨ All tests passed! Success rate: ${successRate}%`);
        } else {
            log.warning(`⚠️  Some tests failed. Success rate: ${successRate}%`);
        }

    } catch (error) {
        log.error(`Critical error during testing: ${error.message}`);
        console.error(error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the tests
testMobileNavigationDropdowns().catch(console.error);