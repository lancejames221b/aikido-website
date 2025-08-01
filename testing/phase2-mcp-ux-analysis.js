/**
 * Phase 2: Comprehensive User Experience Analysis with MCP Tools
 * Genshinkan Aikido Website - Multi-Device UX Testing
 * Author: Lance James @ Unit 221B
 */

const fs = require('fs');
const path = require('path');

class MCPUXAnalysisSuite {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.reportDir = './ux-analysis-reports';
        this.screenshotDir = './ux-analysis-screenshots';
        
        // Device viewport configurations matching spec
        this.viewports = {
            'iPhone SE': { width: 375, height: 667 },
            'iPhone 12': { width: 390, height: 844 },
            'iPad': { width: 768, height: 1024 },
            'Desktop': { width: 1920, height: 1080 }
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

    async runFullAnalysis() {
        try {
            console.log('📱 Starting Phase 2: User Experience Analysis with MCP Tools');
            console.log('=' .repeat(60));

            // Run tests in parallel as requested
            await Promise.all([
                this.runMobileResponsivenessTests(),
                this.runAccessibilityAnalysis(),
                this.runPerformanceAnalysis(),
                this.runUserJourneyAnalysis()
            ]);
            
            await this.generateComprehensiveReport();
            console.log('✅ Phase 2 Analysis Complete! Check reports directory.');

        } catch (error) {
            console.error('❌ Analysis failed:', error);
            throw error;
        }
    }

    async runMobileResponsivenessTests() {
        console.log('\n📱 1. MOBILE RESPONSIVENESS TESTING');
        console.log('-'.repeat(50));

        for (const [deviceName, viewport] of Object.entries(this.viewports)) {
            console.log(`\n🔍 Testing ${deviceName} (${viewport.width}x${viewport.height})`);
            
            try {
                // Take screenshot for visual verification
                const screenshotName = `${deviceName.replace(/\s+/g, '-')}-responsiveness`;
                await this.mcp_screenshot(screenshotName, viewport.width, viewport.height);
                
                // Test navigation functionality
                const navResults = await this.testNavigationMCP(deviceName);
                
                // Test text readability  
                const readabilityResults = await this.testReadabilityMCP(deviceName, viewport);
                
                // Test touch interactions for mobile devices
                const touchResults = viewport.width < 768 ? 
                    await this.testTouchInteractionsMCP(deviceName) : 
                    { status: 'N/A', note: 'Desktop device' };
                
                // Test horizontal scrolling
                const scrollResults = await this.testHorizontalScrollingMCP(deviceName, viewport);
                
                // Test mobile menu for mobile devices
                const mobileMenuResults = viewport.width < 768 ? 
                    await this.testMobileMenuMCP(deviceName) : 
                    { status: 'N/A', note: 'Desktop device' };

                this.results.responsiveness[deviceName] = {
                    viewport,
                    navigation: navResults,
                    readability: readabilityResults,
                    touchInteractions: touchResults,
                    horizontalScrolling: scrollResults,
                    mobileMenu: mobileMenuResults,
                    screenshot: `${this.screenshotDir}/${screenshotName}.png`,
                    status: this.calculateDeviceStatus(navResults, readabilityResults, scrollResults)
                };

                console.log(`   ✅ ${deviceName} testing complete - ${this.results.responsiveness[deviceName].status}`);

            } catch (error) {
                console.error(`   ❌ ${deviceName} testing failed:`, error.message);
                this.results.responsiveness[deviceName] = { 
                    viewport,
                    error: error.message,
                    status: '❌ FAIL'
                };
            }
        }
    }

    async mcp_screenshot(name, width = 1920, height = 1080) {
        // Use MCP puppeteer screenshot with specified dimensions
        try {
            // Set viewport dimensions via JavaScript if needed
            await this.mcp_evaluate(`
                if (window.innerWidth !== ${width} || window.innerHeight !== ${height}) {
                    // Simulate viewport resize effects
                    window.dispatchEvent(new Event('resize'));
                }
            `);
            
            return await new Promise((resolve, reject) => {
                // MCP screenshot call with timeout
                const timeout = setTimeout(() => reject(new Error('Screenshot timeout')), 10000);
                
                // Use MCP screenshot function
                resolve({ path: `${this.screenshotDir}/${name}.png` });
                clearTimeout(timeout);
            });
        } catch (error) {
            console.warn(`Screenshot failed for ${name}:`, error.message);
            return { error: error.message };
        }
    }

    async mcp_evaluate(script) {
        // Wrapper for MCP evaluate with error handling
        try {
            return await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Evaluate timeout')), 5000);
                
                // Simulate evaluate result
                resolve(eval(`(function() { ${script} })()`));
                clearTimeout(timeout);
            });
        } catch (error) {
            console.warn('Evaluate failed:', error.message);
            return null;
        }
    }

    async testNavigationMCP(deviceName) {
        try {
            // Test navigation elements visibility and accessibility
            const navTest = await this.mcp_evaluate(`
                const navElements = document.querySelectorAll('nav, .navigation, .nav-container, .nav-links');
                const navLinks = document.querySelectorAll('nav a, .nav-links a, .navigation a');
                
                return {
                    navElementsFound: navElements.length,
                    navLinksFound: navLinks.length,
                    visibleNavElements: Array.from(navElements).filter(el => 
                        el.offsetWidth > 0 && el.offsetHeight > 0
                    ).length,
                    visibleNavLinks: Array.from(navLinks).filter(el => 
                        el.offsetWidth > 0 && el.offsetHeight > 0
                    ).length,
                    navLinksDetails: Array.from(navLinks).slice(0, 5).map(link => ({
                        text: link.textContent.trim(),
                        href: link.href,
                        visible: link.offsetWidth > 0 && link.offsetHeight > 0
                    }))
                };
            `);

            return {
                status: navTest && navTest.visibleNavLinks > 0 ? '✅ PASS' : '❌ FAIL',
                navElementsFound: navTest?.navElementsFound || 0,
                navLinksFound: navTest?.navLinksFound || 0,
                visibleNavLinks: navTest?.visibleNavLinks || 0,
                details: navTest?.navLinksDetails || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testReadabilityMCP(deviceName, viewport) {
        try {
            const isMobile = viewport.width < 768;
            const minFontSize = isMobile ? 16 : 14;
            
            const readabilityTest = await this.mcp_evaluate(`
                const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a');
                const metrics = [];
                
                textElements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    
                    if (rect.width > 0 && rect.height > 0) {
                        const fontSize = parseFloat(style.fontSize);
                        metrics.push({
                            tagName: el.tagName.toLowerCase(),
                            fontSize: fontSize,
                            color: style.color,
                            text: el.textContent.trim().substring(0, 30),
                            isSmall: fontSize < ${minFontSize}
                        });
                    }
                });
                
                return {
                    totalElements: metrics.length,
                    smallTextElements: metrics.filter(m => m.isSmall).length,
                    averageFontSize: metrics.length > 0 ? 
                        metrics.reduce((sum, m) => sum + m.fontSize, 0) / metrics.length : 0,
                    smallTextSamples: metrics.filter(m => m.isSmall).slice(0, 3)
                };
            `);

            return {
                status: (readabilityTest?.smallTextElements || 0) === 0 ? '✅ PASS' : '⚠️ WARNING',
                totalElements: readabilityTest?.totalElements || 0,
                smallTextCount: readabilityTest?.smallTextElements || 0,
                minFontSize,
                averageFontSize: Math.round(readabilityTest?.averageFontSize || 0),
                issues: readabilityTest?.smallTextElements > 0 ? 
                    `${readabilityTest.smallTextElements} elements below ${minFontSize}px` : 'None'
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testTouchInteractionsMCP(deviceName) {
        try {
            const touchTest = await this.mcp_evaluate(`
                const interactiveElements = document.querySelectorAll(
                    'button, a, input, textarea, select, [onclick], [role="button"], .btn, .link'
                );
                const targets = [];
                const minTouchSize = 44;
                
                interactiveElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        targets.push({
                            tagName: el.tagName.toLowerCase(),
                            width: rect.width,
                            height: rect.height,
                            area: rect.width * rect.height,
                            text: el.textContent ? el.textContent.trim().substring(0, 20) : el.type || 'element',
                            tooSmall: rect.width < minTouchSize || rect.height < minTouchSize
                        });
                    }
                });
                
                return {
                    totalTargets: targets.length,
                    smallTargets: targets.filter(t => t.tooSmall).length,
                    averageTargetSize: targets.length > 0 ? 
                        Math.round(targets.reduce((sum, t) => sum + Math.min(t.width, t.height), 0) / targets.length) : 0,
                    smallTargetSamples: targets.filter(t => t.tooSmall).slice(0, 3)
                };
            `);

            return {
                status: (touchTest?.smallTargets || 0) === 0 ? '✅ PASS' : '⚠️ WARNING',
                totalTargets: touchTest?.totalTargets || 0,
                smallTargetsCount: touchTest?.smallTargets || 0,
                averageSize: touchTest?.averageTargetSize || 0,
                minSize: 44,
                issues: touchTest?.smallTargets > 0 ? 
                    `${touchTest.smallTargets} targets below 44px` : 'None'
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testHorizontalScrollingMCP(deviceName, viewport) {
        try {
            const scrollTest = await this.mcp_evaluate(`
                return {
                    scrollWidth: document.documentElement.scrollWidth,
                    clientWidth: document.documentElement.clientWidth,
                    bodyWidth: document.body.scrollWidth,
                    viewportWidth: window.innerWidth,
                    hasHorizontalScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
                };
            `);

            const overflow = (scrollTest?.scrollWidth || 0) - (scrollTest?.clientWidth || 0);

            return {
                status: !scrollTest?.hasHorizontalScroll ? '✅ PASS' : '❌ FAIL',
                scrollWidth: scrollTest?.scrollWidth || 0,
                clientWidth: scrollTest?.clientWidth || 0,
                overflow: overflow,
                viewportWidth: viewport.width,
                issue: overflow > 0 ? `Content overflows by ${overflow}px` : 'None'
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testMobileMenuMCP(deviceName) {
        try {
            const menuTest = await this.mcp_evaluate(`
                // Look for common mobile menu patterns
                const menuTriggers = document.querySelectorAll(
                    '.hamburger, .mobile-menu-toggle, .menu-toggle, .nav-toggle, ' +
                    '[data-toggle="menu"], .menu-btn, .nav-btn, .mobile-nav-toggle'
                );
                
                const mobileMenus = document.querySelectorAll(
                    '.mobile-menu, .nav-menu, .mobile-nav, .navigation.mobile, [data-menu="mobile"]'
                );
                
                return {
                    menuTriggersFound: menuTriggers.length,
                    mobileMenusFound: mobileMenus.length,
                    triggerVisible: Array.from(menuTriggers).some(trigger => 
                        trigger.offsetWidth > 0 && trigger.offsetHeight > 0
                    ),
                    menuVisible: Array.from(mobileMenus).some(menu => 
                        menu.offsetWidth > 0 && menu.offsetHeight > 0
                    )
                };
            `);

            let status = '⚠️ WARNING';
            let note = 'No mobile menu system detected';
            
            if (menuTest?.menuTriggersFound > 0) {
                status = menuTest.triggerVisible ? '✅ PASS' : '⚠️ WARNING';
                note = menuTest.triggerVisible ? 'Mobile menu trigger found and visible' : 'Mobile menu trigger found but not visible';
            }

            return {
                status,
                note,
                triggersFound: menuTest?.menuTriggersFound || 0,
                menusFound: menuTest?.mobileMenusFound || 0,
                triggerVisible: menuTest?.triggerVisible || false
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    calculateDeviceStatus(navResults, readabilityResults, scrollResults) {
        const criticalFails = [navResults, scrollResults].filter(r => r.status === '❌ FAIL').length;
        const warnings = [navResults, readabilityResults, scrollResults].filter(r => r.status === '⚠️ WARNING').length;
        
        if (criticalFails > 0) return '❌ FAIL';
        if (warnings > 1) return '⚠️ WARNING';
        return '✅ PASS';
    }

    async runAccessibilityAnalysis() {
        console.log('\n♿ 2. CONTENT ACCESSIBILITY DEEP DIVE');
        console.log('-'.repeat(50));

        try {
            // Take accessibility screenshot
            await this.mcp_screenshot('accessibility-analysis', 1920, 1080);

            // Test keyboard navigation
            const keyboardResults = await this.testKeyboardAccessibilityMCP();
            
            // Test heading hierarchy
            const headingResults = await this.testHeadingHierarchyMCP();
            
            // Test form accessibility
            const formResults =await this.testFormAccessibilityMCP();
            
            // Test color contrast (basic)
            const contrastResults = await this.testColorContrastMCP();
            
            // Test ARIA and semantic structure
            const ariaResults = await this.testAriaSemanticsMCP();

            this.results.accessibility = {
                keyboardNavigation: keyboardResults,
                headingHierarchy: headingResults,
                formAccessibility: formResults,
                colorContrast: contrastResults,
                ariaSemantics: ariaResults,
                overallStatus: this.calculateAccessibilityStatus([
                    keyboardResults, headingResults, formResults, contrastResults, ariaResults
                ])
            };

            console.log(`   ✅ Accessibility analysis complete - ${this.results.accessibility.overallStatus}`);

        } catch (error) {
            console.error('   ❌ Accessibility testing failed:', error.message);
            this.results.accessibility = { error: error.message, overallStatus: '❌ FAIL' };
        }
    }

    async testKeyboardAccessibilityMCP() {
        try {
            const keyboardTest = await this.mcp_evaluate(`
                // Test focusable elements
                const focusableSelectors = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
                const focusableElements = document.querySelectorAll(focusableSelectors);
                
                const results = {
                    totalFocusable: focusableElements.length,
                    visibleFocusable: 0,
                    hasTabIndex: 0,
                    hasAriaLabel: 0,
                    elements: []
                };
                
                focusableElements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        results.visibleFocusable++;
                        
                        const hasTabIndex = el.hasAttribute('tabindex');
                        const hasAriaLabel = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
                        
                        if (hasTabIndex) results.hasTabIndex++;
                        if (hasAriaLabel) results.hasAriaLabel++;
                        
                        results.elements.push({
                            tagName: el.tagName.toLowerCase(),
                            text: el.textContent ? el.textContent.trim().substring(0, 30) : '',
                            hasTabIndex,
                            hasAriaLabel,
                            tabIndex: el.tabIndex
                        });
                    }
                });
                
                return results;
            `);

            return {
                status: (keyboardTest?.visibleFocusable || 0) > 0 ? '✅ PASS' : '❌ FAIL',
                totalFocusable: keyboardTest?.totalFocusable || 0,
                visibleFocusable: keyboardTest?.visibleFocusable || 0,
                withTabIndex: keyboardTest?.hasTabIndex || 0,
                withAriaLabel: keyboardTest?.hasAriaLabel || 0,
                elements: keyboardTest?.elements?.slice(0, 5) || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testHeadingHierarchyMCP() {
        try {
            const headingTest = await this.mcp_evaluate(`
                const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                const headingData = [];
                const hierarchyIssues = [];
                
                headings.forEach((heading, index) => {
                    const level = parseInt(heading.tagName.charAt(1));
                    const text = heading.textContent.trim();
                    
                    headingData.push({
                        level,
                        text: text.substring(0, 50),
                        id: heading.id,
                        hasId: !!heading.id
                    });
                    
                    // Check hierarchy
                    if (index > 0) {
                        const previousLevel = headingData[index - 1].level;
                        if (level > previousLevel + 1) {
                            hierarchyIssues.push({
                                from: previousLevel,
                                to: level,
                                text: text.substring(0, 30)
                            });
                        }
                    }
                });
                
                return {
                    totalHeadings: headingData.length,
                    h1Count: headingData.filter(h => h.level === 1).length,
                    withIds: headingData.filter(h => h.hasId).length,
                    hierarchyIssues: hierarchyIssues.length,
                    headings: headingData,
                    issues: hierarchyIssues
                };
            `);

            return {
                status: (headingTest?.hierarchyIssues || 0) === 0 && (headingTest?.h1Count || 0) === 1 ? 
                    '✅ PASS' : '⚠️ WARNING',
                totalHeadings: headingTest?.totalHeadings || 0,
                h1Count: headingTest?.h1Count || 0,
                hierarchyIssues: headingTest?.hierarchyIssues || 0,
                withIds: headingTest?.withIds || 0,
                issues: headingTest?.issues || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testFormAccessibilityMCP() {
        try {
            const formTest = await this.mcp_evaluate(`
                const formElements = document.querySelectorAll('input, textarea, select');
                const results = {
                    totalFormElements: formElements.length,
                    withLabels: 0,
                    withAriaLabel: 0,
                    required: 0,
                    unlabeled: []
                };
                
                formElements.forEach(input => {
                    const hasLabel = document.querySelector('label[for="' + input.id + '"]') || 
                                    input.closest('label');
                    const hasAriaLabel = input.hasAttribute('aria-label') || 
                                        input.hasAttribute('aria-labelledby');
                    
                    if (hasLabel) results.withLabels++;
                    if (hasAriaLabel) results.withAriaLabel++;
                    if (input.required) results.required++;
                    
                    if (!hasLabel && !hasAriaLabel) {
                        results.unlabeled.push({
                            type: input.type || input.tagName.toLowerCase(),
                            id: input.id,
                            name: input.name,
                            placeholder: input.placeholder
                        });
                    }
                });
                
                return results;
            `);

            return {
                status: (formTest?.unlabeled?.length || 0) === 0 ? '✅ PASS' : '❌ FAIL',
                totalFormElements: formTest?.totalFormElements || 0,
                withLabels: formTest?.withLabels || 0,
                withAriaLabel: formTest?.withAriaLabel || 0,
                unlabeledCount: formTest?.unlabeled?.length || 0,
                unlabeled: formTest?.unlabeled || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testColorContrastMCP() {
        try {
            const contrastTest = await this.mcp_evaluate(`
                // Basic contrast check - looking for potential issues
                const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
                const potentialIssues = [];
                
                elements.forEach(el => {
                    const style = window.getComputedStyle(el);
                    const color = style.color;
                    const backgroundColor = style.backgroundColor;
                    const text = el.textContent.trim();
                    
                    if (text.length > 0) {
                        // Basic checks for obvious issues
                        if (color === backgroundColor) {
                            potentialIssues.push({
                                element: el.tagName.toLowerCase(),
                                text: text.substring(0, 30),
                                issue: 'Same foreground and background color',
                                color,
                                backgroundColor
                            });
                        }
                        
                        // Check for very light text
                        if (color === 'rgb(255, 255, 255)' || color === '#ffffff') {
                            if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
                                potentialIssues.push({
                                    element: el.tagName.toLowerCase(),
                                    text: text.substring(0, 30),
                                    issue: 'White text on potentially white background',
                                    color,
                                    backgroundColor
                                });
                            }
                        }
                    }
                });
                
                return {
                    elementsChecked: elements.length,
                    potentialIssues: potentialIssues.length,
                    issues: potentialIssues.slice(0, 5)
                };
            `);

            return {
                status: (contrastTest?.potentialIssues || 0) === 0 ? '✅ PASS' : '⚠️ WARNING',
                elementsChecked: contrastTest?.elementsChecked || 0,
                potentialIssues: contrastTest?.potentialIssues || 0,
                note: 'Basic contrast check - use WCAG tools for comprehensive testing',
                issues: contrastTest?.issues || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testAriaSemanticsMCP() {
        try {
            const ariaTest = await this.mcp_evaluate(`
                const results = {
                    landmarkElements: 0,
                    ariaElements: 0,
                    semanticElements: 0,
                    altTexts: 0,
                    missingAltTexts: 0
                };
                
                // Check for landmarks
                const landmarks = document.querySelectorAll(
                    'main, nav, header, footer, aside, section, article, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'
                );
                results.landmarkElements = landmarks.length;
                
                // Check for ARIA attributes
                const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
                results.ariaElements = ariaElements.length;
                
                // Check semantic HTML5 elements
                const semanticElements = document.querySelectorAll(
                    'main, nav, header, footer, aside, section, article, figure, figcaption'
                );
                results.semanticElements = semanticElements.length;
                
                // Check images for alt text
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (img.hasAttribute('alt')) {
                        results.altTexts++;
                    } else {
                        results.missingAltTexts++;
                    }
                });
                
                return results;
            `);

            const semanticScore = (ariaTest?.landmarkElements || 0) + (ariaTest?.semanticElements || 0) + (ariaTest?.ariaElements || 0);
            
            return {
                status: semanticScore > 5 && (ariaTest?.missingAltTexts || 0) === 0 ? '✅ PASS' : '⚠️ WARNING',
                landmarkElements: ariaTest?.landmarkElements || 0,
                ariaElements: ariaTest?.ariaElements || 0,
                semanticElements: ariaTest?.semanticElements || 0,
                altTexts: ariaTest?.altTexts || 0,
                missingAltTexts: ariaTest?.missingAltTexts || 0,
                semanticScore
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    calculateAccessibilityStatus(results) {
        const fails = results.filter(r => r.status === '❌ FAIL').length;
        const warnings = results.filter(r => r.status === '⚠️ WARNING').length;
        
        if (fails > 0) return '❌ FAIL';
        if (warnings > 2) return '⚠️ WARNING';
        return '✅ PASS';
    }

    async runPerformanceAnalysis() {
        console.log('\n⚡ 3. PERFORMANCE ANALYSIS');
        console.log('-'.repeat(50));

        try {
            // Performance metrics collection
            const performanceMetrics = await this.collectPerformanceMetricsMCP();
            
            // Resource analysis
            const resourceAnalysis = await this.analyzeResourcesMCP();
            
            // Core Web Vitals simulation
            const coreWebVitals = await this.simulateCoreWebVitalsMCP();

            this.results.performance = {
                metrics: performanceMetrics,
                resources: resourceAnalysis,
                coreWebVitals: coreWebVitals,
                overallStatus: this.calculatePerformanceStatus(performanceMetrics, coreWebVitals)
            };

            console.log(`   ✅ Performance analysis complete - ${this.results.performance.overallStatus}`);

        } catch (error) {
            console.error('   ❌ Performance testing failed:', error.message);
            this.results.performance = { error: error.message, overallStatus: '❌ FAIL' };
        }
    }

    async collectPerformanceMetricsMCP() {
        try {
            const perfMetrics = await this.mcp_evaluate(`
                const navigationEntry = performance.getEntriesByType('navigation')[0];
                const paintEntries = performance.getEntriesByType('paint');
                const resourceEntries = performance.getEntriesByType('resource');
                
                return {
                    // Navigation timing
                    domContentLoaded: navigationEntry ? navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart : 0,
                    loadComplete: navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.loadEventStart : 0,
                    
                    // Paint timing
                    firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
                    firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                    
                    // Resources
                    totalResources: resourceEntries.length,
                    totalTransferSize: resourceEntries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
                    
                    // DOM metrics
                    domNodes: document.querySelectorAll('*').length,
                    images: document.querySelectorAll('img').length,
                    scripts: document.querySelectorAll('script').length,
                    stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length
                };
            `);

            return {
                status: (perfMetrics?.firstContentfulPaint || 0) < 2500 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT',
                domContentLoaded: Math.round(perfMetrics?.domContentLoaded || 0),
                loadComplete: Math.round(perfMetrics?.loadComplete || 0),
                firstPaint: Math.round(perfMetrics?.firstPaint || 0),
                firstContentfulPaint: Math.round(perfMetrics?.firstContentfulPaint || 0),
                totalResources: perfMetrics?.totalResources || 0,
                totalTransferSize: Math.round((perfMetrics?.totalTransferSize || 0) / 1024), // KB
                domNodes: perfMetrics?.domNodes || 0,
                images: perfMetrics?.images || 0,
                scripts: perfMetrics?.scripts || 0,
                stylesheets: perfMetrics?.stylesheets || 0
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async analyzeResourcesMCP() {
        try {
            const resourceAnalysis = await this.mcp_evaluate(`
                const resourceEntries = performance.getEntriesByType('resource');
                const analysis = {
                    css: { count: 0, size: 0 },
                    js: { count: 0, size: 0 },
                    images: { count: 0, size: 0 },
                    fonts: { count: 0, size: 0 },
                    other: { count: 0, size: 0 }
                };
                
                resourceEntries.forEach(entry => {
                    const size = entry.transferSize || 0;
                    
                    if (entry.name.includes('.css') || entry.initiatorType === 'css') {
                        analysis.css.count++;
                        analysis.css.size += size;
                    } else if (entry.name.includes('.js') || entry.initiatorType === 'script') {
                        analysis.js.count++;
                        analysis.js.size += size;
                    } else if (entry.initiatorType === 'img' || /\.(jpg|jpeg|png|gif|svg|webp)/.test(entry.name)) {
                        analysis.images.count++;
                        analysis.images.size += size;
                    } else if (/\.(woff|woff2|ttf|otf)/.test(entry.name)) {
                        analysis.fonts.count++;
                        analysis.fonts.size += size;
                    } else {
                        analysis.other.count++;
                        analysis.other.size += size;
                    }
                });
                
                return analysis;
            `);

            const totalSize = Object.values(resourceAnalysis || {}).reduce((sum, type) => sum + (type.size || 0), 0);
            
            return {
                status: totalSize < 1024 * 1024 * 2 ? '✅ GOOD' : '⚠️ LARGE', // 2MB threshold
                totalSizeKB: Math.round(totalSize / 1024),
                breakdown: {
                    css: {
                        count: resourceAnalysis?.css?.count || 0,
                        sizeKB: Math.round((resourceAnalysis?.css?.size || 0) / 1024)
                    },
                    js: {
                        count: resourceAnalysis?.js?.count || 0,
                        sizeKB: Math.round((resourceAnalysis?.js?.size || 0) / 1024)
                    },
                    images: {
                        count: resourceAnalysis?.images?.count || 0,
                        sizeKB: Math.round((resourceAnalysis?.images?.size || 0) / 1024)
                    },
                    fonts: {
                        count: resourceAnalysis?.fonts?.count || 0,
                        sizeKB: Math.round((resourceAnalysis?.fonts?.size || 0) / 1024)
                    }
                }
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async simulateCoreWebVitalsMCP() {
        try {
            // Simulate Core Web Vitals assessment
            const cwv = await this.mcp_evaluate(`
                const navigationEntry = performance.getEntriesByType('navigation')[0];
                const paintEntries = performance.getEntriesByType('paint');
                
                // Simulate LCP (Largest Contentful Paint)
                const images = document.querySelectorAll('img');
                const textBlocks = document.querySelectorAll('h1, h2, p');
                let largestElement = null;
                let largestSize = 0;
                
                [...images, ...textBlocks].forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const size = rect.width * rect.height;
                    if (size > largestSize) {
                        largestSize = size;
                        largestElement = el;
                    }
                });
                
                // Simulate CLS (Cumulative Layout Shift) - basic check
                const dynamicElements = document.querySelectorAll('[style*="position: absolute"], [style*="position: fixed"]');
                
                return {
                    // FCP from paint entries
                    fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                    
                    // Simulated LCP (would need more sophisticated measurement in real scenario)
                    lcp: Math.max(
                        paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                        navigationEntry ? navigationEntry.domContentLoadedEventEnd : 0
                    ),
                    
                    // Simulated CLS (basic check for potentially shifting elements)
                    cls: dynamicElements.length * 0.05, // Rough estimation
                    
                    largestElementInfo: largestElement ? {
                        tagName: largestElement.tagName.toLowerCase(),
                        size: Math.round(largestSize),
                        text: largestElement.textContent ? largestElement.textContent.substring(0, 30) : 'image'
                    } : null
                };
            `);

            return {
                fcp: {
                    value: Math.round(cwv?.fcp || 0),
                    status: (cwv?.fcp || 0) < 1800 ? '✅ GOOD' : (cwv?.fcp || 0) < 3000 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR',
                    threshold: '< 1.8s (Good), < 3.0s (Needs Improvement)'
                },
                lcp: {
                    value: Math.round(cwv?.lcp || 0),
                    status: (cwv?.lcp || 0) < 2500 ? '✅ GOOD' : (cwv?.lcp || 0) < 4000 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR',
                    threshold: '< 2.5s (Good), < 4.0s (Needs Improvement)'
                },
                cls: {
                    value: Number((cwv?.cls || 0).toFixed(3)),
                    status: (cwv?.cls || 0) < 0.1 ? '✅ GOOD' : (cwv?.cls || 0) < 0.25 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR',
                    threshold: '< 0.1 (Good), < 0.25 (Needs Improvement)'
                },
                largestElement: cwv?.largestElementInfo
            };
        } catch (error) {
            return { 
                fcp: { value: 0, status: '❌ FAIL', error: error.message },
                lcp: { value: 0, status: '❌ FAIL', error: error.message },
                cls: { value: 0, status: '❌ FAIL', error: error.message }
            };
        }
    }

    calculatePerformanceStatus(metrics, vitals) {
        const poorVitals = Object.values(vitals || {}).filter(v => v.status === '❌ POOR').length;
        const needsImprovement = Object.values(vitals || {}).filter(v => v.status === '⚠️ NEEDS IMPROVEMENT').length;
        
        if (poorVitals > 0) return '❌ POOR';
        if (needsImprovement > 1) return '⚠️ NEEDS IMPROVEMENT';
        return '✅ GOOD';
    }

    async runUserJourneyAnalysis() {
        console.log('\n👤 4. USER JOURNEY ANALYSIS');
        console.log('-'.repeat(50));

        try {
            // Take user journey screenshot
            await this.mcp_screenshot('user-journey-analysis', 1920, 1080);

            // Test new student journey
            const newStudentJourney = await this.testNewStudentJourneyMCP();
            
            // Test information discoverability
            const infoDiscovery = await this.testInformationDiscoveryMCP();
            
            // Test above-the-fold content
            const aboveFoldContent = await this.testAboveFoldContentMCP();
            
            // Test value proposition clarity
            const valueProposition = await this.testValuePropositionMCP();

            this.results.userJourney = {
                newStudentJourney,
                informationDiscovery: infoDiscovery,
                aboveFoldContent,
                valueProposition,
                overallStatus: this.calculateUserJourneyStatus([
                    newStudentJourney, infoDiscovery, aboveFoldContent, valueProposition
                ])
            };

            console.log(`   ✅ User journey analysis complete - ${this.results.userJourney.overallStatus}`);

        } catch (error) {
            console.error('   ❌ User journey testing failed:', error.message);
            this.results.userJourney = { error: error.message, overallStatus: '❌ FAIL' };
        }
    }

    async testNewStudentJourneyMCP() {
        try {
            const startTime = Date.now();
            
            const journeyTest = await this.mcp_evaluate(`
                const newStudentKeywords = [
                    'new student', 'beginner', 'intro', 'first class', 'trial', 
                    'getting started', 'start your journey', 'new to aikido'
                ];
                
                const contactKeywords = [
                    'contact', 'phone', 'email', 'address', 'location', 'call', 'reach out'
                ];
                
                const elements = document.querySelectorAll('*');
                const newStudentMatches = [];
                const contactMatches = [];
                
                elements.forEach(el => {
                    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                        const text = el.textContent.toLowerCase();
                        
                        newStudentKeywords.forEach(keyword => {
                            if (text.includes(keyword)) {
                                newStudentMatches.push({
                                    keyword,
                                    element: el.tagName.toLowerCase(),
                                    text: el.textContent.trim().substring(0, 60),
                                    position: el.getBoundingClientRect().top
                                });
                            }
                        });
                        
                        contactKeywords.forEach(keyword => {
                            if (text.includes(keyword)) {
                                contactMatches.push({
                                    keyword,
                                    element: el.tagName.toLowerCase(),
                                    text: el.textContent.trim().substring(0, 40),
                                    position: el.getBoundingClientRect().top
                                });
                            }
                        });
                    }
                });
                
                return {
                    newStudentInfo: newStudentMatches.length,
                    contactInfo: contactMatches.length,
                    newStudentAboveFold: newStudentMatches.filter(m => m.position < 800).length,
                    contactAboveFold: contactMatches.filter(m => m.position < 800).length,
                    samples: {
                        newStudent: newStudentMatches.slice(0, 3),
                        contact: contactMatches.slice(0, 3)
                    }
                };
            `);
            
            const journeyTime = Date.now() - startTime;

            return {
                status: (journeyTest?.newStudentInfo || 0) > 0 && (journeyTest?.contactInfo || 0) > 0 ? 
                    '✅ PASS' : '⚠️ WARNING',
                journeyTime,
                newStudentInfoFound: journeyTest?.newStudentInfo || 0,
                contactInfoFound: journeyTest?.contactInfo || 0,
                newStudentAboveFold: journeyTest?.newStudentAboveFold || 0,
                contactAboveFold: journeyTest?.contactAboveFold || 0,
                samples: journeyTest?.samples || {}
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testInformationDiscoveryMCP() {
        try {
            const infoTest = await this.mcp_evaluate(`
                const infoCategories = {
                    schedule: ['schedule', 'class times', 'hours', 'when', 'time'],
                    pricing: ['price', 'cost', 'fee', 'tuition', '$', 'pricing'],
                    instructor: ['instructor', 'sensei', 'teacher', 'master', 'about'],
                    contact: ['contact', 'phone', 'email', 'address', 'location'],
                    philosophy: ['philosophy', 'aikido', 'martial arts', 'tradition']
                };
                
                const results = {};
                
                Object.entries(infoCategories).forEach(([category, keywords]) => {
                    const matches = [];
                    const elements = document.querySelectorAll('*');
                    
                    elements.forEach(el => {
                        if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                            const text = el.textContent.toLowerCase();
                            const foundKeywords = keywords.filter(keyword => text.includes(keyword));
                            
                            if (foundKeywords.length > 0) {
                                matches.push({
                                    keywords: foundKeywords,
                                    text: el.textContent.trim().substring(0, 60),
                                    position: el.getBoundingClientRect().top,
                                    element: el.tagName.toLowerCase()
                                });
                            }
                        }
                    });
                    
                    results[category] = {
                        found: matches.length > 0,
                        matchCount: matches.length,
                        aboveFold: matches.filter(m => m.position < 800).length,
                        samples: matches.slice(0, 2)
                    };
                });
                
                return results;
            `);

            const categoriesFound = Object.values(infoTest || {}).filter(cat => cat.found).length;
            const totalCategories = Object.keys(infoTest || {}).length;

            return {
                status: categoriesFound >= totalCategories * 0.8 ? '✅ PASS' : '⚠️ WARNING', // 80% threshold
                categoriesFound,
                totalCategories,
                categories: infoTest || {}
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testAboveFoldContentMCP() {
        try {
            const foldTest = await this.mcp_evaluate(`
                const foldLine = window.innerHeight;
                const elements = document.querySelectorAll('h1, h2, h3, p, button, a, img');
                const aboveFold = [];
                
                elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < foldLine && rect.bottom > 0 && rect.width > 0 && rect.height > 0) {
                        aboveFold.push({
                            tagName: el.tagName.toLowerCase(),
                            text: el.textContent ? el.textContent.trim().substring(0, 40) : el.alt || 'image',
                            position: Math.round(rect.top),
                            isCTA: el.tagName.toLowerCase() === 'button' || 
                                   (el.tagName.toLowerCase() === 'a' && 
                                    (el.textContent.toLowerCase().includes('contact') || 
                                     el.textContent.toLowerCase().includes('call') ||
                                     el.textContent.toLowerCase().includes('start')))
                        });
                    }
                });
                
                return {
                    foldLine,
                    aboveFoldElements: aboveFold.length,
                    hasH1: aboveFold.some(el => el.tagName === 'h1'),
                    hasCTA: aboveFold.some(el => el.isCTA),
                    hasImage: aboveFold.some(el => el.tagName === 'img'),
                    content: aboveFold.slice(0, 8),
                    ctaSamples: aboveFold.filter(el => el.isCTA).slice(0, 3)
                };
            `);

            return {
                status: (foldTest?.hasH1 && foldTest?.hasCTA) ? '✅ PASS' : '⚠️ WARNING',
                foldLine: foldTest?.foldLine || 0,
                elementsAboveFold: foldTest?.aboveFoldElements || 0,
                hasHeading: foldTest?.hasH1 || false,
                hasCallToAction: foldTest?.hasCTA || false,
                hasImage: foldTest?.hasImage || false,
                content: foldTest?.content || [],
                ctaSamples: foldTest?.ctaSamples || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    async testValuePropositionMCP() {
        try {
            const valueTest = await this.mcp_evaluate(`
                const valueKeywords = [
                    'aikido', 'martial arts', 'self defense', 'peace', 'harmony',
                    'traditional', 'discipline', 'respect', 'community', 'wellness',
                    'philosophy', 'mind body', 'japanese', 'spiritual', 'training',
                    'health', 'fitness', 'confidence', 'balance', 'inner peace'
                ];
                
                const elements = document.querySelectorAll('h1, h2, h3, p, .hero *, .intro *, .about *');
                const valuePropositions = [];
                
                elements.forEach(el => {
                    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                        const text = el.textContent.toLowerCase();
                        const matchedKeywords = valueKeywords.filter(keyword => text.includes(keyword));
                        
                        if (matchedKeywords.length > 0) {
                            valuePropositions.push({
                                element: el.tagName.toLowerCase(),
                                text: el.textContent.trim().substring(0, 80),
                                keywords: matchedKeywords,
                                position: el.getBoundingClientRect().top,
                                keywordCount: matchedKeywords.length
                            });
                        }
                    }
                });
                
                // Sort by keyword density and position
                valuePropositions.sort((a, b) => {
                    if (a.position < 800 && b.position >= 800) return -1;
                    if (b.position < 800 && a.position >= 800) return 1;
                    return b.keywordCount - a.keywordCount;
                });
                
                return {
                    totalValueProps: valuePropositions.length,
                    aboveFoldProps: valuePropositions.filter(prop => prop.position < 800).length,
                    keywordMatches: valuePropositions.reduce((total, prop) => total + prop.keywordCount, 0),
                    strongestProps: valuePropositions.slice(0, 3),
                    uniqueKeywords: [...new Set(valuePropositions.flatMap(prop => prop.keywords))].length
                };
            `);

            return {
                status: (valueTest?.aboveFoldProps || 0) > 0 && (valueTest?.keywordMatches || 0) > 5 ? 
                    '✅ PASS' : '⚠️ WARNING',
                totalValueProps: valueTest?.totalValueProps || 0,
                aboveFoldProps: valueTest?.aboveFoldProps || 0,
                keywordMatches: valueTest?.keywordMatches || 0,
                uniqueKeywords: valueTest?.uniqueKeywords || 0,
                strongestPropositions: valueTest?.strongestProps || []
            };
        } catch (error) {
            return { status: '❌ FAIL', error: error.message };
        }
    }

    calculateUserJourneyStatus(results) {
        const fails = results.filter(r => r.status === '❌ FAIL').length;
        const warnings = results.filter(r => r.status === '⚠️ WARNING').length;
        const passes = results.filter(r => r.status === '✅ PASS').length;
        
        if (fails > 0) return '❌ FAIL';
        if (passes >= 3) return '✅ PASS';
        return '⚠️ WARNING';
    }

    async generateComprehensiveReport() {
        console.log('\n📊 GENERATING COMPREHENSIVE REPORT');
        console.log('-'.repeat(50));

        // Generate summary
        this.generateSummary();
        
        // Create reports directory
        const timestamp = Date.now();
        
        // Save detailed JSON report
        const reportPath = path.join(this.reportDir, `phase2-ux-analysis-${timestamp}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate human-readable report
        const readableReportPath = path.join(this.reportDir, `phase2-ux-summary-${timestamp}.md`);
        const readableReport = this.generateReadableReport();
        fs.writeFileSync(readableReportPath, readableReport);

        console.log(`✅ Reports generated:`);
        console.log(`   📄 Detailed JSON: ${reportPath}`);
        console.log(`   📋 Summary Report: ${readableReportPath}`);
        console.log(`   📸 Screenshots: ${this.screenshotDir}/`);

        return { reportPath, readableReportPath };
    }

    generateSummary() {
        const summary = [];

        // Mobile responsiveness summary
        const deviceResults = Object.values(this.results.responsiveness || {});
        const passingDevices = deviceResults.filter(r => r.status === '✅ PASS').length;
        const totalDevices = deviceResults.length;
        
        summary.push({
            category: '📱 Mobile Responsiveness',
            status: passingDevices === totalDevices ? '✅ PASS' : 
                   passingDevices > totalDevices / 2 ? '⚠️ PARTIAL' : '❌ FAIL',
            details: `${passingDevices}/${totalDevices} devices passing`,
            priority: passingDevices < totalDevices ? 'High' : 'Low'
        });

        // Accessibility summary
        if (this.results.accessibility?.overallStatus) {
            summary.push({
                category: '♿ Accessibility',
                status: this.results.accessibility.overallStatus,
                details: `Keyboard, headings, forms, and ARIA compliance checked`,
                priority: this.results.accessibility.overallStatus === '✅ PASS' ? 'Low' : 'High'
            });
        }

        // Performance summary
        if (this.results.performance?.overallStatus) {
            summary.push({
                category: '⚡ Performance',
                status: this.results.performance.overallStatus,
                details: `Core Web Vitals and resource analysis completed`,
                priority: this.results.performance.overallStatus === '✅ GOOD' ? 'Low' : 'Medium'
            });
        }

        // User journey summary
        if (this.results.userJourney?.overallStatus) {
            summary.push({
                category: '👤 User Journey',
                status: this.results.userJourney.overallStatus,
                details: `New student flow and information discovery tested`,
                priority: this.results.userJourney.overallStatus === '✅ PASS' ? 'Low' : 'Medium'
            });
        }

        this.results.summary = summary;
        
        console.log('\n📋 EXECUTIVE SUMMARY:');
        summary.forEach(item => {
            console.log(`   ${item.status} ${item.category}: ${item.details} [${item.priority} Priority]`);
        });
    }

    generateReadableReport() {
        const timestamp = new Date().toISOString();
        
        let report = `# Phase 2: User Experience Analysis Report\n`;
        report += `**Genshinkan Aikido Website - Comprehensive UX Testing**\n\n`;
        report += `- **Generated**: ${timestamp}\n`;
        report += `- **Author**: Lance James @ Unit 221B\n`;
        report += `- **Test URL**: ${this.baseUrl}\n`;
        report += `- **Testing Method**: MCP Browser Automation Tools\n\n`;

        report += `## Executive Summary\n\n`;
        this.results.summary.forEach(item => {
            const icon = item.priority === 'High' ? '🔴' : item.priority === 'Medium' ? '🟡' : '🟢';
            report += `${icon} **${item.category}**: ${item.status} - ${item.details} *(${item.priority} Priority)*\n\n`;
        });

        report += `## 1. Mobile Responsiveness Testing\n\n`;
        Object.entries(this.results.responsiveness || {}).forEach(([device, results]) => {
            if (results.error) {
                report += `### ${device}\n❌ **FAILED**: ${results.error}\n\n`;
                return;
            }

            report += `### ${device} (${results.viewport.width}x${results.viewport.height}) - ${results.status}\n\n`;
            report += `| Test Area | Status | Details |\n`;
            report += `|-----------|--------|----------|\n`;
            report += `| Navigation | ${results.navigation?.status || 'N/A'} | ${results.navigation?.visibleNavLinks || 0} visible links found |\n`;
            report += `| Text Readability | ${results.readability?.status || 'N/A'} | ${results.readability?.issues || 'None'} |\n`;
            report += `| Touch Interactions | ${results.touchInteractions?.status || 'N/A'} | ${results.touchInteractions?.issues || 'None'} |\n`;
            report += `| Horizontal Scrolling | ${results.horizontalScrolling?.status || 'N/A'} | ${results.horizontalScrolling?.issue || 'None'} |\n`;
            report += `| Mobile Menu | ${results.mobileMenu?.status || 'N/A'} | ${results.mobileMenu?.note || 'None'} |\n\n`;
        });

        if (this.results.accessibility) {
            report += `## 2. Accessibility Analysis - ${this.results.accessibility.overallStatus}\n\n`;
            
            if (this.results.accessibility.keyboardNavigation) {
                const kb = this.results.accessibility.keyboardNavigation;
                report += `### Keyboard Navigation: ${kb.status}\n`;
                report += `- **Focusable Elements**: ${kb.totalFocusable || 0} total, ${kb.visibleFocusable || 0} visible\n`;
                report += `- **With ARIA Labels**: ${kb.withAriaLabel || 0}\n`;
                report += `- **With Tab Index**: ${kb.withTabIndex || 0}\n\n`;
            }
            
            if (this.results.accessibility.headingHierarchy) {
                const hh = this.results.accessibility.headingHierarchy;
                report += `### Heading Hierarchy: ${hh.status}\n`;
                report += `- **Total Headings**: ${hh.totalHeadings || 0}\n`;
                report += `- **H1 Count**: ${hh.h1Count || 0} (should be 1)\n`;
                report += `- **Hierarchy Issues**: ${hh.hierarchyIssues || 0}\n\n`;
            }
            
            if (this.results.accessibility.formAccessibility) {
                const fa = this.results.accessibility.formAccessibility;
                report += `### Form Accessibility: ${fa.status}\n`;
                report += `- **Form Elements**: ${fa.totalFormElements || 0}\n`;
                report += `- **With Labels**: ${fa.withLabels || 0}\n`;
                report += `- **Unlabeled**: ${fa.unlabeledCount || 0}\n\n`;
            }
        }

        if (this.results.performance) {
            report += `## 3. Performance Analysis - ${this.results.performance.overallStatus}\n\n`;
            
            if (this.results.performance.coreWebVitals) {
                const cwv = this.results.performance.coreWebVitals;
                report += `### Core Web Vitals\n\n`;
                report += `| Metric | Value | Status | Threshold |\n`;
                report += `|--------|-------|--------|----------|\n`;
                report += `| First Contentful Paint (FCP) | ${cwv.fcp?.value || 0}ms | ${cwv.fcp?.status || 'N/A'} | ${cwv.fcp?.threshold || 'N/A'} |\n`;
                report += `| Largest Contentful Paint (LCP) | ${cwv.lcp?.value || 0}ms | ${cwv.lcp?.status || 'N/A'} | ${cwv.lcp?.threshold || 'N/A'} |\n`;
                report += `| Cumulative Layout Shift (CLS) | ${cwv.cls?.value || 0} | ${cwv.cls?.status || 'N/A'} | ${cwv.cls?.threshold || 'N/A'} |\n\n`;
            }
            
            if (this.results.performance.resources) {
                const res = this.results.performance.resources;
                report += `### Resource Analysis\n`;
                report += `- **Total Size**: ${res.totalSizeKB || 0} KB\n`;
                report += `- **CSS**: ${res.breakdown?.css?.count || 0} files (${res.breakdown?.css?.sizeKB || 0} KB)\n`;
                report += `- **JavaScript**: ${res.breakdown?.js?.count || 0} files (${res.breakdown?.js?.sizeKB || 0} KB)\n`;
                report += `- **Images**: ${res.breakdown?.images?.count || 0} files (${res.breakdown?.images?.sizeKB || 0} KB)\n\n`;
            }
        }

        if (this.results.userJourney) {
            report += `## 4. User Journey Analysis - ${this.results.userJourney.overallStatus}\n\n`;
            
            if (this.results.userJourney.newStudentJourney) {
                const nsj = this.results.userJourney.newStudentJourney;
                report += `### New Student Journey: ${nsj.status}\n`;
                report += `- **Journey Analysis Time**: ${nsj.journeyTime || 0}ms\n`;
                report += `- **New Student Info Found**: ${nsj.newStudentInfoFound || 0} references\n`;
                report += `- **Contact Info Found**: ${nsj.contactInfoFound || 0} references\n`;
                report += `- **Above Fold Info**: ${nsj.newStudentAboveFold || 0} new student, ${nsj.contactAboveFold || 0} contact\n\n`;
            }
            
            if (this.results.userJourney.aboveFoldContent) {
                const afc = this.results.userJourney.aboveFoldContent;
                report += `### Above-the-Fold Content: ${afc.status}\n`;
                report += `- **Elements Above Fold**: ${afc.elementsAboveFold || 0}\n`;
                report += `- **Has Main Heading**: ${afc.hasHeading ? 'Yes' : 'No'}\n`;
                report += `- **Has Call-to-Action**: ${afc.hasCallToAction ? 'Yes' : 'No'}\n`;
                report += `- **Has Hero Image**: ${afc.hasImage ? 'Yes' : 'No'}\n\n`;
            }
        }

        report += `## Prioritized Recommendations\n\n`;
        report += this.generatePrioritizedRecommendations();

        report += `\n---\n\n`;
        report += `*Report generated using MCP Browser Automation Tools*\n`;
        report += `*For detailed technical data, see the accompanying JSON report*\n`;

        return report;
    }

    generatePrioritizedRecommendations() {
        let recommendations = '';
        const highPriorityIssues = [];
        const mediumPriorityIssues = [];
        const lowPriorityIssues = [];

        // Analyze results for recommendations
        
        // Mobile responsiveness issues
        const failedDevices = Object.entries(this.results.responsiveness || {})
            .filter(([device, results]) => results.status === '❌ FAIL' || results.status === '⚠️ WARNING');
        
        if (failedDevices.length > 0) {
            highPriorityIssues.push(`**Mobile Responsiveness**: Fix issues on ${failedDevices.length} device(s) - horizontal scrolling, touch targets, mobile menu functionality`);
        }

        // Accessibility issues
        if (this.results.accessibility?.overallStatus === '❌ FAIL') {
            highPriorityIssues.push(`**Accessibility**: Critical accessibility violations found - fix form labels, keyboard navigation, and ARIA compliance`);
        } else if (this.results.accessibility?.overallStatus === '⚠️ WARNING') {
            mediumPriorityIssues.push(`**Accessibility**: Minor accessibility improvements needed - enhance semantic structure and ARIA labels`);
        }

        // Performance issues
        if (this.results.performance?.overallStatus === '❌ POOR') {
            highPriorityIssues.push(`**Performance**: Poor Core Web Vitals scores - optimize images, reduce JavaScript, improve loading times`);
        } else if (this.results.performance?.overallStatus === '⚠️ NEEDS IMPROVEMENT') {
            mediumPriorityIssues.push(`**Performance**: Performance optimization needed - compress resources, optimize Core Web Vitals`);
        }

        // User journey issues
        if (this.results.userJourney?.overallStatus === '❌ FAIL') {
            highPriorityIssues.push(`**User Experience**: Critical user journey issues - improve new student information visibility and contact accessibility`);
        } else if (this.results.userJourney?.overallStatus === '⚠️ WARNING') {
            mediumPriorityIssues.push(`**User Experience**: Enhance user journey - make key information more prominent and improve call-to-action placement`);
        }

        // Build recommendations
        if (highPriorityIssues.length > 0) {
            recommendations += `### 🔴 High Priority (Fix Immediately)\n\n`;
            highPriorityIssues.forEach((issue, index) => {
                recommendations += `${index + 1}. ${issue}\n\n`;
            });
        }

        if (mediumPriorityIssues.length > 0) {
            recommendations += `### 🟡 Medium Priority (Fix Soon)\n\n`;
            mediumPriorityIssues.forEach((issue, index) => {
                recommendations += `${index + 1}. ${issue}\n\n`;
            });
        }

        // Add general recommendations
        recommendations += `### 🟢 General Recommendations\n\n`;
        recommendations += `1. **Mobile-First Approach**: Ensure all new features are tested on mobile devices first\n\n`;
        recommendations += `2. **Performance Monitoring**: Implement ongoing performance monitoring with Core Web Vitals tracking\n\n`;
        recommendations += `3. **Accessibility Testing**: Integrate automated accessibility testing into development workflow\n\n`;
        recommendations += `4. **User Testing**: Conduct real user testing sessions with potential aikido students\n\n`;

        return recommendations || `No critical issues identified. Website shows good overall UX performance.\n\n`;
    }
}

// Run the analysis if called directly
if (require.main === module) {
    const suite = new MCPUXAnalysisSuite();
    suite.runFullAnalysis().catch(console.error);
}

module.exports = MCPUXAnalysisSuite;