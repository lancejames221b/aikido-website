/**
 * Phase 2: Comprehensive User Experience Analysis Suite
 * Genshinkan Aikido Website - Multi-Device UX Testing
 * Author: Lance James @ Unit 221B
 */

const puppeteer = require('puppeteer');
const AxePuppeteer = require('@axe-core/puppeteer').default;
const fs = require('fs');
const path = require('path');

class UXAnalysisSuite {
    constructor() {
        this.browser = null;
        this.baseUrl = 'http://localhost:3000';
        this.reportDir = './ux-analysis-reports';
        this.screenshotDir = './ux-analysis-screenshots';
        
        // Device viewport configurations
        this.viewports = {
            'iPhone SE': { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
            'iPhone 12': { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
            'iPad': { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
            'Desktop': { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
        };

        this.results = {
            responsiveness: {},
            accessibility: {},
            performance: {},
            userJourney: {},
            summary: []
        };

        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.reportDir, this.screenshotDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async initialize() {
        console.log('🚀 Initializing UX Analysis Suite...');
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });
        console.log('✅ Browser launched successfully');
    }

    async runFullAnalysis() {
        try {
            await this.initialize();
            
            console.log('📱 Starting Phase 2: User Experience Analysis');
            console.log('=' .repeat(60));

            // Run all tests in parallel where possible
            const testPromises = [
                this.runResponsivenessTests(),
                this.runAccessibilityTests(),
                this.runPerformanceTests(),
                this.runUserJourneyTests()
            ];

            await Promise.all(testPromises);
            
            await this.generateComprehensiveReport();
            console.log('✅ Phase 2 Analysis Complete! Check reports directory.');

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async runResponsivenessTests() {
        console.log('\n📱 1. MOBILE RESPONSIVENESS TESTING');
        console.log('-'.repeat(50));

        for (const [deviceName, viewport] of Object.entries(this.viewports)) {
            try {
                console.log(`\n🔍 Testing ${deviceName} (${viewport.width}x${viewport.height})`);
                
                const page = await this.browser.newPage();
                await page.setViewport(viewport);
                
                const startTime = Date.now();
                await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
                const loadTime = Date.now() - startTime;

                // Take initial screenshot
                const screenshotPath = path.join(this.screenshotDir, `${deviceName.replace(/\s+/g, '-')}-homepage.png`);
                await page.screenshot({ path: screenshotPath, fullPage: true });

                // Test navigation functionality
                const navResults = await this.testNavigation(page, deviceName);
                
                // Test text readability and sizing
                const readabilityResults = await this.testReadability(page, deviceName);
                
                // Test touch interactions (for mobile devices)
                const touchResults = viewport.isMobile ? await this.testTouchInteractions(page, deviceName) : { status: 'N/A', note: 'Desktop device' };
                
                // Test image scaling
                const imageResults = await this.testImageScaling(page, deviceName);
                
                // Check for horizontal scrolling
                const scrollResults = await this.testHorizontalScrolling(page, deviceName);
                
                // Test mobile menu (for mobile devices)
                const mobileMenuResults = viewport.isMobile ? await this.testMobileMenu(page, deviceName) : { status: 'N/A', note: 'Desktop device' };

                this.results.responsiveness[deviceName] = {
                    viewport,
                    loadTime,
                    navigation: navResults,
                    readability: readabilityResults,
                    touchInteractions: touchResults,
                    imageScaling: imageResults,
                    horizontalScrolling: scrollResults,
                    mobileMenu: mobileMenuResults,
                    screenshot: screenshotPath
                };

                console.log(`   ✅ ${deviceName} testing complete (${loadTime}ms load time)`);
                await page.close();

            } catch (error) {
                console.error(`   ❌ ${deviceName} testing failed:`, error.message);
                this.results.responsiveness[deviceName] = { error: error.message };
            }
        }
    }

    async testNavigation(page, deviceName) {
        try {
            // Test main navigation links
            const navLinks = await page.$$eval('nav a, .nav-links a', links => 
                links.map(link => ({
                    text: link.textContent.trim(),
                    href: link.href,
                    visible: link.offsetWidth > 0 && link.offsetHeight > 0
                }))
            );

            // Test if navigation is accessible
            const navVisible = await page.$eval('nav, .navigation, .nav-container', nav => 
                nav && nav.offsetWidth > 0 && nav.offsetHeight > 0
            ).catch(() => false);

            return {
                status: navVisible && navLinks.length > 0 ? '✅ PASS' : '❌ FAIL',
                linksFound: navLinks.length,
                linksVisible: navLinks.filter(l => l.visible).length,
                details: navLinks
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testReadability(page, deviceName) {
        try {
            const textMetrics = await page.evaluate(() => {
                const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span');
                const metrics = [];
                
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    
                    if (rect.width > 0 && rect.height > 0) {
                        metrics.push({
                            tagName: el.tagName.toLowerCase(),
                            fontSize: parseFloat(style.fontSize),
                            lineHeight: style.lineHeight,
                            color: style.color,
                            backgroundColor: style.backgroundColor,
                            width: rect.width,
                            text: el.textContent.trim().substring(0, 50)
                        });
                    }
                });
                
                return metrics;
            });

            // Check for minimum font sizes on mobile
            const isMobile = this.viewports[deviceName].isMobile;
            const minFontSize = isMobile ? 16 : 14;
            const smallText = textMetrics.filter(m => m.fontSize < minFontSize);
            
            return {
                status: smallText.length === 0 ? '✅ PASS' : '⚠️ WARNING',
                totalElements: textMetrics.length,
                smallTextCount: smallText.length,
                minFontSize,
                issues: smallText.length > 0 ? `${smallText.length} elements below ${minFontSize}px` : 'None'
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testTouchInteractions(page, deviceName) {
        try {
            const touchTargets = await page.evaluate(() => {
                const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, [onclick], [role="button"]');
                const targets = [];
                
                interactiveElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        targets.push({
                            tagName: el.tagName.toLowerCase(),
                            width: rect.width,
                            height: rect.height,
                            area: rect.width * rect.height,
                            text: el.textContent ? el.textContent.trim().substring(0, 30) : el.type || 'element'
                        });
                    }
                });
                
                return targets;
            });

            // Check for minimum touch target size (44px recommended)
            const minTouchSize = 44;
            const smallTargets = touchTargets.filter(t => t.width < minTouchSize || t.height < minTouchSize);
            
            return {
                status: smallTargets.length === 0 ? '✅ PASS' : '⚠️ WARNING',
                totalTargets: touchTargets.length,
                smallTargetsCount: smallTargets.length,
                minSize: minTouchSize,
                issues: smallTargets.length > 0 ? `${smallTargets.length} targets below ${minTouchSize}px` : 'None'
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testImageScaling(page, deviceName) {
        try {
            const imageMetrics = await page.evaluate(() => {
                const images = document.querySelectorAll('img');
                const metrics = [];
                
                images.forEach(img => {
                    const rect = img.getBoundingClientRect();
                    metrics.push({
                        src: img.src.substring(img.src.lastIndexOf('/') + 1),
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        displayWidth: rect.width,
                        displayHeight: rect.height,
                        aspectRatioMaintained: Math.abs((img.naturalWidth / img.naturalHeight) - (rect.width / rect.height)) < 0.1
                    });
                });
                
                return metrics;
            });

            const aspectRatioIssues = imageMetrics.filter(img => !img.aspectRatioMaintained && img.displayWidth > 0);
            
            return {
                status: aspectRatioIssues.length === 0 ? '✅ PASS' : '⚠️ WARNING',
                totalImages: imageMetrics.length,
                aspectRatioIssues: aspectRatioIssues.length,
                details: aspectRatioIssues.map(img => img.src)
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testHorizontalScrolling(page, deviceName) {
        try {
            const scrollInfo = await page.evaluate(() => {
                return {
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth,
                    hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
                };
            });

            return {
                status: !scrollInfo.hasHorizontalScroll ? '✅ PASS' : '❌ FAIL',
                scrollWidth: scrollInfo.scrollWidth,
                clientWidth: scrollInfo.clientWidth,
                overflow: scrollInfo.scrollWidth - scrollInfo.clientWidth
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testMobileMenu(page, deviceName) {
        try {
            // Look for hamburger menu or mobile navigation toggle
            const mobileMenuTrigger = await page.$('.hamburger, .mobile-menu-toggle, .menu-toggle, .nav-toggle, [data-toggle="menu"]');
            
            if (!mobileMenuTrigger) {
                return { status: '⚠️ WARNING', note: 'No mobile menu trigger found' };
            }

            // Test if mobile menu toggle works
            await mobileMenuTrigger.click();
            await page.waitForTimeout(500); // Wait for animation

            const menuVisible = await page.evaluate(() => {
                const menu = document.querySelector('.mobile-menu, .nav-menu.active, .navigation.active, [data-menu="mobile"].active');
                return menu && menu.offsetWidth > 0 && menu.offsetHeight > 0;
            });

            return {
                status: menuVisible ? '✅ PASS' : '❌ FAIL',
                triggerFound: true,
                menuToggles: menuVisible
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async runAccessibilityTests() {
        console.log('\n♿ 2. CONTENT ACCESSIBILITY DEEP DIVE');
        console.log('-'.repeat(50));

        try {
            const page = await this.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });

            // Run axe-core accessibility audit
            const axeResults = await new AxePuppeteer(page).analyze();
            
            // Test keyboard navigation
            const keyboardResults = await this.testKeyboardAccessibility(page);
            
            // Test heading hierarchy
            const headingResults = await this.testHeadingHierarchy(page);
            
            // Test form accessibility
            const formResults = await this.testFormAccessibility(page);
            
            // Test color contrast
            const contrastResults = await this.testColorContrast(page);

            this.results.accessibility = {
                axeResults: {
                    violations: axeResults.violations.length,
                    passes: axeResults.passes.length,
                    incomplete: axeResults.incomplete.length,
                    inapplicable: axeResults.inapplicable.length,
                    details: axeResults.violations
                },
                keyboardNavigation: keyboardResults,
                headingHierarchy: headingResults,
                formAccessibility: formResults,
                colorContrast: contrastResults
            };

            console.log(`   ✅ Accessibility audit complete (${axeResults.violations.length} violations found)`);
            await page.close();

        } catch (error) {
            console.error('   ❌ Accessibility testing failed:', error.message);
            this.results.accessibility = { error: error.message };
        }
    }

    async testKeyboardAccessibility(page) {
        try {
            // Test tab navigation through focusable elements
            await page.focus('body');
            const focusableElements = [];
            
            for (let i = 0; i < 20; i++) {
                await page.keyboard.press('Tab');
                const activeElement = await page.evaluate(() => {
                    const el = document.activeElement;
                    return {
                        tagName: el.tagName.toLowerCase(),
                        id: el.id,
                        className: el.className,
                        text: el.textContent ? el.textContent.trim().substring(0, 30) : '',
                        tabIndex: el.tabIndex
                    };
                });
                
                if (activeElement.tagName !== 'body') {
                    focusableElements.push(activeElement);
                }
            }

            return {
                status: focusableElements.length > 0 ? '✅ PASS' : '❌ FAIL',
                focusableElementsFound: focusableElements.length,
                elements: focusableElements
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testHeadingHierarchy(page) {
        try {
            const headings = await page.evaluate(() => {
                const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                return Array.from(headingElements).map(h => ({
                    level: parseInt(h.tagName.charAt(1)),
                    text: h.textContent.trim().substring(0, 50),
                    id: h.id
                }));
            });

            // Check for proper hierarchy (should not skip levels)
            let hierarchyIssues = [];
            for (let i = 1; i < headings.length; i++) {
                const current = headings[i];
                const previous = headings[i - 1];
                
                if (current.level > previous.level + 1) {
                    hierarchyIssues.push(`Skipped from h${previous.level} to h${current.level}: "${current.text}"`);
                }
            }

            return {
                status: hierarchyIssues.length === 0 ? '✅ PASS' : '⚠️ WARNING',
                totalHeadings: headings.length,
                h1Count: headings.filter(h => h.level === 1).length,
                hierarchyIssues: hierarchyIssues.length,
                issues: hierarchyIssues
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testFormAccessibility(page) {
        try {
            const formElements = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input, textarea, select');
                return Array.from(inputs).map(input => {
                    const label = document.querySelector(`label[for="${input.id}"]`) || 
                                 input.closest('label');
                    
                    return {
                        type: input.type || input.tagName.toLowerCase(),
                        id: input.id,
                        name: input.name,
                        hasLabel: !!label,
                        labelText: label ? label.textContent.trim() : '',
                        hasAriaLabel: !!input.getAttribute('aria-label'),
                        ariaLabel: input.getAttribute('aria-label'),
                        required: input.required
                    };
                });
            });

            const unlabeledInputs = formElements.filter(input => !input.hasLabel && !input.hasAriaLabel);

            return {
                status: unlabeledInputs.length === 0 ? '✅ PASS' : '❌ FAIL',
                totalFormElements: formElements.length,
                unlabeledInputs: unlabeledInputs.length,
                issues: unlabeledInputs.map(input => `${input.type} (id: ${input.id || 'none'})`)
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testColorContrast(page) {
        try {
            // This is a simplified contrast test - for production, use more sophisticated tools
            const contrastIssues = await page.evaluate(() => {
                const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
                const issues = [];
                
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const backgroundColor = style.backgroundColor;
                    
                    // Basic check for very light text on light backgrounds or very dark on dark
                    if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
                        issues.push({
                            element: el.tagName.toLowerCase(),
                            text: el.textContent.trim().substring(0, 30),
                            issue: 'White text on white background'
                        });
                    }
                });
                
                return issues;
            });

            return {
                status: contrastIssues.length === 0 ? '✅ PASS' : '⚠️ WARNING',
                issuesFound: contrastIssues.length,
                note: 'Basic contrast check - use specialized tools for full WCAG compliance',
                issues: contrastIssues
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async runPerformanceTests() {
        console.log('\n⚡ 3. PERFORMANCE ANALYSIS');
        console.log('-'.repeat(50));

        try {
            const page = await this.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Enable performance monitoring
            await page.setCacheEnabled(false);
            await page.evaluateOnNewDocument(() => {
                window.performance.mark('start');
            });

            const startTime = Date.now();
            await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            
            // Get Core Web Vitals and performance metrics
            const metrics = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const paintEntries = performance.getEntriesByType('paint');
                        const navigationEntries = performance.getEntriesByType('navigation');
                        
                        resolve({
                            fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                            lcp: entries.find(entry => entry.entryType === 'largest-contentful-paint')?.startTime || 0,
                            cls: entries.reduce((sum, entry) => sum + (entry.value || 0), 0),
                            navigationTiming: navigationEntries[0] || {},
                            resourceTiming: performance.getEntriesByType('resource').length
                        });
                    }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
                    
                    // Fallback timeout
                    setTimeout(() => {
                        const paintEntries = performance.getEntriesByType('paint');
                        const navigationEntries = performance.getEntriesByType('navigation');
                        
                        resolve({
                            fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                            lcp: 0,
                            cls: 0,
                            navigationTiming: navigationEntries[0] || {},
                            resourceTiming: performance.getEntriesByType('resource').length
                        });
                    }, 3000);
                });
            });

            // Test on slow 3G simulation
            await page.emulateNetworkConditions({
                offline: false,
                downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
                uploadThroughput: 750 * 1024 / 8, // 750 Kbps
                latency: 40
            });

            const slow3GStartTime = Date.now();
            await page.reload({ waitUntil: 'networkidle0' });
            const slow3GLoadTime = Date.now() - slow3GStartTime;

            this.results.performance = {
                regularConnection: {
                    loadTime: Date.now() - startTime,
                    firstContentfulPaint: Math.round(metrics.fcp),
                    largestContentfulPaint: Math.round(metrics.lcp),
                    cumulativeLayoutShift: metrics.cls.toFixed(3),
                    resourceCount: metrics.resourceTiming
                },
                slow3G: {
                    loadTime: slow3GLoadTime
                },
                coreWebVitals: {
                    fcpGood: metrics.fcp < 1800,
                    lcpGood: metrics.lcp < 2500,
                    clsGood: metrics.cls < 0.1
                }
            };

            console.log(`   ✅ Performance analysis complete`);
            console.log(`      FCP: ${Math.round(metrics.fcp)}ms | LCP: ${Math.round(metrics.lcp)}ms | CLS: ${metrics.cls.toFixed(3)}`);
            
            await page.close();

        } catch (error) {
            console.error('   ❌ Performance testing failed:', error.message);
            this.results.performance = { error: error.message };
        }
    }

    async runUserJourneyTests() {
        console.log('\n👤 4. USER JOURNEY ANALYSIS');
        console.log('-'.repeat(50));

        try {
            const page = await this.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto(this.baseUrl, { waitUntil: 'networkidle0' });

            // Test new student journey
            const newStudentJourney = await this.testNewStudentJourney(page);
            
            // Test information discoverability
            const infoDiscovery = await this.testInformationDiscovery(page);
            
            // Test above-the-fold content
            const aboveFoldContent = await this.testAboveFoldContent(page);
            
            // Test value proposition clarity
            const valueProposition = await this.testValueProposition(page);

            this.results.userJourney = {
                newStudentJourney,
                informationDiscovery: infoDiscovery,
                aboveFoldContent,
                valueProposition
            };

            console.log('   ✅ User journey analysis complete');
            await page.close();

        } catch (error) {
            console.error('   ❌ User journey testing failed:', error.message);
            this.results.userJourney = { error: error.message };
        }
    }

    async testNewStudentJourney(page) {
        const startTime = Date.now();
        
        try {
            // Look for new student/beginner information
            const newStudentInfo = await page.evaluate(() => {
                const keywords = ['new student', 'beginner', 'intro', 'first class', 'trial', 'getting started'];
                const elements = document.querySelectorAll('*');
                const matches = [];
                
                elements.forEach(el => {
                    const text = el.textContent.toLowerCase();
                    keywords.forEach(keyword => {
                        if (text.includes(keyword) && el.offsetWidth > 0) {
                            matches.push({
                                keyword,
                                element: el.tagName.toLowerCase(),
                                text: el.textContent.trim().substring(0, 100),
                                visible: el.offsetHeight > 0
                            });
                        }
                    });
                });
                
                return matches;
            });

            // Look for contact information
            const contactInfo = await page.evaluate(() => {
                const contactKeywords = ['contact', 'phone', 'email', 'address', 'location'];
                const elements = document.querySelectorAll('*');
                const contacts = [];
                
                elements.forEach(el => {
                    const text = el.textContent.toLowerCase();
                    contactKeywords.forEach(keyword => {
                        if (text.includes(keyword) && el.offsetWidth > 0) {
                            contacts.push({
                                keyword,
                                text: el.textContent.trim().substring(0, 50)
                            });
                        }
                    });
                });
                
                return contacts;
            });

            const journeyTime = Date.now() - startTime;

            return {
                status: newStudentInfo.length > 0 && contactInfo.length > 0 ? '✅ PASS' : '⚠️ WARNING',
                journeyTime,
                newStudentInfoFound: newStudentInfo.length,
                contactInfoFound: contactInfo.length,
                newStudentElements: newStudentInfo.slice(0, 3),
                contactElements: contactInfo.slice(0, 3)
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testInformationDiscovery(page) {
        const testStartTime = Date.now();
        
        try {
            const infoCategories = {
                schedule: ['schedule', 'class times', 'hours', 'when'],
                pricing: ['price', 'cost', 'fee', 'tuition', '$'],
                instructor: ['instructor', 'sensei', 'teacher', 'master'],
                contact: ['contact', 'phone', 'email', 'address']
            };

            const discoveryResults = {};

            for (const [category, keywords] of Object.entries(infoCategories)) {
                const startTime = Date.now();
                
                const found = await page.evaluate((keywords) => {
                    const elements = document.querySelectorAll('*');
                    const matches = [];
                    
                    elements.forEach(el => {
                        const text = el.textContent.toLowerCase();
                        const foundKeywords = keywords.filter(keyword => text.includes(keyword));
                        
                        if (foundKeywords.length > 0 && el.offsetWidth > 0) {
                            matches.push({
                                keywords: foundKeywords,
                                text: el.textContent.trim().substring(0, 80),
                                position: el.getBoundingClientRect().top
                            });
                        }
                    });
                    
                    return matches;
                }, keywords);

                const discoveryTime = Date.now() - startTime;
                
                discoveryResults[category] = {
                    found: found.length > 0,
                    discoveryTime,
                    matchCount: found.length,
                    aboveFold: found.filter(match => match.position < 800).length,
                    samples: found.slice(0, 2)
                };
            }

            const totalTime = Date.now() - testStartTime;

            return {
                status: Object.values(discoveryResults).every(result => result.found) ? '✅ PASS' : '⚠️ WARNING',
                totalDiscoveryTime: totalTime,
                categories: discoveryResults
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testAboveFoldContent(page) {
        try {
            const aboveFoldContent = await page.evaluate(() => {
                const foldLine = window.innerHeight;
                const elements = document.querySelectorAll('h1, h2, h3, p, button, a');
                const aboveFold = [];
                
                elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < foldLine && rect.bottom > 0) {
                        aboveFold.push({
                            tagName: el.tagName.toLowerCase(),
                            text: el.textContent.trim().substring(0, 60),
                            position: Math.round(rect.top)
                        });
                    }
                });
                
                return {
                    foldLine,
                    aboveFoldElements: aboveFold,
                    hasH1: aboveFold.some(el => el.tagName === 'h1'),
                    hasCTA: aboveFold.some(el => el.tagName === 'button' || 
                           (el.tagName === 'a' && el.text.toLowerCase().includes('contact')))
                };
            });

            return {
                status: aboveFoldContent.hasH1 && aboveFoldContent.hasCTA ? '✅ PASS' : '⚠️ WARNING',
                foldLine: aboveFoldContent.foldLine,
                elementsAboveFold: aboveFoldContent.aboveFoldElements.length,
                hasHeading: aboveFoldContent.hasH1,
                hasCallToAction: aboveFoldContent.hasCTA,
                content: aboveFoldContent.aboveFoldElements.slice(0, 5)
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testValueProposition(page) {
        try {
            const valueProps = await page.evaluate(() => {
                const valueKeywords = [
                    'aikido', 'martial arts', 'self defense', 'peace', 'harmony',
                    'traditional', 'discipline', 'respect', 'community', 'wellness',
                    'philosophy', 'mind body', 'japanese'
                ];
                
                const elements = document.querySelectorAll('h1, h2, h3, p, .hero *, .intro *');
                const valuePropositions = [];
                
                elements.forEach(el => {
                    const text = el.textContent.toLowerCase();
                    const matchedKeywords = valueKeywords.filter(keyword => text.includes(keyword));
                    
                    if (matchedKeywords.length > 0) {
                        valuePropositions.push({
                            element: el.tagName.toLowerCase(),
                            text: el.textContent.trim().substring(0, 100),
                            keywords: matchedKeywords,
                            position: el.getBoundingClientRect().top
                        });
                    }
                });
                
                return valuePropositions;
            });

            const aboveFoldProps = valueProps.filter(prop => prop.position < 800);

            return {
                status: aboveFoldProps.length > 0 ? '✅ PASS' : '⚠️ WARNING',
                totalValueProps: valueProps.length,
                aboveFoldProps: aboveFoldProps.length,
                keywordMatches: valueProps.reduce((total, prop) => total + prop.keywords.length, 0),
                topPropositions: aboveFoldProps.slice(0, 3)
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async generateComprehensiveReport() {
        console.log('\n📊 GENERATING COMPREHENSIVE REPORT');
        console.log('-'.repeat(50));

        // Generate summary
        this.generateSummary();
        
        // Save detailed JSON report
        const reportPath = path.join(this.reportDir, `ux-analysis-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate human-readable report
        const readableReportPath = path.join(this.reportDir, `ux-analysis-summary-${Date.now()}.md`);
        const readableReport = this.generateReadableReport();
        fs.writeFileSync(readableReportPath, readableReport);

        console.log(`✅ Reports generated:`);
        console.log(`   📄 Detailed: ${reportPath}`);
        console.log(`   📋 Summary: ${readableReportPath}`);
        console.log(`   📸 Screenshots: ${this.screenshotDir}`);
    }

    generateSummary() {
        const summary = [];

        // Responsiveness summary
        const deviceCount = Object.keys(this.results.responsiveness).length;
        const passingDevices = Object.values(this.results.responsiveness)
            .filter(result => !result.error).length;
        
        summary.push({
            category: 'Mobile Responsiveness',
            status: passingDevices === deviceCount ? '✅ PASS' : '⚠️ ISSUES',
            details: `${passingDevices}/${deviceCount} devices passing`
        });

        // Accessibility summary
        if (this.results.accessibility.axeResults) {
            const violations = this.results.accessibility.axeResults.violations;
            summary.push({
                category: 'Accessibility',
                status: violations === 0 ? '✅ PASS' : '❌ ISSUES',
                details: `${violations} accessibility violations found`
            });
        }

        // Performance summary
        if (this.results.performance.coreWebVitals) {
            const vitals = this.results.performance.coreWebVitals;
            const goodVitals = Object.values(vitals).filter(v => v).length;
            summary.push({
                category: 'Performance',
                status: goodVitals === 3 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT',
                details: `${goodVitals}/3 Core Web Vitals in good range`
            });
        }

        // User Journey summary
        if (this.results.userJourney.newStudentJourney) {
            const journey = this.results.userJourney.newStudentJourney;
            summary.push({
                category: 'User Journey',
                status: journey.status,
                details: `New student info found: ${journey.newStudentInfoFound > 0 ? 'Yes' : 'No'}`
            });
        }

        this.results.summary = summary;
        
        console.log('\n📋 ANALYSIS SUMMARY:');
        summary.forEach(item => {
            console.log(`   ${item.status} ${item.category}: ${item.details}`);
        });
    }

    generateReadableReport() {
        const timestamp = new Date().toISOString();
        
        let report = `# Phase 2: User Experience Analysis Report\n`;
        report += `**Genshinkan Aikido Website**\n`;
        report += `Generated: ${timestamp}\n`;
        report += `Author: Lance James @ Unit 221B\n\n`;

        report += `## Executive Summary\n\n`;
        this.results.summary.forEach(item => {
            report += `- **${item.category}**: ${item.status} - ${item.details}\n`;
        });

        report += `\n## 1. Mobile Responsiveness Testing\n\n`;
        Object.entries(this.results.responsiveness).forEach(([device, results]) => {
            if (results.error) {
                report += `### ${device}\n❌ **FAILED**: ${results.error}\n\n`;
                return;
            }

            report += `### ${device} (${results.viewport.width}x${results.viewport.height})\n`;
            report += `- **Load Time**: ${results.loadTime}ms\n`;
            report += `- **Navigation**: ${results.navigation.status}\n`;
            report += `- **Readability**: ${results.readability.status}\n`;
            report += `- **Touch Interactions**: ${results.touchInteractions.status}\n`;
            report += `- **Image Scaling**: ${results.imageScaling.status}\n`;
            report += `- **Horizontal Scrolling**: ${results.horizontalScrolling.status}\n`;
            report += `- **Mobile Menu**: ${results.mobileMenu.status}\n`;
            report += `- **Screenshot**: ${results.screenshot}\n\n`;
        });

        if (this.results.accessibility.axeResults) {
            report += `## 2. Accessibility Analysis\n\n`;
            const axe = this.results.accessibility.axeResults;
            report += `- **Violations**: ${axe.violations} ❌\n`;
            report += `- **Passes**: ${axe.passes} ✅\n`;
            report += `- **Incomplete**: ${axe.incomplete} ⚠️\n`;
            report += `- **Keyboard Navigation**: ${this.results.accessibility.keyboardNavigation.status}\n`;
            report += `- **Heading Hierarchy**: ${this.results.accessibility.headingHierarchy.status}\n`;
            report += `- **Form Accessibility**: ${this.results.accessibility.formAccessibility.status}\n\n`;
        }

        if (this.results.performance.regularConnection) {
            report += `## 3. Performance Analysis\n\n`;
            const perf = this.results.performance.regularConnection;
            report += `### Core Web Vitals\n`;
            report += `- **First Contentful Paint**: ${perf.firstContentfulPaint}ms\n`;
            report += `- **Largest Contentful Paint**: ${perf.largestContentfulPaint}ms\n`;
            report += `- **Cumulative Layout Shift**: ${perf.cumulativeLayoutShift}\n`;
            report += `- **Load Time**: ${perf.loadTime}ms\n`;
            report += `- **Resource Count**: ${perf.resourceCount}\n`;
            report += `- **Slow 3G Load Time**: ${this.results.performance.slow3G.loadTime}ms\n\n`;
        }

        if (this.results.userJourney.newStudentJourney) {
            report += `## 4. User Journey Analysis\n\n`;
            const journey = this.results.userJourney;
            report += `### New Student Journey\n`;
            report += `- **Status**: ${journey.newStudentJourney.status}\n`;
            report += `- **Journey Time**: ${journey.newStudentJourney.journeyTime}ms\n`;
            report += `- **New Student Info Found**: ${journey.newStudentJourney.newStudentInfoFound}\n`;
            report += `- **Contact Info Found**: ${journey.newStudentJourney.contactInfoFound}\n\n`;

            if (journey.aboveFoldContent) {
                report += `### Above-the-Fold Content\n`;
                report += `- **Status**: ${journey.aboveFoldContent.status}\n`;
                report += `- **Elements Above Fold**: ${journey.aboveFoldContent.elementsAboveFold}\n`;
                report += `- **Has Heading**: ${journey.aboveFoldContent.hasHeading ? 'Yes' : 'No'}\n`;
                report += `- **Has Call-to-Action**: ${journey.aboveFoldContent.hasCallToAction ? 'Yes' : 'No'}\n\n`;
            }
        }

        report += `## Recommendations\n\n`;
        report += this.generateRecommendations();

        return report;
    }

    generateRecommendations() {
        let recommendations = '';

        // Mobile responsiveness recommendations
        const failedDevices = Object.entries(this.results.responsiveness)
            .filter(([device, results]) => results.error || 
                    (results.horizontalScrolling && results.horizontalScrolling.status === '❌ FAIL'));
        
        if (failedDevices.length > 0) {
            recommendations += `### High Priority - Mobile Responsiveness\n`;
            recommendations += `- Fix horizontal scrolling issues on ${failedDevices.length} device(s)\n`;
            recommendations += `- Ensure all touch targets are at least 44px in size\n`;
            recommendations += `- Test mobile menu functionality across all devices\n\n`;
        }

        // Accessibility recommendations
        if (this.results.accessibility.axeResults && this.results.accessibility.axeResults.violations > 0) {
            recommendations += `### High Priority - Accessibility\n`;
            recommendations += `- Address ${this.results.accessibility.axeResults.violations} accessibility violations\n`;
            recommendations += `- Ensure all form elements have proper labels\n`;
            recommendations += `- Improve keyboard navigation support\n`;
            recommendations += `- Verify color contrast meets WCAG AA standards\n\n`;
        }

        // Performance recommendations
        if (this.results.performance.coreWebVitals) {
            const vitals = this.results.performance.coreWebVitals;
            if (!vitals.fcpGood || !vitals.lcpGood || !vitals.clsGood) {
                recommendations += `### Medium Priority - Performance\n`;
                if (!vitals.fcpGood) recommendations += `- Optimize First Contentful Paint (target < 1.8s)\n`;
                if (!vitals.lcpGood) recommendations += `- Optimize Largest Contentful Paint (target < 2.5s)\n`;
                if (!vitals.clsGood) recommendations += `- Reduce Cumulative Layout Shift (target < 0.1)\n`;
                recommendations += `- Consider image optimization and lazy loading\n`;
                recommendations += `- Minimize JavaScript and CSS bundle sizes\n\n`;
            }
        }

        // User journey recommendations
        if (this.results.userJourney.newStudentJourney && 
            this.results.userJourney.newStudentJourney.status !== '✅ PASS') {
            recommendations += `### Medium Priority - User Experience\n`;
            recommendations += `- Make new student information more prominent\n`;
            recommendations += `- Ensure contact information is easily discoverable\n`;
            recommendations += `- Add clear call-to-action buttons above the fold\n`;
            recommendations += `- Consider adding a dedicated "New Students" landing page\n\n`;
        }

        return recommendations || `No critical issues identified. Website shows good overall UX performance.\n\n`;
    }
}

// Run the analysis
if (require.main === module) {
    const suite = new UXAnalysisSuite();
    suite.runFullAnalysis().catch(console.error);
}

module.exports = UXAnalysisSuite;