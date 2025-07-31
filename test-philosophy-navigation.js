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
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

// Philosophy pages to test
const philosophyPages = [
    { file: 'what-is-shoshin.html', name: 'Shoshin', label: 'Shoshin' },
    { file: 'adult-beginners-journey.html', name: 'Beginners', label: 'Beginners' },
    { file: 'honor-values.html', name: 'Values', label: 'Values' },
    { file: 'traditional-values.html', name: 'Traditions', label: 'Traditions' },
    { file: 'the-art-of-peace.html', name: 'The Art of Peace', label: 'Art of Peace' },
    { file: 'health-and-safety.html', name: 'Health & Safety', label: 'Health & Safety' }
];

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

async function testPhilosophyNavigation() {
    let browser;
    let testsPassed = 0;
    let testsFailed = 0;

    try {
        log.section('Starting Philosophy Navigation Tests');
        
        // Launch browser
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        
        // Test 1: Test each philosophy page navigation styling
        log.section('Test 1: Philosophy Page Navigation Styling');
        
        for (const pageInfo of philosophyPages) {
            try {
                await page.setViewport(DESKTOP_VIEWPORT);
                await page.goto(`${TEST_URL}/pages/${pageInfo.file}`, { waitUntil: 'networkidle2' });
                
                // Wait for navigation to load
                await page.waitForSelector('.philosophy-subnav', { timeout: 5000 });
                
                // Check if the current page link is styled correctly
                const activeNavStyles = await page.evaluate((label) => {
                    const links = Array.from(document.querySelectorAll('.philosophy-subnav a'));
                    const activeLink = links.find(a => a.textContent.trim() === label);
                    
                    if (!activeLink) return null;
                    
                    const computedStyles = window.getComputedStyle(activeLink);
                    const inlineStyles = activeLink.getAttribute('style');
                    
                    return {
                        label: label,
                        computedColor: computedStyles.color,
                        computedBackground: computedStyles.backgroundColor,
                        computedFontWeight: computedStyles.fontWeight,
                        inlineStyles: inlineStyles,
                        isCorrectColor: computedStyles.color === 'rgb(139, 69, 19)',
                        hasActiveBackground: computedStyles.backgroundColor.includes('139, 69, 19')
                    };
                }, pageInfo.label);
                
                if (!activeNavStyles) {
                    throw new Error(`Navigation link not found for ${pageInfo.label}`);
                }
                
                if (activeNavStyles.isCorrectColor && activeNavStyles.hasActiveBackground) {
                    log.success(`${pageInfo.label} - Active styling correct (brown color & background)`);
                    testsPassed++;
                } else {
                    throw new Error(`Incorrect styling - Color: ${activeNavStyles.computedColor}, Background: ${activeNavStyles.computedBackground}`);
                }
                
            } catch (error) {
                log.error(`${pageInfo.label} page test failed: ${error.message}`);
                testsFailed++;
            }
        }
        
        // Test 2: Mobile Navigation Overlay on Philosophy Pages
        log.section('Test 2: Mobile Navigation Overlay Fix');
        
        await page.setViewport(MOBILE_VIEWPORT);
        
        // Go to a philosophy page
        await page.goto(`${TEST_URL}/pages/the-art-of-peace.html`, { waitUntil: 'networkidle2' });
        
        try {
            // Wait for mobile toggle
            await page.waitForSelector('.mobile-toggle', { timeout: 5000 });
            
            // Get initial philosophy subnav z-index
            const initialZIndex = await page.evaluate(() => {
                const subnav = document.querySelector('.philosophy-subnav');
                return subnav ? window.getComputedStyle(subnav).zIndex : null;
            });
            
            log.info(`Initial philosophy subnav z-index: ${initialZIndex}`);
            
            // Open mobile menu
            await page.click('.mobile-toggle');
            await delay(500);
            
            // Check if philosophy subnav is properly faded
            const menuOpenState = await page.evaluate(() => {
                const subnav = document.querySelector('.philosophy-subnav');
                const mobileNav = document.querySelector('.mobile-nav');
                
                if (!subnav || !mobileNav) return null;
                
                const subnavStyles = window.getComputedStyle(subnav);
                
                return {
                    mobileNavOpen: mobileNav.classList.contains('open'),
                    subnavZIndex: subnavStyles.zIndex,
                    subnavOpacity: subnavStyles.opacity,
                    subnavPointerEvents: subnavStyles.pointerEvents
                };
            });
            
            if (!menuOpenState) throw new Error('Could not get menu state');
            
            if (menuOpenState.mobileNavOpen && 
                menuOpenState.subnavOpacity === '0.3' && 
                menuOpenState.subnavPointerEvents === 'none') {
                log.success('Philosophy subnav properly faded when mobile menu is open');
                testsPassed++;
            } else {
                throw new Error(`Incorrect state - Opacity: ${menuOpenState.subnavOpacity}, Pointer Events: ${menuOpenState.subnavPointerEvents}`);
            }
            
            // Close mobile menu
            await page.click('.mobile-toggle');
            await delay(500);
            
            // Check if philosophy subnav is restored
            const menuClosedState = await page.evaluate(() => {
                const subnav = document.querySelector('.philosophy-subnav');
                if (!subnav) return null;
                
                const subnavStyles = window.getComputedStyle(subnav);
                
                return {
                    subnavOpacity: subnavStyles.opacity,
                    subnavPointerEvents: subnavStyles.pointerEvents
                };
            });
            
            if (menuClosedState.subnavOpacity === '1' && 
                menuClosedState.subnavPointerEvents === 'auto') {
                log.success('Philosophy subnav properly restored when mobile menu closes');
                testsPassed++;
            } else {
                throw new Error(`Subnav not restored - Opacity: ${menuClosedState.subnavOpacity}, Pointer Events: ${menuClosedState.subnavPointerEvents}`);
            }
            
        } catch (error) {
            log.error(`Mobile overlay test failed: ${error.message}`);
            testsFailed++;
        }
        
        // Test 3: Navigation functionality between pages
        log.section('Test 3: Navigation Between Philosophy Pages');
        
        try {
            await page.setViewport(DESKTOP_VIEWPORT);
            await page.goto(`${TEST_URL}/pages/what-is-shoshin.html`, { waitUntil: 'networkidle2' });
            
            // Click on "Art of Peace" link
            await page.click('.philosophy-subnav a[href*="art-of-peace"]');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            
            // Verify we're on the right page and it's styled correctly
            const currentPageCheck = await page.evaluate(() => {
                const url = window.location.pathname;
                const activeLink = document.querySelector('.philosophy-subnav a[style*="rgb(139, 69, 19)"]');
                
                return {
                    isArtOfPeacePage: url.includes('the-art-of-peace.html'),
                    activeText: activeLink ? activeLink.textContent.trim() : null
                };
            });
            
            if (currentPageCheck.isArtOfPeacePage && currentPageCheck.activeText === 'Art of Peace') {
                log.success('Navigation between pages works correctly');
                testsPassed++;
            } else {
                throw new Error('Navigation or active state incorrect after page change');
            }
            
        } catch (error) {
            log.error(`Navigation functionality test failed: ${error.message}`);
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
testPhilosophyNavigation().catch(console.error);