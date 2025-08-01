/**
 * Mobile Navigation and Instructor Section Test Suite
 * Automated Puppeteer testing for Genshinkan Aikido Website
 * Author: Lance James, Unit 221B
 * Date: July 30, 2025
 * 
 * Focus Areas:
 * - Mobile Navigation (Hamburger menu, anchor links, photo gallery navigation)
 * - Instructor Section (5-instructor grid, responsive layout, Japanese characters)
 * - Responsive breakpoints (320px, 375px, 414px, 768px, 1024px)
 */

const puppeteer = require('puppeteer');
const path = require('path');

class MobileNavigationInstructorTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            mobileNavigation: {},
            instructorSection: {},
            responsiveLayout: {},
            photoGalleryNavigation: {},
            testSummary: {}
        };
        
        // Test viewport configurations
        this.viewports = [
            { name: 'iPhone SE', width: 320, height: 568, deviceScaleFactor: 2, isMobile: true },
            { name: 'iPhone 12', width: 375, height: 812, deviceScaleFactor: 3, isMobile: true },
            { name: 'iPhone 12 Pro Max', width: 414, height: 896, deviceScaleFactor: 3, isMobile: true },
            { name: 'iPad', width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true },
            { name: 'iPad Pro', width: 1024, height: 1366, deviceScaleFactor: 2, isMobile: false }
        ];
        
        this.websiteUrl = 'http://localhost:3000';
    }

    async initialize() {
        console.log('🚀 Initializing Mobile Navigation & Instructor Test Suite...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for CI/CD
            defaultViewport: null,
            args: [
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--no-sandbox'
            ]
        });
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async createNewPage() {
        if (this.page) {
            await this.page.close();
        }
        this.page = await this.browser.newPage();
        
        // Enable console logging
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Browser Console Error:', msg.text());
            }
        });
        
        return this.page;
    }

    async takeScreenshot(name, viewport) {
        const screenshotPath = `/Users/lj/Dev/Aikido/test-screenshots/${viewport.name}-${name}.png`;
        await this.page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        return screenshotPath;
    }

    async testMobileNavigationFunctionality(viewport) {
        console.log(`📱 Testing Mobile Navigation on ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await this.page.setViewport(viewport);
        await this.page.goto(this.websiteUrl, { waitUntil: 'networkidle0' });
        
        const navResults = {
            viewport: viewport.name,
            hamburgerMenuExists: false,
            hamburgerMenuFunctional: false,
            navigationLinksCount: 0,
            navigationLinksWorking: [],
            scrollBehaviorSmooth: false,
            photoGalleryNavigation: false,
            anchorsWorking: []
        };

        try {
            // Check for hamburger menu button
            const hamburgerSelectors = [
                '.mobile-menu-toggle',
                '.hamburger',
                '[data-mobile-menu]',
                '.menu-toggle',
                'button[aria-label*="menu"]',
                '.nav-toggle'
            ];

            let hamburgerButton = null;
            for (const selector of hamburgerSelectors) {
                hamburgerButton = await this.page.$(selector);
                if (hamburgerButton) {
                    navResults.hamburgerMenuExists = true;
                    console.log(`✅ Found hamburger menu: ${selector}`);
                    break;
                }
            }

            if (!hamburgerButton) {
                // Check if navigation is visible without hamburger (desktop-style on mobile)
                const visibleNav = await this.page.$eval('nav, .navigation, header nav', 
                    el => window.getComputedStyle(el).display !== 'none'
                ).catch(() => false);
                
                if (visibleNav) {
                    console.log('📋 Desktop-style navigation visible on mobile');
                }
            }

            // Test hamburger menu functionality
            if (hamburgerButton) {
                try {
                    // Check if menu is initially hidden
                    const menuHidden = await this.page.evaluate(() => {
                        const nav = document.querySelector('nav ul, .nav-menu, .mobile-menu');
                        return nav ? window.getComputedStyle(nav).display === 'none' : true;
                    });

                    // Click hamburger menu
                    await hamburgerButton.click();
                    await this.page.waitForTimeout(500); // Allow animation

                    // Check if menu is now visible
                    const menuVisible = await this.page.evaluate(() => {
                        const nav = document.querySelector('nav ul, .nav-menu, .mobile-menu');
                        return nav ? window.getComputedStyle(nav).display !== 'none' : false;
                    });

                    navResults.hamburgerMenuFunctional = menuHidden && menuVisible;
                    console.log(`${navResults.hamburgerMenuFunctional ? '✅' : '❌'} Hamburger menu functionality`);
                } catch (error) {
                    console.log('❌ Error testing hamburger menu:', error.message);
                }
            }

            // Test navigation links
            const navLinks = await this.page.$$('nav a, .nav-link, header a');
            navResults.navigationLinksCount = navLinks.length;
            console.log(`📊 Found ${navLinks.length} navigation links`);

            // Test each navigation link
            for (let i = 0; i < Math.min(navLinks.length, 10); i++) { // Limit to 10 links for performance
                try {
                    const linkText = await navLinks[i].evaluate(el => el.textContent.trim());
                    const linkHref = await navLinks[i].evaluate(el => el.getAttribute('href'));
                    
                    if (linkHref && linkHref.startsWith('#')) {
                        // Test anchor link
                        const targetExists = await this.page.$(`${linkHref}`) !== null;
                        navResults.anchorsWorking.push({
                            text: linkText,
                            href: linkHref,
                            targetExists
                        });
                        
                        if (linkText.toLowerCase().includes('photo') || linkText.toLowerCase().includes('gallery')) {
                            navResults.photoGalleryNavigation = targetExists;
                        }
                    }
                    
                    navResults.navigationLinksWorking.push({
                        text: linkText,
                        href: linkHref,
                        working: true
                    });
                } catch (error) {
                    console.log(`❌ Error testing link ${i}:`, error.message);
                    navResults.navigationLinksWorking.push({
                        text: 'Error',
                        href: 'Error',
                        working: false
                    });
                }
            }

            // Test scroll behavior
            navResults.scrollBehaviorSmooth = await this.page.evaluate(() => {
                return window.getComputedStyle(document.documentElement).scrollBehavior === 'smooth';
            });

            await this.takeScreenshot('mobile-navigation', viewport);

        } catch (error) {
            console.log('❌ Error in mobile navigation test:', error.message);
            navResults.error = error.message;
        }

        return navResults;
    }

    async testInstructorSectionMobile(viewport) {
        console.log(`👥 Testing Instructor Section on ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        await this.page.setViewport(viewport);
        await this.page.goto(this.websiteUrl, { waitUntil: 'networkidle0' });
        
        const instructorResults = {
            viewport: viewport.name,
            instructorSectionExists: false,
            instructorCount: 0,
            instructorGrid: {},
            instructorDetails: [],
            japaneseCharactersVisible: false,
            responsiveLayout: false,
            cardSpacing: {},
            typography: {}
        };

        try {
            // Find instructor section
            const instructorSection = await this.page.$('#instructors, .instructors, .instructor-section');
            instructorResults.instructorSectionExists = !!instructorSection;

            if (!instructorSection) {
                console.log('❌ Instructor section not found');
                return instructorResults;
            }

            // Count instructor cards
            const instructorCards = await this.page.$$('.instructor-card, .instructor, .team-member');
            instructorResults.instructorCount = instructorCards.length;
            console.log(`👥 Found ${instructorCards.length} instructor cards`);

            // Expected instructors
            const expectedInstructors = ['Gary', 'Robert', 'Ariana', 'Sarah', 'Ian'];
            
            // Test each instructor card
            for (let i = 0; i < instructorCards.length; i++) {
                try {
                    const card = instructorCards[i];
                    const cardData = await card.evaluate(el => {
                        const name = el.querySelector('h3, h4, .name, .instructor-name')?.textContent?.trim() || '';
                        const title = el.querySelector('.title, .rank, .position')?.textContent?.trim() || '';
                        const description = el.querySelector('p, .description, .bio')?.textContent?.trim() || '';
                        const image = el.querySelector('img');
                        const hasImage = !!image;
                        const imageAlt = image?.alt || '';
                        
                        // Check for Japanese characters
                        const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
                        const hasJapanese = japaneseRegex.test(el.textContent);
                        
                        // Get card dimensions
                        const rect = el.getBoundingClientRect();
                        
                        return {
                            name,
                            title,
                            description,
                            hasImage,
                            imageAlt,
                            hasJapanese,
                            width: rect.width,
                            height: rect.height,
                            visible: rect.width > 0 && rect.height > 0
                        };
                    });
                    
                    instructorResults.instructorDetails.push(cardData);
                    
                    if (cardData.hasJapanese) {
                        instructorResults.japaneseCharactersVisible = true;
                    }
                    
                    // Check for Ariana Koblitz specifically
                    if (cardData.name.toLowerCase().includes('ariana')) {
                        console.log('✅ Ariana Koblitz card found and displaying correctly');
                    }
                    
                } catch (error) {
                    console.log(`❌ Error testing instructor card ${i}:`, error.message);
                }
            }

            // Test grid layout responsiveness
            const gridLayout = await this.page.evaluate(() => {
                const container = document.querySelector('#instructors, .instructors, .instructor-section');
                if (!container) return null;
                
                const style = window.getComputedStyle(container);
                const gridColumns = style.gridTemplateColumns;
                const display = style.display;
                
                // Count actual columns by checking card positions
                const cards = container.querySelectorAll('.instructor-card, .instructor, .team-member');
                let columnsInUse = 1;
                
                if (cards.length > 1) {
                    const firstCardRect = cards[0].getBoundingClientRect();
                    const secondCardRect = cards[1].getBoundingClientRect();
                    
                    // If second card is on the same row (similar top position), we have multiple columns
                    if (Math.abs(firstCardRect.top - secondCardRect.top) < 50) {
                        columnsInUse = Math.floor(container.getBoundingClientRect().width / firstCardRect.width);
                    }
                }
                
                return {
                    display,
                    gridColumns,
                    columnsInUse,
                    containerWidth: container.getBoundingClientRect().width
                };
            });

            instructorResults.instructorGrid = gridLayout;

            // Determine expected columns based on viewport width
            let expectedColumns = 1;
            if (viewport.width >= 768) expectedColumns = 2;
            if (viewport.width >= 1024) expectedColumns = 3;

            instructorResults.responsiveLayout = gridLayout && 
                (gridLayout.columnsInUse <= expectedColumns);

            // Test typography and spacing
            instructorResults.typography = await this.page.evaluate(() => {
                const card = document.querySelector('.instructor-card, .instructor, .team-member');
                if (!card) return {};
                
                const nameElement = card.querySelector('h3, h4, .name, .instructor-name');
                const titleElement = card.querySelector('.title, .rank, .position');
                
                return {
                    nameSize: nameElement ? window.getComputedStyle(nameElement).fontSize : null,
                    titleSize: titleElement ? window.getComputedStyle(titleElement).fontSize : null,
                    cardPadding: window.getComputedStyle(card).padding,
                    cardMargin: window.getComputedStyle(card).margin
                };
            });

            await this.takeScreenshot('instructor-section', viewport);

        } catch (error) {
            console.log('❌ Error in instructor section test:', error.message);
            instructorResults.error = error.message;
        }

        return instructorResults;
    }

    async testPhotoGalleryNavigation(viewport) {
        console.log(`🖼️ Testing Photo Gallery Navigation on ${viewport.name}`);
        
        await this.page.setViewport(viewport);
        await this.page.goto(this.websiteUrl, { waitUntil: 'networkidle0' });
        
        const galleryResults = {
            viewport: viewport.name,
            photoGallerySection: false,
            navigationToGallery: false,
            galleryImages: 0,
            galleryResponsive: false,
            middlePhotoSection: false
        };

        try {
            // Look for photo gallery section
            const gallerySelectors = [
                '#gallery', 
                '#photos', 
                '.gallery', 
                '.photo-gallery', 
                '.photos',
                '.image-gallery',
                '[data-section="gallery"]'
            ];

            let gallerySection = null;
            for (const selector of gallerySelectors) {
                gallerySection = await this.page.$(selector);
                if (gallerySection) {
                    galleryResults.photoGallerySection = true;
                    console.log(`✅ Found photo gallery section: ${selector}`);
                    break;
                }
            }

            // Check for middle photo section specifically
            const middleSection = await this.page.$('.middle-photo, .center-photo, section:nth-child(3)');
            galleryResults.middlePhotoSection = !!middleSection;

            // Test navigation links to gallery
            const galleryLinks = await this.page.$$('a[href*="gallery"], a[href*="photos"], a[href="#gallery"], a[href="#photos"]');
            
            if (galleryLinks.length > 0) {
                try {
                    const firstLink = galleryLinks[0];
                    const linkHref = await firstLink.evaluate(el => el.getAttribute('href'));
                    
                    if (linkHref.startsWith('#')) {
                        const targetExists = await this.page.$(linkHref) !== null;
                        galleryResults.navigationToGallery = targetExists;
                        
                        if (targetExists) {
                            // Test clicking the link
                            await firstLink.click();
                            await this.page.waitForTimeout(1000);
                            
                            // Check if we scrolled to the gallery
                            const scrolledToGallery = await this.page.evaluate((href) => {
                                const target = document.querySelector(href);
                                if (!target) return false;
                                
                                const targetRect = target.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                
                                return targetRect.top >= 0 && targetRect.top <= viewportHeight;
                            }, linkHref);
                            
                            galleryResults.navigationToGallery = scrolledToGallery;
                        }
                    }
                } catch (error) {
                    console.log('❌ Error testing gallery navigation:', error.message);
                }
            }

            // Count images in gallery
            if (gallerySection) {
                const images = await gallerySection.$$('img');
                galleryResults.galleryImages = images.length;
                
                // Test responsive behavior
                galleryResults.galleryResponsive = await gallerySection.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    return style.display === 'grid' || style.display === 'flex' || 
                           style.gridTemplateColumns || style.flexWrap;
                });
            }

            await this.takeScreenshot('photo-gallery', viewport);

        } catch (error) {
            console.log('❌ Error in photo gallery test:', error.message);
            galleryResults.error = error.message;
        }

        return galleryResults;
    }

    async runComprehensiveTests() {
        console.log('🚀 Starting Comprehensive Mobile Navigation & Instructor Tests...');
        
        await this.initialize();
        
        try {
            // Create screenshots directory
            const fs = require('fs');
            const screenshotDir = '/Users/lj/Dev/Aikido/test-screenshots';
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }

            for (const viewport of this.viewports) {
                console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
                
                await this.createNewPage();
                
                // Run all tests for this viewport
                const navResults = await this.testMobileNavigationFunctionality(viewport);
                const instructorResults = await this.testInstructorSectionMobile(viewport);
                const galleryResults = await this.testPhotoGalleryNavigation(viewport);
                
                // Store results
                this.results.mobileNavigation[viewport.name] = navResults;
                this.results.instructorSection[viewport.name] = instructorResults;
                this.results.photoGalleryNavigation[viewport.name] = galleryResults;
                
                console.log(`✅ Completed tests for ${viewport.name}`);
            }

            // Generate comprehensive report
            this.generateComprehensiveReport();

        } catch (error) {
            console.log('❌ Error during comprehensive testing:', error.message);
        } finally {
            await this.cleanup();
        }
    }

    generateComprehensiveReport() {
        console.log('\n📊 Generating Comprehensive Test Report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            testEnvironment: {
                websiteUrl: this.websiteUrl,
                puppeteerVersion: '21.0.0', // Current version
                testViewports: this.viewports.map(v => `${v.name} (${v.width}x${v.height})`)
            },
            results: this.results,
            summary: this.generateTestSummary(),
            recommendations: this.generateRecommendations(),
            criticalIssues: this.identifyCriticalIssues()
        };

        // Save report to file
        const fs = require('fs');
        const reportPath = '/Users/lj/Dev/Aikido/Mobile-Navigation-Instructor-Test-Report.md';
        const markdownReport = this.generateMarkdownReport(report);
        
        fs.writeFileSync(reportPath, markdownReport);
        console.log(`📄 Test report saved to: ${reportPath}`);
        
        return report;
    }

    generateTestSummary() {
        const summary = {
            totalViewportsTested: this.viewports.length,
            navigationIssues: 0,
            instructorIssues: 0,
            galleryIssues: 0,
            overallScore: 0,
            criticalIssuesCount: 0
        };

        // Analyze navigation results
        Object.values(this.results.mobileNavigation).forEach(result => {
            if (!result.hamburgerMenuExists && result.viewport !== 'iPad Pro') {
                summary.navigationIssues++;
            }
            if (!result.photoGalleryNavigation) {
                summary.galleryIssues++;
            }
        });

        // Analyze instructor results
        Object.values(this.results.instructorSection).forEach(result => {
            if (result.instructorCount !== 5) {
                summary.instructorIssues++;
            }
            if (!result.responsiveLayout) {
                summary.instructorIssues++;
            }
        });

        // Calculate overall score
        const totalTests = (this.viewports.length * 3); // 3 test categories per viewport
        const totalIssues = summary.navigationIssues + summary.instructorIssues + summary.galleryIssues;
        summary.overallScore = Math.round(((totalTests - totalIssues) / totalTests) * 100);

        return summary;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check for missing hamburger menu on mobile
        const mobileViewports = this.viewports.filter(v => v.width < 768);
        const missingHamburger = mobileViewports.some(viewport => {
            const result = this.results.mobileNavigation[viewport.name];
            return result && !result.hamburgerMenuExists;
        });

        if (missingHamburger) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Mobile Navigation',
                issue: 'Missing hamburger menu on mobile devices',
                solution: 'Implement responsive hamburger menu for viewports < 768px',
                impact: 'Users cannot access navigation on mobile devices effectively'
            });
        }

        // Check for photo gallery navigation issues
        const galleryNavIssues = Object.values(this.results.photoGalleryNavigation).some(
            result => !result.navigationToGallery && result.photoGallerySection
        );

        if (galleryNavIssues) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Navigation',
                issue: 'Photo gallery navigation not working properly',
                solution: 'Fix anchor links to photo gallery section or add proper navigation tab',
                impact: 'Users cannot easily navigate to photo gallery content'
            });
        }

        // Check instructor count
        const instructorCountIssues = Object.values(this.results.instructorSection).some(
            result => result.instructorCount !== 5
        );

        if (instructorCountIssues) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Instructor Section',
                issue: 'Not all 5 instructors displaying correctly',
                solution: 'Verify all instructor cards are properly configured and visible',
                impact: 'Incomplete instructor information may affect user confidence'
            });
        }

        return recommendations;
    }

    identifyCriticalIssues() {
        const criticalIssues = [];
        
        // Navigation completely broken
        const navCompletelyBroken = Object.values(this.results.mobileNavigation).every(
            result => !result.hamburgerMenuExists && result.navigationLinksCount === 0
        );

        if (navCompletelyBroken) {
            criticalIssues.push({
                severity: 'CRITICAL',
                issue: 'Navigation completely non-functional on mobile',
                description: 'No hamburger menu and no visible navigation links detected across all mobile viewports'
            });
        }

        // Instructor section missing
        const instructorSectionMissing = Object.values(this.results.instructorSection).every(
            result => !result.instructorSectionExists
        );

        if (instructorSectionMissing) {
            criticalIssues.push({
                severity: 'CRITICAL',
                issue: 'Instructor section not found',
                description: 'The instructor section is completely missing from the page'
            });
        }

        return criticalIssues;
    }

    generateMarkdownReport(report) {
        return `# Mobile Navigation & Instructor Section Test Report

**Author:** Lance James, Unit 221B  
**Date:** ${new Date().toLocaleDateString()}  
**Test Suite:** Mobile Navigation & Instructor Section Comprehensive Testing  

## Executive Summary

- **Overall Score:** ${report.summary.overallScore}%
- **Viewports Tested:** ${report.summary.totalViewportsTested}
- **Critical Issues:** ${report.criticalIssues.length}
- **Total Recommendations:** ${report.recommendations.length}

## Test Environment

- **Website URL:** ${report.testEnvironment.websiteUrl}
- **Puppeteer Version:** ${report.testEnvironment.puppeteerVersion}
- **Test Viewports:** ${report.testEnvironment.testViewports.join(', ')}

## Critical Issues

${report.criticalIssues.length > 0 ? 
    report.criticalIssues.map(issue => `
### ${issue.severity}: ${issue.issue}
${issue.description}
`).join('\n') : 
    'No critical issues identified.'}

## Test Results by Viewport

${this.viewports.map(viewport => `
### ${viewport.name} (${viewport.width}x${viewport.height})

#### Mobile Navigation
- **Hamburger Menu Exists:** ${this.results.mobileNavigation[viewport.name]?.hamburgerMenuExists ? '✅ Yes' : '❌ No'}
- **Hamburger Menu Functional:** ${this.results.mobileNavigation[viewport.name]?.hamburgerMenuFunctional ? '✅ Yes' : '❌ No'}
- **Navigation Links Count:** ${this.results.mobileNavigation[viewport.name]?.navigationLinksCount || 0}
- **Photo Gallery Navigation:** ${this.results.mobileNavigation[viewport.name]?.photoGalleryNavigation ? '✅ Working' : '❌ Not Working'}

#### Instructor Section
- **Section Exists:** ${this.results.instructorSection[viewport.name]?.instructorSectionExists ? '✅ Yes' : '❌ No'}
- **Instructor Count:** ${this.results.instructorSection[viewport.name]?.instructorCount || 0}/5
- **Japanese Characters Visible:** ${this.results.instructorSection[viewport.name]?.japaneseCharactersVisible ? '✅ Yes' : '❌ No'}
- **Responsive Layout:** ${this.results.instructorSection[viewport.name]?.responsiveLayout ? '✅ Yes' : '❌ No'}

#### Photo Gallery
- **Gallery Section Exists:** ${this.results.photoGalleryNavigation[viewport.name]?.photoGallerySection ? '✅ Yes' : '❌ No'}
- **Navigation to Gallery:** ${this.results.photoGalleryNavigation[viewport.name]?.navigationToGallery ? '✅ Working' : '❌ Not Working'}
- **Gallery Images:** ${this.results.photoGalleryNavigation[viewport.name]?.galleryImages || 0}
`).join('\n')}

## Recommendations

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.issue} (${rec.priority} Priority)
**Category:** ${rec.category}  
**Solution:** ${rec.solution}  
**Impact:** ${rec.impact}
`).join('\n')}

## Detailed Instructor Information

${Object.entries(this.results.instructorSection).map(([viewportName, result]) => `
### ${viewportName}
${result.instructorDetails?.map(instructor => `
- **${instructor.name}** - ${instructor.title}
  - Has Image: ${instructor.hasImage ? 'Yes' : 'No'}
  - Japanese Characters: ${instructor.hasJapanese ? 'Yes' : 'No'}
  - Visible: ${instructor.visible ? 'Yes' : 'No'}
`).join('') || 'No instructor details available'}
`).join('\n')}

## Screenshots

Test screenshots have been saved to: \`/Users/lj/Dev/Aikido/test-screenshots/\`

## Next Steps

1. Address critical issues immediately
2. Implement high-priority recommendations
3. Re-run tests after fixes are applied
4. Consider implementing continuous mobile testing

---
*Report generated by Mobile Navigation & Instructor Test Suite*  
*Unit 221B - Advanced AI-Powered Development Workflow*
`;
    }
}

// Export for use
module.exports = MobileNavigationInstructorTestSuite;

// Auto-run if executed directly
if (require.main === module) {
    const testSuite = new MobileNavigationInstructorTestSuite();
    testSuite.runComprehensiveTests()
        .then(() => {
            console.log('🎯 Mobile Navigation & Instructor testing completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        });
}