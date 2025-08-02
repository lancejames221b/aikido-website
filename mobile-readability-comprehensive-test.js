const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class MobileReadabilityTester {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = [];
        this.screenshots = [];
        
        // iPhone 12 viewport specifications
        this.viewport = {
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true
        };
        
        // Homepage sections to test
        this.sections = [
            {
                name: 'Hero Section',
                selector: 'header, .hero, .hero-section, #hero',
                description: 'Top banner with main heading and navigation'
            },
            {
                name: 'About/Introduction Section',
                selector: '.about, #about, .introduction, #introduction',
                description: 'Main introduction content about the dojo'
            },
            {
                name: 'Classes/Schedule Section',
                selector: '.classes, #classes, .schedule, #schedule',
                description: 'Class schedules and program information'
            },
            {
                name: 'Philosophy & Practice Section',
                selector: '.philosophy, #philosophy, .practice, #practice, .concept-cards',
                description: 'Philosophy concept cards and practice information'
            },
            {
                name: 'Instructors Section',
                selector: '.instructors, #instructors, .instructor-grid, #instructor-grid',
                description: '5-instructor grid with photos and bios'
            },
            {
                name: 'Photo Gallery Section',
                selector: '.gallery, #gallery, .photos, #photos',
                description: 'Photo gallery and dojo images'
            },
            {
                name: 'Testimonials Section',
                selector: '.testimonials, #testimonials, .reviews, #reviews',
                description: 'Student testimonials and success stories'
            },
            {
                name: 'New Student Section',
                selector: '.new-student, #new-student, .signup, #signup',
                description: 'New student information and signup process'
            },
            {
                name: 'Contact/Form Section',
                selector: '.contact, #contact, .form, #form, form',
                description: 'Contact form and signup forms'
            },
            {
                name: 'Footer Section',
                selector: 'footer, .footer',
                description: 'Footer with contact info and links'
            }
        ];
    }

    async initialize() {
        console.log('🚀 Initializing Mobile Readability Testing Suite...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        });

        this.page = await this.browser.newPage();
        
        // Set iPhone 12 viewport
        await this.page.setViewport(this.viewport);
        
        // Set user agent for mobile testing
        await this.page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1');
        
        console.log(`📱 Set viewport to iPhone 12: ${this.viewport.width}x${this.viewport.height}`);
    }

    async navigateToSite() {
        console.log('🌐 Navigating to http://localhost:3000...');
        
        try {
            await this.page.goto('http://localhost:3000', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            console.log('✅ Successfully loaded homepage');
            
            // Wait for any dynamic content to load
            await this.page.waitForTimeout(2000);
            
        } catch (error) {
            console.error('❌ Failed to navigate to site:', error.message);
            throw error;
        }
    }

    async testSection(section) {
        console.log(`\n📋 Testing ${section.name}...`);
        
        const result = {
            sectionName: section.name,
            selector: section.selector,
            description: section.description,
            timestamp: new Date().toISOString(),
            issues: [],
            screenshots: [],
            metrics: {}
        };

        try {
            // Try to find the section using multiple selectors
            const selectors = section.selector.split(', ');
            let element = null;
            let usedSelector = null;

            for (const selector of selectors) {
                try {
                    element = await this.page.$(selector.trim());
                    if (element) {
                        usedSelector = selector.trim();
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!element) {
                // Fallback: look for section by content or position
                console.log(`⚠️  Could not find ${section.name} with selectors, attempting content-based detection...`);
                
                // Take a screenshot of current viewport for manual analysis
                const screenshotName = `${section.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-not-found.png`;
                await this.page.screenshot({
                    path: path.join(__dirname, 'screenshots', screenshotName),
                    fullPage: false
                });
                
                result.issues.push({
                    type: 'SECTION_NOT_FOUND',
                    severity: 'HIGH',
                    description: `Could not locate ${section.name} using provided selectors: ${section.selector}`,
                    recommendation: 'Verify section exists and update selectors'
                });
                
                result.screenshots.push(screenshotName);
                return result;
            }

            console.log(`✅ Found ${section.name} using selector: ${usedSelector}`);

            // Scroll to the section
            await element.scrollIntoView();
            await this.page.waitForTimeout(1000);

            // Get section metrics
            const sectionInfo = await this.page.evaluate((el) => {
                const rect = el.getBoundingClientRect();
                const styles = window.getComputedStyle(el);
                
                return {
                    position: {
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height
                    },
                    styles: {
                        fontSize: styles.fontSize,
                        lineHeight: styles.lineHeight,
                        padding: styles.padding,
                        margin: styles.margin,
                        backgroundColor: styles.backgroundColor,
                        color: styles.color
                    },
                    isVisible: rect.width > 0 && rect.height > 0
                };
            }, element);

            result.metrics = sectionInfo;

            // Take section screenshot
            const screenshotName = `${section.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-mobile.png`;
            await element.screenshot({
                path: path.join(__dirname, 'screenshots', screenshotName)
            });
            result.screenshots.push(screenshotName);

            // Analyze mobile readability issues
            await this.analyzeMobileReadability(element, result);

            // Test touch targets in this section
            await this.testTouchTargets(element, result);

            // Test for horizontal scrolling
            await this.testHorizontalScrolling(element, result);

            // Test text sizing and contrast
            await this.testTextReadability(element, result);

            // Test Japanese character rendering if present
            await this.testJapaneseCharacters(element, result);

            console.log(`✅ Completed testing ${section.name} - Found ${result.issues.length} issues`);

        } catch (error) {
            console.error(`❌ Error testing ${section.name}:`, error.message);
            result.issues.push({
                type: 'TEST_ERROR',
                severity: 'HIGH',
                description: `Testing failed: ${error.message}`,
                recommendation: 'Review test implementation and section markup'
            });
        }

        return result;
    }

    async analyzeMobileReadability(element, result) {
        const readabilityIssues = await this.page.evaluate((el) => {
            const issues = [];
            const rect = el.getBoundingClientRect();

            // Check if content overflows viewport width
            if (rect.width > window.innerWidth) {
                issues.push({
                    type: 'CONTENT_OVERFLOW',
                    severity: 'HIGH',
                    description: `Section width (${Math.round(rect.width)}px) exceeds viewport width (${window.innerWidth}px)`,
                    recommendation: 'Implement responsive design to prevent horizontal scrolling'
                });
            }

            // Check for very small text
            const textElements = el.querySelectorAll('p, span, div, li, td, th, label');
            textElements.forEach((textEl, index) => {
                const styles = window.getComputedStyle(textEl);
                const fontSize = parseInt(styles.fontSize);
                
                if (fontSize < 14) {
                    issues.push({
                        type: 'TEXT_TOO_SMALL',
                        severity: 'MEDIUM',
                        description: `Text element ${index + 1} has font size ${fontSize}px (minimum recommended: 14px)`,
                        recommendation: 'Increase font size to at least 14px for mobile readability'
                    });
                }
            });

            // Check for inadequate line spacing
            const paragraphs = el.querySelectorAll('p');
            paragraphs.forEach((p, index) => {
                const styles = window.getComputedStyle(p);
                const lineHeight = parseFloat(styles.lineHeight);
                const fontSize = parseFloat(styles.fontSize);
                const ratio = lineHeight / fontSize;
                
                if (ratio < 1.4) {
                    issues.push({
                        type: 'LINE_HEIGHT_TOO_SMALL',
                        severity: 'LOW',
                        description: `Paragraph ${index + 1} has line height ratio ${ratio.toFixed(2)} (recommended: 1.4+)`,
                        recommendation: 'Increase line-height to improve text readability'
                    });
                }
            });

            return issues;
        }, element);

        result.issues.push(...readabilityIssues);
    }

    async testTouchTargets(element, result) {
        const touchTargetIssues = await this.page.evaluate((el) => {
            const issues = [];
            const minTouchSize = 44; // 44px minimum touch target size

            // Find all interactive elements
            const interactiveElements = el.querySelectorAll('a, button, input, select, textarea, [onclick], [role="button"]');
            
            interactiveElements.forEach((interactive, index) => {
                const rect = interactive.getBoundingClientRect();
                const elementId = interactive.id || interactive.className || `element-${index + 1}`;
                
                if (rect.width < minTouchSize || rect.height < minTouchSize) {
                    issues.push({
                        type: 'TOUCH_TARGET_TOO_SMALL',
                        severity: 'HIGH',
                        description: `Interactive element "${elementId}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum: ${minTouchSize}x${minTouchSize}px)`,
                        recommendation: 'Increase element size or add padding to meet minimum touch target requirements'
                    });
                }

                // Check for adequate spacing between touch targets
                const siblings = Array.from(interactive.parentElement?.children || [])
                    .filter(child => child !== interactive && (
                        child.tagName === 'A' || 
                        child.tagName === 'BUTTON' || 
                        child.hasAttribute('onclick') ||
                        child.getAttribute('role') === 'button'
                    ));

                siblings.forEach(sibling => {
                    const siblingRect = sibling.getBoundingClientRect();
                    const distance = Math.min(
                        Math.abs(rect.right - siblingRect.left),
                        Math.abs(rect.left - siblingRect.right),
                        Math.abs(rect.bottom - siblingRect.top),
                        Math.abs(rect.top - siblingRect.bottom)
                    );

                    if (distance < 8) {
                        issues.push({
                            type: 'TOUCH_TARGETS_TOO_CLOSE',
                            severity: 'MEDIUM',
                            description: `Touch targets "${elementId}" are only ${Math.round(distance)}px apart (recommended: 8px minimum)`,
                            recommendation: 'Add margin or padding between interactive elements'
                        });
                    }
                });
            });

            return issues;
        }, element);

        result.issues.push(...touchTargetIssues);
    }

    async testHorizontalScrolling(element, result) {
        const scrollIssues = await this.page.evaluate((el) => {
            const issues = [];
            
            // Check if the section causes horizontal scrolling
            const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
            
            if (hasHorizontalScroll) {
                issues.push({
                    type: 'HORIZONTAL_SCROLL',
                    severity: 'HIGH',
                    description: 'Page has horizontal scrolling on mobile viewport',
                    recommendation: 'Implement responsive design to eliminate horizontal scrolling'
                });
            }

            // Check for elements that extend beyond viewport
            const allElements = el.querySelectorAll('*');
            allElements.forEach((element, index) => {
                const rect = element.getBoundingClientRect();
                if (rect.right > window.innerWidth) {
                    const elementInfo = element.tagName.toLowerCase() + 
                        (element.id ? `#${element.id}` : '') +
                        (element.className ? `.${element.className.split(' ')[0]}` : '');
                    
                    issues.push({
                        type: 'ELEMENT_OVERFLOW',
                        severity: 'MEDIUM',
                        description: `Element ${elementInfo} extends ${Math.round(rect.right - window.innerWidth)}px beyond viewport`,
                        recommendation: 'Apply max-width: 100% or implement responsive sizing'
                    });
                }
            });

            return issues;
        }, element);

        result.issues.push(...scrollIssues);
    }

    async testTextReadability(element, result) {
        const textIssues = await this.page.evaluate((el) => {
            const issues = [];

            // Function to calculate color contrast ratio
            const getContrastRatio = (color1, color2) => {
                const getLuminance = (r, g, b) => {
                    const sRGB = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
                };

                const parseRGB = (color) => {
                    const rgb = color.match(/\d+/g);
                    return rgb ? rgb.map(Number) : [0, 0, 0];
                };

                const [r1, g1, b1] = parseRGB(color1);
                const [r2, g2, b2] = parseRGB(color2);
                
                const lum1 = getLuminance(r1, g1, b1);
                const lum2 = getLuminance(r2, g2, b2);
                
                const brightest = Math.max(lum1, lum2);
                const darkest = Math.min(lum1, lum2);
                
                return (brightest + 0.05) / (darkest + 0.05);
            };

            // Check text contrast
            const textElements = el.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li, a, button, label');
            textElements.forEach((textEl, index) => {
                const styles = window.getComputedStyle(textEl);
                const textColor = styles.color;
                const backgroundColor = styles.backgroundColor;
                
                if (textColor && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    const contrast = getContrastRatio(textColor, backgroundColor);
                    
                    if (contrast < 4.5) {
                        issues.push({
                            type: 'LOW_CONTRAST',
                            severity: 'MEDIUM',
                            description: `Text element ${index + 1} has contrast ratio ${contrast.toFixed(2)} (minimum: 4.5)`,
                            recommendation: 'Increase color contrast between text and background'
                        });
                    }
                }
            });

            // Check for very long lines of text
            const paragraphs = el.querySelectorAll('p');
            paragraphs.forEach((p, index) => {
                const rect = p.getBoundingClientRect();
                const charactersPerLine = p.textContent.length * (rect.width / p.scrollWidth);
                
                if (charactersPerLine > 75) {
                    issues.push({
                        type: 'LINE_TOO_LONG',
                        severity: 'LOW',
                        description: `Paragraph ${index + 1} has approximately ${Math.round(charactersPerLine)} characters per line (recommended: 45-75)`,
                        recommendation: 'Consider reducing line length for better readability'
                    });
                }
            });

            return issues;
        }, element);

        result.issues.push(...textIssues);
    }

    async testJapaneseCharacters(element, result) {
        const japaneseIssues = await this.page.evaluate((el) => {
            const issues = [];
            const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

            // Find elements with Japanese text
            const allTextElements = el.querySelectorAll('*');
            allTextElements.forEach((textEl, index) => {
                const text = textEl.textContent || textEl.innerText || '';
                
                if (japaneseRegex.test(text)) {
                    const styles = window.getComputedStyle(textEl);
                    const fontSize = parseInt(styles.fontSize);
                    const fontFamily = styles.fontFamily;
                    
                    // Check if font size is adequate for Japanese characters
                    if (fontSize < 16) {
                        issues.push({
                            type: 'JAPANESE_FONT_TOO_SMALL',
                            severity: 'MEDIUM',
                            description: `Japanese text in element ${index + 1} has font size ${fontSize}px (recommended: 16px+ for Japanese)`,
                            recommendation: 'Increase font size for Japanese characters to improve readability'
                        });
                    }

                    // Check for appropriate font family
                    if (!fontFamily.includes('Noto') && !fontFamily.includes('Hiragino') && !fontFamily.includes('Yu Gothic')) {
                        issues.push({
                            type: 'JAPANESE_FONT_FAMILY',
                            severity: 'LOW',
                            description: `Japanese text using font: ${fontFamily}. Consider Japanese-optimized fonts`,
                            recommendation: 'Use fonts optimized for Japanese characters (e.g., Noto Sans JP, Hiragino Sans)'
                        });
                    }
                }
            });

            return issues;
        }, element);

        result.issues.push(...japaneseIssues);
    }

    async generateReport() {
        console.log('\n📊 Generating Mobile Readability Test Report...');

        // Create screenshots directory if it doesn't exist
        const screenshotsDir = path.join(__dirname, 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        const reportData = {
            testSuite: 'Mobile Readability Comprehensive Test',
            timestamp: new Date().toISOString(),
            viewport: this.viewport,
            totalSections: this.testResults.length,
            totalIssues: this.testResults.reduce((sum, result) => sum + result.issues.length, 0),
            sections: this.testResults,
            summary: this.generateSummary()
        };

        // Save detailed JSON report
        const jsonReportPath = path.join(__dirname, 'mobile-readability-test-report.json');
        fs.writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2));

        // Generate markdown report
        const markdownReport = this.generateMarkdownReport(reportData);
        const mdReportPath = path.join(__dirname, 'mobile-readability-test-report.md');
        fs.writeFileSync(mdReportPath, markdownReport);

        console.log(`📄 Reports generated:`);
        console.log(`   - JSON: ${jsonReportPath}`);
        console.log(`   - Markdown: ${mdReportPath}`);
        console.log(`   - Screenshots: ${screenshotsDir}`);

        return reportData;
    }

    generateSummary() {
        const summary = {
            sectionsFound: 0,
            sectionsNotFound: 0,
            highSeverityIssues: 0,
            mediumSeverityIssues: 0,
            lowSeverityIssues: 0,
            issuesByType: {}
        };

        this.testResults.forEach(result => {
            if (result.issues.some(issue => issue.type === 'SECTION_NOT_FOUND')) {
                summary.sectionsNotFound++;
            } else {
                summary.sectionsFound++;
            }

            result.issues.forEach(issue => {
                switch (issue.severity) {
                    case 'HIGH': summary.highSeverityIssues++; break;
                    case 'MEDIUM': summary.mediumSeverityIssues++; break;
                    case 'LOW': summary.lowSeverityIssues++; break;
                }

                summary.issuesByType[issue.type] = (summary.issuesByType[issue.type] || 0) + 1;
            });
        });

        return summary;
    }

    generateMarkdownReport(reportData) {
        let markdown = `# Mobile Readability Test Report\n\n`;
        markdown += `**Test Date:** ${new Date(reportData.timestamp).toLocaleString()}\n`;
        markdown += `**Viewport:** iPhone 12 (${reportData.viewport.width}x${reportData.viewport.height})\n`;
        markdown += `**Total Sections Tested:** ${reportData.totalSections}\n`;
        markdown += `**Total Issues Found:** ${reportData.totalIssues}\n\n`;

        // Summary
        markdown += `## Summary\n\n`;
        markdown += `- ✅ Sections Found: ${reportData.summary.sectionsFound}\n`;
        markdown += `- ❌ Sections Not Found: ${reportData.summary.sectionsNotFound}\n`;
        markdown += `- 🔴 High Severity Issues: ${reportData.summary.highSeverityIssues}\n`;
        markdown += `- 🟡 Medium Severity Issues: ${reportData.summary.mediumSeverityIssues}\n`;
        markdown += `- 🟢 Low Severity Issues: ${reportData.summary.lowSeverityIssues}\n\n`;

        // Issues by type
        markdown += `## Issues by Type\n\n`;
        Object.entries(reportData.summary.issuesByType).forEach(([type, count]) => {
            markdown += `- ${type.replace(/_/g, ' ')}: ${count}\n`;
        });
        markdown += `\n`;

        // Section details
        markdown += `## Section Details\n\n`;
        reportData.sections.forEach(section => {
            markdown += `### ${section.sectionName}\n\n`;
            markdown += `**Description:** ${section.description}\n`;
            markdown += `**Selector:** \`${section.selector}\`\n`;
            markdown += `**Issues Found:** ${section.issues.length}\n\n`;

            if (section.screenshots.length > 0) {
                markdown += `**Screenshots:**\n`;
                section.screenshots.forEach(screenshot => {
                    markdown += `- ![${section.sectionName}](screenshots/${screenshot})\n`;
                });
                markdown += `\n`;
            }

            if (section.issues.length > 0) {
                markdown += `**Issues:**\n\n`;
                section.issues.forEach((issue, index) => {
                    const severityIcon = issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟡' : '🟢';
                    markdown += `${index + 1}. ${severityIcon} **${issue.type.replace(/_/g, ' ')}** (${issue.severity})\n`;
                    markdown += `   - ${issue.description}\n`;
                    markdown += `   - **Recommendation:** ${issue.recommendation}\n\n`;
                });
            } else {
                markdown += `✅ No issues found in this section.\n\n`;
            }

            markdown += `---\n\n`;
        });

        return markdown;
    }

    async runComprehensiveTest() {
        try {
            await this.initialize();
            await this.navigateToSite();

            console.log(`\n🧪 Starting comprehensive mobile readability testing of ${this.sections.length} sections...\n`);

            // Test each section
            for (const section of this.sections) {
                const result = await this.testSection(section);
                this.testResults.push(result);
                
                // Brief pause between sections
                await this.page.waitForTimeout(1000);
            }

            // Generate reports
            const reportData = await this.generateReport();

            // Print summary to console
            console.log('\n🏁 TESTING COMPLETE');
            console.log('==================');
            console.log(`Total Sections: ${reportData.totalSections}`);
            console.log(`Sections Found: ${reportData.summary.sectionsFound}`);
            console.log(`Sections Not Found: ${reportData.summary.sectionsNotFound}`);
            console.log(`Total Issues: ${reportData.totalIssues}`);
            console.log(`High Severity: ${reportData.summary.highSeverityIssues}`);
            console.log(`Medium Severity: ${reportData.summary.mediumSeverityIssues}`);
            console.log(`Low Severity: ${reportData.summary.lowSeverityIssues}`);

            return reportData;

        } catch (error) {
            console.error('❌ Test execution failed:', error);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the test if called directly
if (require.main === module) {
    const tester = new MobileReadabilityTester();
    tester.runComprehensiveTest()
        .then(results => {
            console.log('\n✅ Mobile readability testing completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Mobile readability testing failed:', error);
            process.exit(1);
        });
}

module.exports = MobileReadabilityTester;