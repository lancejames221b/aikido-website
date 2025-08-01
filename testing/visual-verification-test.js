#!/usr/bin/env node

/**
 * Visual Verification Test for Genshinkan Aikido Website
 * Author: Lance James @ Unit 221B
 * 
 * Uses Puppeteer to take screenshots and perform visual verification
 */

const puppeteer = require('puppeteer');  
const fs = require('fs');
const path = require('path');

class VisualVerificationTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.screenshotDir = path.join(__dirname, 'visual-screenshots');
        this.baseUrl = 'http://localhost:3000';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('📸 Initializing Visual Verification Test...\n');
        
        try {
            this.browser = await puppeteer.launch({
                headless: 'new',
                defaultViewport: { width: 1280, height: 800 },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
            
            this.page = await this.browser.newPage();
            console.log('✅ Browser initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize browser:', error.message);
            return false;
        }
    }

    async takeScreenshot(filename, options = {}) {
        try {
            const screenshotPath = path.join(this.screenshotDir, `${filename}-${Date.now()}.png`);
            await this.page.screenshot({ 
                path: screenshotPath, 
                fullPage: true,
                ...options 
            });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.error(`❌ Screenshot failed for ${filename}:`, error.message);
            return null;
        }
    }

    async testHomepageVisual() {
        console.log('🏠 Testing Homepage Visual...');
        
        try {
            const response = await this.page.goto(this.baseUrl, { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });
            
            if (!response || response.status() !== 200) {
                console.log(`❌ Failed to load page: ${response ? response.status() : 'No response'}`);
                return false;
            }
            
            console.log('✅ Page loaded successfully');
            
            // Take full page screenshot
            await this.takeScreenshot('homepage-full-page');
            
            // Take desktop view screenshot
            await this.page.setViewport({ width: 1280, height: 800 });
            await this.takeScreenshot('homepage-desktop');
            
            // Take tablet view screenshot
            await this.page.setViewport({ width: 768, height: 1024 });
            await this.takeScreenshot('homepage-tablet');
            
            // Take mobile view screenshot
            await this.page.setViewport({ width: 375, height: 667 });
            await this.takeScreenshot('homepage-mobile');
            
            return true;
            
        } catch (error) {
            console.error('❌ Homepage visual test failed:', error.message);
            return false;
        }
    }

    async testNavigationInteraction() {
        console.log('🧭 Testing Navigation Interaction...');
        
        try {
            // Reset to desktop view
            await this.page.setViewport({ width: 1280, height: 800 });
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            
            // Test mobile menu if present
            await this.page.setViewport({ width: 375, height: 667 });
            await this.page.reload({ waitUntil: 'networkidle0' });
            
            const hamburger = await this.page.$('.hamburger, .menu-toggle, .mobile-menu-toggle, button[aria-label*="menu"], .nav-toggle');
            
            if (hamburger) {
                console.log('✅ Mobile menu button found');
                await this.takeScreenshot('mobile-menu-closed');
                
                await hamburger.click();
                await this.page.waitForTimeout(500);
                
                await this.takeScreenshot('mobile-menu-opened');
                console.log('✅ Mobile menu interaction captured');
            } else {
                console.log('ℹ️  No mobile menu button found');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Navigation interaction test failed:', error.message);
            return false;
        }
    }

    async testContactFormVisual() {
        console.log('📝 Testing Contact Form Visual...');
        
        try {
            // Reset to desktop view
            await this.page.setViewport({ width: 1280, height: 800 });
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            
            // Scroll to form if it exists
            const form = await this.page.$('form');
            
            if (form) {
                await form.scrollIntoView();
                await this.page.waitForTimeout(500);
                
                await this.takeScreenshot('contact-form-empty');
                
                // Try to fill the form
                const nameField = await this.page.$('input[name*="name"], input[id*="name"], input[placeholder*="name"]');
                const emailField = await this.page.$('input[type="email"], input[name*="email"], input[id*="email"]');
                const messageField = await this.page.$('textarea, input[name*="message"], input[id*="message"]');
                
                if (nameField && emailField && messageField) {
                    await nameField.click();
                    await nameField.type('Test User');
                    
                    await emailField.click();
                    await emailField.type('test@example.com');
                    
                    await messageField.click();
                    await messageField.type('Test inquiry about Aikido classes - this is a comprehensive testing message to verify form functionality.');
                    
                    await this.takeScreenshot('contact-form-filled');
                    console.log('✅ Contact form filled and captured');
                } else {
                    console.log('⚠️  Could not find all form fields for testing');
                }
            } else {
                console.log('⚠️  No contact form found on the page');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Contact form visual test failed:', error.message);
            return false;
        }
    }

    async testPageElements() {
        console.log('🔍 Testing Page Elements...');
        
        try {
            await this.page.setViewport({ width: 1280, height: 800 });
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            
            // Test header section
            const header = await this.page.$('header, .header, nav');
            if (header) {
                await header.scrollIntoView();
                await this.takeScreenshot('header-section');
            }
            
            // Test hero section
            const hero = await this.page.$('.hero, .banner, .main-banner, section:first-of-type');
            if (hero) {
                await hero.scrollIntoView();
                await this.takeScreenshot('hero-section');
            }
            
            // Test instructor section if it exists
            const instructors = await this.page.$('.instructors, .instructor, .team, #instructors');
            if (instructors) {
                await instructors.scrollIntoView();
                await this.takeScreenshot('instructors-section');
            }
            
            // Test footer
            const footer = await this.page.$('footer, .footer');
            if (footer) {
                await footer.scrollIntoView();
                await this.takeScreenshot('footer-section');
            }
            
            console.log('✅ Page elements captured');
            return true;
            
        } catch (error) {
            console.error('❌ Page elements test failed:', error.message);
            return false;
        }
    }

    async runAllTests() {
        const success = await this.initialize();
        if (!success) return;
        
        try {
            const results = {
                homepage: await this.testHomepageVisual(),
                navigation: await this.testNavigationInteraction(),
                contactForm: await this.testContactFormVisual(),
                pageElements: await this.testPageElements()
            };
            
            console.log('\n' + '='.repeat(60));
            console.log('📸 VISUAL VERIFICATION TEST RESULTS');
            console.log('='.repeat(60));
            
            Object.entries(results).forEach(([test, passed]) => {
                const status = passed ? '✅ PASS' : '❌ FAIL';
                console.log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)} Test`);
            });
            
            const totalTests = Object.keys(results).length;
            const passedTests = Object.values(results).filter(Boolean).length;
            
            console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed`);
            console.log(`📁 Screenshots saved to: ${this.screenshotDir}`);
            console.log('='.repeat(60));
            
        } catch (error) {
            console.error('❌ Test suite error:', error);
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('\n🧹 Visual verification test cleanup completed.');
    }
}

// Main execution
async function main() {
    const visualTest = new VisualVerificationTest();
    
    try {
        await visualTest.runAllTests();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await visualTest.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = VisualVerificationTest;