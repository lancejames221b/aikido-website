#!/usr/bin/env node

/**
 * Comprehensive Website Testing Suite for Genshinkan Aikido
 * Author: Lance James @ Unit 221B
 * 
 * This suite performs Phase 1 Basic Functionality Testing including:
 * - Homepage Load Test
 * - Navigation Testing  
 * - Contact Form Testing
 * - Basic Accessibility Check
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ComprehensiveWebsiteTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshotDir = path.join(__dirname, 'test-screenshots');
        this.baseUrl = 'http://localhost:3000';
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(this.screenshotDir)) {
            fs.mkdirSync(this.screenshotDir, { recursive: true });
        }
    }

    async initialize() {
        console.log('🚀 Initializing Comprehensive Website Testing Suite...\n');
        
        this.browser = await puppeteer.launch({
            headless: 'new', // Use new headless mode
            defaultViewport: { width: 1280, height: 800 },
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // Set up console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${msg.text()}`);
            }
        });
        
        // Set up request/response monitoring
        this.page.on('requestfailed', request => {
            console.log(`❌ Failed Request: ${request.url()}`);
        });
    }

    async addTestResult(testName, status, findings, errors = [], metrics = {}) {
        const result = {
            testName,
            status,
            findings,
            errors,
            metrics,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        // Log immediately
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${testName}: ${status}`);
        if (findings) console.log(`   Findings: ${findings}`);
        if (errors.length > 0) console.log(`   Errors: ${errors.join(', ')}`);
        if (Object.keys(metrics).length > 0) {
            console.log(`   Metrics: ${JSON.stringify(metrics, null, 2)}`);
        }
        console.log('');
    }

    async takeScreenshot(filename) {
        const screenshotPath = path.join(this.screenshotDir, `${filename}-${Date.now()}.png`);
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        return screenshotPath;
    }

    // PHASE 1 TESTS

    async testHomepageLoad() {
        console.log('🏠 Testing Homepage Load...');
        
        try {
            const startTime = Date.now();
            
            const response = await this.page.goto(this.baseUrl, { 
                waitUntil: 'networkidle0',
                timeout: 30000 
            });
            
            const loadTime = Date.now() - startTime;
            
            // Check response status
            if (!response || response.status() !== 200) {
                await this.addTestResult(
                    'Homepage Load Test',
                    'FAIL',
                    `Server returned status: ${response ? response.status() : 'No response'}`,
                    [`HTTP Status: ${response ? response.status() : 'No response'}`],
                    { loadTime }
                );
                return;
            }

            // Check page title
            const title = await this.page.title();
            const titleValid = title && title.trim().length > 0;

            // Check favicon
            const favicon = await this.page.$('link[rel*="icon"]');
            const faviconValid = favicon !== null;

            // Check CSS loading
            const stylesheets = await this.page.$$('link[rel="stylesheet"]');
            const cssCount = stylesheets.length;

            // Check JS loading
            const scripts = await this.page.$$('script[src]');
            const jsCount = scripts.length;

            // Check for images
            const images = await this.page.$$('img');
            const imageCount = images.length;

            // Check meta description
            const metaDescription = await this.page.$('meta[name="description"]');
            const hasMetaDescription = metaDescription !== null;

            let findings = [];
            let errors = [];
            let status = 'PASS';

            if (!titleValid) {
                errors.push('Page title missing or empty');
                status = 'FAIL';
            } else {
                findings.push(`Page title: "${title}"`);
            }

            if (!faviconValid) {
                errors.push('Favicon not found');
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }

            if (!hasMetaDescription) {
                errors.push('Meta description missing');
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }

            findings.push(`${cssCount} stylesheets loaded`);
            findings.push(`${jsCount} scripts loaded`);
            findings.push(`${imageCount} images found`);

            const metrics = {
                loadTime,
                cssCount,
                jsCount,
                imageCount,
                title,
                hasMetaDescription,
                hasFavicon: faviconValid
            };

            await this.addTestResult(
                'Homepage Load Test',
                status,
                findings.join(', '),
                errors,
                metrics
            );

            // Take screenshot of loaded page
            await this.takeScreenshot('homepage-loaded');

        } catch (error) {
            await this.addTestResult(
                'Homepage Load Test',
                'FAIL',
                'Failed to load homepage',
                [error.message]
            );
        }
    }

    async testNavigation() {
        console.log('🧭 Testing Navigation...');
        
        try {
            // Test main navigation links
            const navLinks = await this.page.$$('nav a, .nav a, header a');
            const linkCount = navLinks.length;
            
            if (linkCount === 0) {
                await this.addTestResult(
                    'Navigation Testing',
                    'FAIL',
                    'No navigation links found',
                    ['No navigation elements detected']
                );
                return;
            }

            let workingLinks = 0;
            let brokenLinks = [];
            let internalLinks = [];
            let externalLinks = [];

            // Test each navigation link
            for (let i = 0; i < Math.min(linkCount, 10); i++) { // Limit to first 10 links
                try {
                    const link = navLinks[i];
                    const href = await link.evaluate(el => el.href);
                    const text = await link.evaluate(el => el.textContent.trim());
                    
                    if (!href || href === '' || href === '#') {
                        continue;
                    }

                    if (href.startsWith('http://localhost:3000') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                        internalLinks.push({ text, href });
                        
                        // Test internal link
                        try {
                            const response = await this.page.goto(href, { waitUntil: 'networkidle0', timeout: 10000 });
                            if (response && response.status() === 200) {
                                workingLinks++;
                            } else {
                                brokenLinks.push({ text, href, status: response ? response.status() : 'No response' });
                            }
                        } catch (linkError) {
                            brokenLinks.push({ text, href, error: linkError.message });
                        }
                    } else {
                        externalLinks.push({ text, href });
                    }
                } catch (linkError) {
                    console.log(`Error testing link ${i}: ${linkError.message}`);
                }
            }

            // Test mobile hamburger menu if present
            let mobileMenuWorking = false;
            try {
                const hamburger = await this.page.$('.hamburger, .menu-toggle, .mobile-menu-toggle, button[aria-label*="menu"]');
                if (hamburger) {
                    await hamburger.click();
                    await this.page.waitForTimeout(500);
                    
                    const mobileMenu = await this.page.$('.mobile-menu, .nav-mobile, .menu-mobile');
                    if (mobileMenu) {
                        const isVisible = await mobileMenu.evaluate(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none' && style.visibility !== 'hidden';
                        });
                        mobileMenuWorking = isVisible;
                    }
                }
            } catch (mobileError) {
                console.log(`Mobile menu test error: ${mobileError.message}`);
            }

            // Return to homepage
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });

            let findings = [];
            let errors = [];
            let status = 'PASS';

            findings.push(`${linkCount} navigation links found`);
            findings.push(`${workingLinks} internal links working`);
            findings.push(`${internalLinks.length} internal links total`);
            findings.push(`${externalLinks.length} external links found`);
            
            if (mobileMenuWorking) {
                findings.push('Mobile hamburger menu functional');
            }

            if (brokenLinks.length > 0) {
                errors.push(`${brokenLinks.length} broken links found`);
                status = 'FAIL';
                brokenLinks.forEach(link => {
                    errors.push(`Broken: "${link.text}" -> ${link.href}`);
                });
            }

            const metrics = {
                totalLinks: linkCount,
                workingLinks,
                brokenLinks: brokenLinks.length,
                internalLinks: internalLinks.length,
                externalLinks: externalLinks.length,
                mobileMenuWorking,
                brokenLinksDetail: brokenLinks
            };

            await this.addTestResult(
                'Navigation Testing',
                status,
                findings.join(', '),
                errors,
                metrics
            );

        } catch (error) {
            await this.addTestResult(
                'Navigation Testing',
                'FAIL',
                'Failed to test navigation',
                [error.message]
            );
        }
    }

    async testContactForm() {
        console.log('📝 Testing Contact Form...');
        
        try {
            // Look for contact forms
            const forms = await this.page.$$('form');
            
            if (forms.length === 0) {
                await this.addTestResult(
                    'Contact Form Testing',
                    'FAIL',
                    'No forms found on the page',
                    ['No <form> elements detected']
                );
                return;
            }

            let contactFormFound = false;
            let formTestResults = [];

            for (let i = 0; i < forms.length; i++) {
                const form = forms[i];
                
                // Check if this looks like a contact form
                const formHTML = await form.evaluate(el => el.outerHTML.toLowerCase());
                const isContactForm = formHTML.includes('contact') || 
                                    formHTML.includes('name') || 
                                    formHTML.includes('email') || 
                                    formHTML.includes('message');

                if (isContactForm) {
                    contactFormFound = true;
                    
                    // Find form fields
                    const nameField = await form.$('input[name*="name"], input[id*="name"], input[placeholder*="name"]');
                    const emailField = await form.$('input[type="email"], input[name*="email"], input[id*="email"]');
                    const messageField = await form.$('textarea, input[name*="message"], input[id*="message"]');
                    const submitButton = await form.$('button[type="submit"], input[type="submit"], button');

                    // Test form validation (empty submission)
                    if (submitButton) {
                        await submitButton.click();
                        await this.page.waitForTimeout(1000);
                        
                        // Check for validation messages
                        const validationMessages = await this.page.$$(':invalid, .error, .validation-error');
                        const hasValidation = validationMessages.length > 0;
                        
                        formTestResults.push({
                            formIndex: i,
                            hasNameField: nameField !== null,
                            hasEmailField: emailField !== null,
                            hasMessageField: messageField !== null,
                            hasSubmitButton: submitButton !== null,
                            hasValidation
                        });

                        // Test form filling and submission
                        if (nameField && emailField && messageField) {
                            await nameField.click();
                            await nameField.type('Test User');
                            
                            await emailField.click();
                            await emailField.type('test@example.com');
                            
                            await messageField.click();
                            await messageField.type('Test inquiry about Aikido classes');
                            
                            // Take screenshot of filled form
                            await this.takeScreenshot('contact-form-filled');
                            
                            // Submit form
                            await submitButton.click();
                            await this.page.waitForTimeout(2000);
                            
                            // Check for success/error messages
                            const successMessage = await this.page.$('.success, .thank-you, .confirmation');
                            const errorMessage = await this.page.$('.error, .failure');
                            
                            formTestResults[formTestResults.length - 1].submissionTest = {
                                hasSuccessMessage: successMessage !== null,
                                hasErrorMessage: errorMessage !== null
                            };
                        }
                    }
                    
                    break; // Test only the first contact form found
                }
            }

            let findings = [];
            let errors = [];
            let status = 'PASS';

            if (!contactFormFound) {
                await this.addTestResult(
                    'Contact Form Testing',
                    'FAIL',
                    'No contact form found',
                    ['No forms with contact-related fields detected']
                );
                return;
            }

            const formResult = formTestResults[0];
            findings.push(`Contact form found (form ${formResult.formIndex})`);
            
            if (formResult.hasNameField) findings.push('Name field present');
            else errors.push('Name field missing');
            
            if (formResult.hasEmailField) findings.push('Email field present');
            else errors.push('Email field missing');
            
            if (formResult.hasMessageField) findings.push('Message field present');
            else errors.push('Message field missing');
            
            if (formResult.hasSubmitButton) findings.push('Submit button present');
            else errors.push('Submit button missing');
            
            if (formResult.hasValidation) findings.push('Form validation working');
            else findings.push('No client-side validation detected');

            if (formResult.submissionTest) {
                if (formResult.submissionTest.hasSuccessMessage) {
                    findings.push('Success message displayed after submission');
                } else if (formResult.submissionTest.hasErrorMessage) {
                    findings.push('Error message displayed after submission');
                } else {
                    findings.push('No clear success/error feedback after submission');
                }
            }

            if (errors.length > 0) {
                status = 'FAIL';
            }

            const metrics = {
                formsFound: forms.length,
                contactFormsFound: 1,
                formDetails: formTestResults
            };

            await this.addTestResult(
                'Contact Form Testing',
                status,
                findings.join(', '),
                errors,
                metrics
            );

        } catch (error) {
            await this.addTestResult(
                'Contact Form Testing',
                'FAIL',
                'Failed to test contact form',
                [error.message]
            );
        }
    }

    async testBasicAccessibility() {
        console.log('♿ Testing Basic Accessibility...');
        
        try {
            // Check images for alt text
            const images = await this.page.$$('img');
            let imagesWithAlt = 0;
            let imagesWithoutAlt = 0;
            let decorativeImages = 0;

            for (const img of images) {
                const alt = await img.evaluate(el => el.alt);
                if (alt === '') {
                    decorativeImages++; // Empty alt is acceptable for decorative images
                } else if (alt && alt.trim().length > 0) {
                    imagesWithAlt++;
                } else {
                    imagesWithoutAlt++;
                }
            }

            // Test keyboard navigation
            let keyboardNavigationWorking = false;
            try {
                // Focus on first focusable element
                await this.page.keyboard.press('Tab');
                const activeElement = await this.page.evaluate(() => document.activeElement.tagName);
                keyboardNavigationWorking = activeElement !== 'BODY';
            } catch (keyboardError) {
                console.log(`Keyboard navigation test error: ${keyboardError.message}`);
            }

            // Check for proper heading structure
            const headings = await this.page.$$('h1, h2, h3, h4, h5, h6');
            const h1Count = await this.page.$$eval('h1', els => els.length);
            
            // Check for form labels
            const inputs = await this.page.$$('input, textarea, select');
            let inputsWithLabels = 0;
            
            for (const input of inputs) {
                const hasLabel = await input.evaluate(el => {
                    const id = el.id;
                    const label = document.querySelector(`label[for="${id}"]`);
                    const ariaLabel = el.getAttribute('aria-label');
                    const ariaLabelledBy = el.getAttribute('aria-labelledby');
                    return label || ariaLabel || ariaLabelledBy;
                });
                
                if (hasLabel) inputsWithLabels++;
            }

            // Check color contrast (basic check for white text on dark backgrounds)
            const contrastIssues = await this.page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                let issues = 0;
                
                for (const el of elements) {
                    const styles = window.getComputedStyle(el);
                    const color = styles.color;
                    const backgroundColor = styles.backgroundColor;
                    
                    // Very basic check - this is not comprehensive!
                    if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
                        issues++;
                    }
                }
                
                return issues;
            });

            let findings = [];
            let errors = [];
            let status = 'PASS';

            findings.push(`${images.length} images total`);
            findings.push(`${imagesWithAlt} images with alt text`);
            findings.push(`${decorativeImages} images with empty alt (decorative)`);
            
            if (imagesWithoutAlt > 0) {
                errors.push(`${imagesWithoutAlt} images missing alt text`);
                status = 'FAIL';
            }

            if (keyboardNavigationWorking) {
                findings.push('Keyboard navigation functional');
            } else {
                errors.push('Keyboard navigation not working');
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }

            findings.push(`${headings.length} heading elements found`);
            
            if (h1Count === 1) {
                findings.push('Proper H1 structure (1 H1 found)');
            } else if (h1Count === 0) {
                errors.push('No H1 heading found');
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            } else {
                errors.push(`Multiple H1 headings found (${h1Count})`);
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }

            findings.push(`${inputs.length} form inputs found`);
            findings.push(`${inputsWithLabels} inputs with proper labels`);
            
            if (inputs.length > 0 && inputsWithLabels < inputs.length) {
                errors.push(`${inputs.length - inputsWithLabels} inputs missing labels`);
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }

            const metrics = {
                totalImages: images.length,
                imagesWithAlt,
                imagesWithoutAlt,
                decorativeImages,
                keyboardNavigationWorking,
                totalHeadings: headings.length,
                h1Count,
                totalInputs: inputs.length,
                inputsWithLabels,
                contrastIssues
            };

            await this.addTestResult(
                'Basic Accessibility Check',
                status,
                findings.join(', '),
                errors,
                metrics
            );

        } catch (error) {
            await this.addTestResult(
                'Basic Accessibility Check',
                'FAIL',
                'Failed to test accessibility',
                [error.message]
            );
        }
    }

    async runAllTests() {
        try {
            await this.testHomepageLoad();
            await this.testNavigation();
            await this.testContactForm();
            await this.testBasicAccessibility();
        } catch (error) {
            console.error('Test suite error:', error);
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 COMPREHENSIVE WEBSITE TESTING REPORT');
        console.log('='.repeat(80));
        
        let totalTests = this.testResults.length;
        let passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        let failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        let warningTests = this.testResults.filter(r => r.status === 'WARNING').length;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`⚠️  Warnings: ${warningTests}`);
        console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
        
        console.log(`\n📋 DETAILED RESULTS:`);
        this.testResults.forEach(result => {
            const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`\n${statusIcon} ${result.testName}: ${result.status}`);
            console.log(`   Findings: ${result.findings}`);
            if (result.errors.length > 0) {
                console.log(`   Errors: ${result.errors.join(', ')}`);
            }
            if (Object.keys(result.metrics).length > 0) {
                console.log(`   Key Metrics: Load Time: ${result.metrics.loadTime || 'N/A'}ms, Elements: Various`);
            }
        });

        // Critical Issues Summary
        const criticalIssues = this.testResults
            .filter(r => r.status === 'FAIL')
            .map(r => `${r.testName}: ${r.errors.join(', ')}`);
            
        if (criticalIssues.length > 0) {
            console.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`);
            criticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }

        console.log('\n' + '='.repeat(80));
        
        // Save detailed report to file
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests,
                warningTests,
                successRate: ((passedTests / totalTests) * 100).toFixed(1)
            },
            results: this.testResults,
            criticalIssues
        };
        
        const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
        console.log('\n🧹 Test suite cleanup completed.');
    }
}

// Main execution
async function main() {
    const testSuite = new ComprehensiveWebsiteTestSuite();
    
    try {
        await testSuite.initialize();
        await testSuite.runAllTests();
        testSuite.generateReport();
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await testSuite.cleanup();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ComprehensiveWebsiteTestSuite;