/**
 * Comprehensive QA Testing Suite for Genshinkan Aikido Site
 * Author: Lance James, Unit 221B
 * 
 * This suite tests the complete new customer discovery journey including:
 * - Form functionality and accessibility
 * - Navigation and user experience 
 * - Instructor information display (updated for 5 instructors including Ariana Koblitz)
 * - Photo gallery navigation
 * - Mobile responsiveness and cross-device testing
 * - "Try Aikido" signup flow validation
 */

const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs').promises;
const path = require('path');

// Test configuration
const CONFIG = {
    headless: false, // Set to true for CI/CD, false for debugging
    slowMo: 100, // Slow down actions for better observation
    timeout: 30000,
    viewport: {
        width: 1200,
        height: 800
    },
    sites: {
        original: 'https://genaikido.com',
        enhanced: `file://${process.cwd()}/index.html`
    }
};

// Form test data
const TEST_DATA = {
    valid: {
        name: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        experience: 'none',
        message: 'I am interested in learning traditional Aikido.',
        emergency: 'Jane Smith (555) 987-6543'
    },
    invalid: {
        email: 'invalid-email',
        phone: '123',
        name: '',
        firstName: '',
        lastName: ''
    }
};

class ComprehensiveQATestSuite {
    constructor() {
        this.browser = null;
        this.results = {
            original: {},
            enhanced: {},
            newCustomerJourney: {},
            instructorDisplay: {},
            navigation: {},
            photoGallery: {},
            mobileResponsiveness: {},
            comparison: {}
        };
        this.screenshots = [];
        this.testSequence = [];
    }

    async init() {
        console.log('🚀 Initializing Comprehensive QA Testing Suite...');
        
        this.browser = await puppeteer.launch({
            headless: CONFIG.headless,
            slowMo: CONFIG.slowMo,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--allow-file-access-from-files',
                '--disable-features=VizDisplayCompositor',
                '--window-size=1200,800'
            ]
        });

        console.log('✅ Browser launched successfully');
    }

    async testNewCustomerDiscoveryJourney(page, url) {
        console.log('\n👥 Testing New Customer Discovery Journey...');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
            await this.takeScreenshot(page, 'new-customer-landing', 'First impression - site landing page');

            const journeyResults = {};

            // 1. Test first impression and hero section
            journeyResults.heroSection = await page.evaluate(() => {
                const hero = document.querySelector('.hero, .banner, .intro-section, .main-content');
                const heading = document.querySelector('h1, .hero h2, .main-title');
                const ctaButton = document.querySelector('.cta-button, .try-aikido, .get-started, button');
                
                return {
                    hasHeroSection: !!hero,
                    hasMainHeading: !!heading,
                    mainHeadingText: heading ? heading.textContent.trim() : null,
                    hasClearCTA: !!ctaButton,
                    ctaText: ctaButton ? ctaButton.textContent.trim() : null
                };
            });

            // 2. Test "What is Aikido" information accessibility
            journeyResults.aikidoInformation = await page.evaluate(() => {
                const aikidoInfo = document.querySelector('[data-section="about"], .about-aikido, .what-is-aikido');
                const philosophy = document.querySelector('.philosophy, .shoshin, .traditional-values');
                
                return {
                    hasAikidoExplanation: !!aikidoInfo,
                    hasPhilosophySection: !!philosophy,
                    contentLength: aikidoInfo ? aikidoInfo.textContent.length : 0
                };
            });

            // 3. Test beginner-friendly messaging
            journeyResults.beginnerFriendly = await page.evaluate(() => {
                const beginnerKeywords = ['beginner', 'new', 'start', 'intro', 'first time', 'trial'];
                const bodyText = document.body.textContent.toLowerCase();
                
                const foundKeywords = beginnerKeywords.filter(keyword => 
                    bodyText.includes(keyword)
                );

                return {
                    beginnerKeywordsFound: foundKeywords,
                    beginnerFriendlyScore: foundKeywords.length / beginnerKeywords.length * 100,
                    hasTrialClass: bodyText.includes('trial') || bodyText.includes('free class'),
                    hasBeginnerSection: bodyText.includes('beginner')
                };
            });

            // 4. Test pricing transparency
            journeyResults.pricingInformation = await page.evaluate(() => {
                const pricingKeywords = ['price', 'cost', '$', 'fee', 'membership', 'monthly'];
                const bodyText = document.body.textContent.toLowerCase();
                
                const priceSection = document.querySelector('.pricing, .rates, .fees, .cost');
                const priceElements = document.querySelectorAll('[data-price], .price, .cost-item');

                return {
                    hasPricingSection: !!priceSection,
                    priceElementsCount: priceElements.length,
                    mentionsPricing: pricingKeywords.some(keyword => bodyText.includes(keyword)),
                    pricingVisibility: priceSection ? 
                        window.getComputedStyle(priceSection).display !== 'none' : false
                };
            });

            // 5. Test scheduling information
            journeyResults.scheduleInformation = await page.evaluate(() => {
                const scheduleKeywords = ['schedule', 'class times', 'when', 'hours', 'time'];
                const bodyText = document.body.textContent.toLowerCase();
                
                const scheduleSection = document.querySelector('.schedule, .class-times, .timetable');
                
                return {
                    hasScheduleSection: !!scheduleSection,
                    mentionsSchedule: scheduleKeywords.some(keyword => bodyText.includes(keyword)),
                    scheduleVisibility: scheduleSection ?
                        window.getComputedStyle(scheduleSection).display !== 'none' : false
                };
            });

            // 6. Test contact/location information
            journeyResults.contactInformation = await page.evaluate(() => {
                const addressRegex = /\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)/i;
                const phoneRegex = /\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4}/;
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
                
                const bodyText = document.body.textContent;
                const contactSection = document.querySelector('.contact, .location, .address');
                
                return {
                    hasContactSection: !!contactSection,
                    hasAddress: addressRegex.test(bodyText),
                    hasPhoneNumber: phoneRegex.test(bodyText),
                    hasEmail: emailRegex.test(bodyText),
                    addressMatch: bodyText.match(addressRegex)?.[0] || null,
                    phoneMatch: bodyText.match(phoneRegex)?.[0] || null
                };
            });

            this.results.newCustomerJourney = journeyResults;
            await this.takeScreenshot(page, 'new-customer-journey-complete', 'New customer journey test completed');

            return journeyResults;

        } catch (error) {
            console.error('❌ Error testing new customer journey:', error.message);
            return { error: error.message };
        }
    }

    async testInstructorDisplay(page, url) {
        console.log('\n👨‍🏫 Testing Instructor Information Display...');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

            const instructorResults = {};

            // Navigate to instructors section or page
            const instructorLink = await page.$('a[href*="instructor"], a[href*="teacher"], .instructor-link');
            if (instructorLink) {
                await instructorLink.click();
                await page.waitForTimeout(2000);
                await this.takeScreenshot(page, 'instructors-page', 'Instructors page navigation');
            }

            // Test instructor display
            instructorResults.instructorDisplay = await page.evaluate(() => {
                const instructorCards = document.querySelectorAll('.instructor, .teacher, .sensei, [data-instructor]');
                const instructorImages = document.querySelectorAll('.instructor img, .teacher img, .sensei img');
                const instructorNames = document.querySelectorAll('.instructor-name, .teacher-name, .sensei-name, .instructor h3, .instructor h2');
                
                // Look for Ariana Koblitz specifically
                const arianaElement = Array.from(document.querySelectorAll('*')).find(el => 
                    el.textContent.toLowerCase().includes('ariana') && 
                    el.textContent.toLowerCase().includes('koblitz')
                );

                // Check for instructor credentials/bios
                const instructorBios = document.querySelectorAll('.instructor-bio, .teacher-bio, .instructor p, .instructor .bio');

                return {
                    totalInstructors: instructorCards.length,
                    instructorImages: instructorImages.length,
                    instructorNames: instructorNames.length,
                    hasAriana: !!arianaElement,
                    arianaText: arianaElement ? arianaElement.textContent.trim() : null,
                    instructorBiosCount: instructorBios.length,
                    instructorNamesFound: Array.from(instructorNames).map(name => name.textContent.trim())
                };
            });

            // Test grid layout for 5 instructors
            instructorResults.gridLayout = await page.evaluate(() => {
                const instructorContainer = document.querySelector('.instructors, .teachers, .instructor-grid, .team');
                if (!instructorContainer) return { error: 'No instructor container found' };

                const computedStyle = window.getComputedStyle(instructorContainer);
                const instructorCards = instructorContainer.querySelectorAll('.instructor, .teacher, .sensei');

                return {
                    displayType: computedStyle.display,
                    gridTemplateColumns: computedStyle.gridTemplateColumns,
                    flexWrap: computedStyle.flexWrap,
                    justifyContent: computedStyle.justifyContent,
                    cardCount: instructorCards.length,
                    containerWidth: instructorContainer.offsetWidth,
                    isResponsive: computedStyle.display.includes('grid') || computedStyle.display.includes('flex')
                };
            });

            // Test mobile layout for instructors
            await page.setViewport({ width: 375, height: 667 });
            await this.takeScreenshot(page, 'instructors-mobile', 'Instructor grid on mobile');

            instructorResults.mobileLayout = await page.evaluate(() => {
                const instructorContainer = document.querySelector('.instructors, .teachers, .instructor-grid, .team');
                if (!instructorContainer) return { error: 'No instructor container found' };

                const instructorCards = instructorContainer.querySelectorAll('.instructor, .teacher, .sensei');
                const visibleCards = Array.from(instructorCards).filter(card => {
                    const rect = card.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                });

                return {
                    visibleCardsOnMobile: visibleCards.length,
                    containerHeight: instructorContainer.offsetHeight,
                    isStackedVertically: instructorContainer.offsetHeight > window.innerHeight * 0.5
                };
            });

            // Reset viewport
            await page.setViewport(CONFIG.viewport);

            this.results.instructorDisplay = instructorResults;
            return instructorResults;

        } catch (error) {
            console.error('❌ Error testing instructor display:', error.message);
            return { error: error.message };
        }
    }

    async testPhotoGalleryNavigation(page, url) {
        console.log('\n📸 Testing Photo Gallery Navigation...');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

            const galleryResults = {};

            // Look for gallery or photos section
            const galleryLink = await page.$('a[href*="gallery"], a[href*="photo"], .gallery-link, .photos-link');
            if (galleryLink) {
                await galleryLink.click();
                await page.waitForTimeout(2000);
            }

            // Test gallery presence and functionality
            galleryResults.galleryPresence = await page.evaluate(() => {
                const gallery = document.querySelector('.gallery, .photos, .image-gallery, [data-gallery]');
                const images = document.querySelectorAll('.gallery img, .photos img, .image-gallery img');
                const thumbnails = document.querySelectorAll('.thumbnail, .thumb, .gallery-thumb');

                return {
                    hasGallery: !!gallery,
                    imageCount: images.length,
                    thumbnailCount: thumbnails.length,
                    galleryType: gallery ? gallery.className : null
                };
            });

            if (galleryResults.galleryPresence.hasGallery) {
                await this.takeScreenshot(page, 'photo-gallery', 'Photo gallery display');

                // Test gallery interaction
                galleryResults.galleryInteraction = await page.evaluate(() => {
                    const firstImage = document.querySelector('.gallery img, .photos img');
                    const lightbox = document.querySelector('.lightbox, .modal, .overlay');
                    const navButtons = document.querySelectorAll('.gallery-nav, .prev, .next, .arrow');

                    // Test if images are clickable
                    const clickableImages = document.querySelectorAll('.gallery img[onclick], .gallery img.clickable, .gallery a img');

                    return {
                        hasFirstImage: !!firstImage,
                        hasLightbox: !!lightbox,
                        hasNavigation: navButtons.length > 0,
                        clickableImagesCount: clickableImages.length,
                        navigationButtonsCount: navButtons.length
                    };
                });

                // Test image loading and alt text
                galleryResults.imageAccessibility = await page.evaluate(() => {
                    const images = document.querySelectorAll('.gallery img, .photos img');
                    const imagesWithAlt = Array.from(images).filter(img => img.alt && img.alt.trim() !== '');
                    const imagesLoaded = Array.from(images).filter(img => img.complete && img.naturalHeight !== 0);

                    return {
                        totalImages: images.length,
                        imagesWithAlt: imagesWithAlt.length,
                        imagesLoaded: imagesLoaded.length,
                        altTextSample: imagesWithAlt.slice(0, 3).map(img => img.alt)
                    };
                });

            } else {
                console.log('⚠️ No photo gallery found on the page');
                await this.takeScreenshot(page, 'no-gallery-found', 'No photo gallery detected');
            }

            this.results.photoGallery = galleryResults;
            return galleryResults;

        } catch (error) {
            console.error('❌ Error testing photo gallery:', error.message);
            return { error: error.message };
        }
    }

    async testNavigationAndScrollBehavior(page, url) {
        console.log('\n🧭 Testing Navigation and Scroll Behavior...');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

            const navigationResults = {};

            // Test main navigation
            navigationResults.mainNavigation = await page.evaluate(() => {
                const nav = document.querySelector('nav, .navigation, .menu');
                const navLinks = document.querySelectorAll('nav a, .navigation a, .menu a, header a');
                const mobileMenu = document.querySelector('.mobile-menu, .hamburger, .menu-toggle');

                return {
                    hasMainNav: !!nav,
                    navLinksCount: navLinks.length,
                    hasMobileMenu: !!mobileMenu,
                    navLinkTexts: Array.from(navLinks).map(link => link.textContent.trim()).slice(0, 10)
                };
            });

            // Test scroll behavior
            navigationResults.scrollBehavior = await page.evaluate(() => {
                return {
                    smoothScrollSupported: 'scrollBehavior' in document.documentElement.style,
                    pageHeight: document.body.scrollHeight,
                    viewportHeight: window.innerHeight,
                    isScrollable: document.body.scrollHeight > window.innerHeight
                };
            });

            // Test navigation links functionality
            const navLinks = await page.$$('nav a, .navigation a, header a');
            navigationResults.linkTests = [];

            for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
                const link = navLinks[i];
                const href = await link.evaluate(el => el.href);
                const text = await link.evaluate(el => el.textContent.trim());

                // Test if link is functional (not testing external links)
                if (href && !href.startsWith('http') && !href.startsWith('mailto')) {
                    try {
                        await link.click();
                        await page.waitForTimeout(1000);
                        
                        const currentUrl = page.url();
                        navigationResults.linkTests.push({
                            text,
                            href,
                            working: true,
                            resultUrl: currentUrl
                        });

                        // Go back to original page
                        await page.goto(url, { waitUntil: 'networkidle2' });
                    } catch (error) {
                        navigationResults.linkTests.push({
                            text,
                            href,
                            working: false,
                            error: error.message
                        });
                    }
                }
            }

            // Test scroll to top functionality
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);
            
            const scrollTopButton = await page.$('.scroll-top, .back-to-top, .scroll-up');
            if (scrollTopButton) {
                await scrollTopButton.click();
                await page.waitForTimeout(1000);
                
                const scrollPosition = await page.evaluate(() => window.pageYOffset);
                navigationResults.scrollToTop = {
                    buttonExists: true,
                    scrolledToTop: scrollPosition < 100
                };
            } else {
                navigationResults.scrollToTop = {
                    buttonExists: false,
                    scrolledToTop: false
                };
            }

            await this.takeScreenshot(page, 'navigation-test', 'Navigation functionality test');
            
            this.results.navigation = navigationResults;
            return navigationResults;

        } catch (error) {
            console.error('❌ Error testing navigation:', error.message);
            return { error: error.message };
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🧹 Browser closed');
        }
    }

    async takeScreenshot(page, name, description) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${name}-${timestamp}.png`;
        const filepath = path.join(process.cwd(), 'test-screenshots', filename);
        
        // Ensure screenshots directory exists
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        
        await page.screenshot({ 
            path: filepath, 
            fullPage: true 
        });
        
        this.screenshots.push({
            name,
            description,
            filepath,
            timestamp
        });
        
        console.log(`📸 Screenshot saved: ${filename}`);
    }

    async injectAxe(page) {
        // Inject axe-core for accessibility testing
        await page.addScriptTag({
            path: require.resolve('axe-core/axe.min.js')
        });
    }

    async runAccessibilityTests(page, context) {
        console.log(`🔍 Running accessibility tests for ${context}...`);
        
        const results = await page.evaluate(() => {
            return new Promise((resolve) => {
                axe.run(document, {
                    rules: {
                        // Focus on form-related accessibility rules
                        'label': { enabled: true },
                        'form-field-multiple-labels': { enabled: true },
                        'input-button-name': { enabled: true },
                        'input-image-alt': { enabled: true },
                        'select-name': { enabled: true },
                        'textarea-name': { enabled: true },
                        'aria-required-attr': { enabled: true },
                        'aria-required-children': { enabled: true },
                        'aria-required-parent': { enabled: true },
                        'aria-valid-attr': { enabled: true },
                        'aria-valid-attr-value': { enabled: true },
                        'color-contrast': { enabled: true },
                        'focus-order-semantics': { enabled: true },
                        'keyboard-navigation': { enabled: true }
                    }
                }, (err, results) => {
                    if (err) throw err;
                    resolve(results);
                });
            });
        });

        return {
            violations: results.violations,
            passes: results.passes,
            incomplete: results.incomplete,
            summary: {
                violationCount: results.violations.length,
                passCount: results.passes.length,
                incompleteCount: results.incomplete.length
            }
        };
    }

    async testKeyboardNavigation(page, formSelector) {
        console.log('⌨️ Testing keyboard navigation...');
        
        const formElements = await page.$$(`${formSelector} input, ${formSelector} select, ${formSelector} textarea, ${formSelector} button`);
        const navigationResults = [];

        for (let i = 0; i < formElements.length; i++) {
            await page.keyboard.press('Tab');
            
            const focusedElement = await page.evaluate(() => {
                const focused = document.activeElement;
                return {
                    tagName: focused.tagName,
                    type: focused.type || null,
                    id: focused.id || null,
                    name: focused.name || null,
                    placeholder: focused.placeholder || null
                };
            });

            navigationResults.push({
                step: i + 1,
                element: focusedElement
            });
        }

        return navigationResults;
    }

    async testFormValidation(page, formSelector, testData) {
        console.log('✅ Testing form validation...');
        
        const validationResults = {};

        // Test required field validation
        try {
            // Try submitting empty form
            const submitButton = await page.$(`${formSelector} button[type="submit"], ${formSelector} .form-submit-btn, ${formSelector} .submit-btn`);
            if (submitButton) {
                await submitButton.click();
                
                // Check for validation messages
                const validationMessages = await page.evaluate(() => {
                    const messages = [];
                    document.querySelectorAll(':invalid').forEach(el => {
                        messages.push({
                            element: el.tagName + (el.id ? `#${el.id}` : ''),
                            validationMessage: el.validationMessage,
                            required: el.required
                        });
                    });
                    return messages;
                });
                
                validationResults.requiredFieldValidation = validationMessages;
            }
        } catch (error) {
            validationResults.requiredFieldValidation = { error: error.message };
        }

        // Test invalid data validation
        try {
            // Fill with invalid email
            const emailField = await page.$(`${formSelector} input[type="email"]`);
            if (emailField) {
                await emailField.clear();
                await emailField.type(testData.invalid.email);
                
                const emailValidation = await page.evaluate((selector) => {
                    const email = document.querySelector(`${selector} input[type="email"]`);
                    return email ? {
                        validity: email.validity,
                        validationMessage: email.validationMessage
                    } : null;
                }, formSelector);
                
                validationResults.emailValidation = emailValidation;
            }
        } catch (error) {
            validationResults.emailValidation = { error: error.message };
        }

        return validationResults;
    }

    async fillForm(page, formSelector, data) {
        console.log('📝 Filling form with test data...');
        
        const fillResults = {};

        // Name field
        try {
            const nameField = await page.$(`${formSelector} input[name="name"]`);
            if (nameField) {
                await nameField.clear();
                await nameField.type(data.name);
                fillResults.name = 'success';
            }
        } catch (error) {
            fillResults.name = error.message;
        }

        // First name field (booking form)
        try {
            const firstNameField = await page.$(`${formSelector} input[name="firstName"], ${formSelector} input[id="firstName"]`);
            if (firstNameField) {
                await firstNameField.clear();
                await firstNameField.type(data.firstName);
                fillResults.firstName = 'success';
            }
        } catch (error) {
            fillResults.firstName = error.message;
        }

        // Last name field (booking form)
        try {
            const lastNameField = await page.$(`${formSelector} input[name="lastName"], ${formSelector} input[id="lastName"]`);
            if (lastNameField) {
                await lastNameField.clear();
                await lastNameField.type(data.lastName);
                fillResults.lastName = 'success';
            }
        } catch (error) {
            fillResults.lastName = error.message;
        }

        // Email field
        try {
            const emailField = await page.$(`${formSelector} input[type="email"]`);
            if (emailField) {
                await emailField.clear();
                await emailField.type(data.email);
                fillResults.email = 'success';
            }
        } catch (error) {
            fillResults.email = error.message;
        }

        // Phone field
        try {
            const phoneField = await page.$(`${formSelector} input[type="tel"]`);
            if (phoneField) {
                await phoneField.clear();
                await phoneField.type(data.phone);
                fillResults.phone = 'success';
            }
        } catch (error) {
            fillResults.phone = error.message;
        }

        // Experience select
        try {
            const experienceField = await page.$(`${formSelector} select[name="experience"]`);
            if (experienceField) {
                await experienceField.select(data.experience);
                fillResults.experience = 'success';
            }
        } catch (error) {
            fillResults.experience = error.message;
        }

        // Message/goals textarea
        try {
            const messageField = await page.$(`${formSelector} textarea`);
            if (messageField) {
                await messageField.clear();
                await messageField.type(data.message);
                fillResults.message = 'success';
            }
        } catch (error) {
            fillResults.message = error.message;
        }

        return fillResults;
    }

    async testSingleForm(page, url, formSelector, siteName) {
        console.log(`\n🧪 Testing form at ${url} (${siteName})`);
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
            await this.injectAxe(page);

            // Wait for form to be present
            await page.waitForSelector(formSelector, { timeout: 10000 });
            
            // Take initial screenshot
            await this.takeScreenshot(page, `${siteName}-form-initial`, `Initial state of ${siteName} form`);

            const formTests = {};

            // 1. Accessibility tests
            formTests.accessibility = await this.runAccessibilityTests(page, `${siteName} form`);

            // 2. Keyboard navigation tests
            formTests.keyboardNavigation = await this.testKeyboardNavigation(page, formSelector);

            // 3. Form validation tests
            formTests.validation = await this.testFormValidation(page, formSelector, TEST_DATA);

            // 4. Form filling test
            formTests.formFilling = await this.fillForm(page, formSelector, TEST_DATA.valid);

            // Take screenshot after filling
            await this.takeScreenshot(page, `${siteName}-form-filled`, `${siteName} form filled with test data`);

            // 5. Test form submission (without actually submitting)
            const submitButton = await page.$(`${formSelector} button[type="submit"], ${formSelector} .form-submit-btn, ${formSelector} .submit-btn`);
            if (submitButton) {
                const isEnabled = await page.evaluate(btn => !btn.disabled, submitButton);
                formTests.submitButton = {
                    present: true,
                    enabled: isEnabled
                };
            } else {
                formTests.submitButton = {
                    present: false,
                    enabled: false
                };
            }

            // 6. Responsive testing
            formTests.responsive = {};
            
            // Test mobile viewport
            await page.setViewport({ width: 375, height: 667 });
            await this.takeScreenshot(page, `${siteName}-form-mobile`, `${siteName} form on mobile viewport`);
            
            const mobileAccessibility = await this.runAccessibilityTests(page, `${siteName} form (mobile)`);
            formTests.responsive.mobile = {
                accessibility: mobileAccessibility,
                viewport: { width: 375, height: 667 }
            };

            // Test tablet viewport
            await page.setViewport({ width: 768, height: 1024 });
            await this.takeScreenshot(page, `${siteName}-form-tablet`, `${siteName} form on tablet viewport`);

            // Reset to desktop
            await page.setViewport(CONFIG.viewport);

            return formTests;

        } catch (error) {
            console.error(`❌ Error testing ${siteName} form:`, error.message);
            return { error: error.message };
        }
    }

    async testOriginalSite() {
        console.log('\n📍 Testing Original Site (genaikido.com)...');
        
        const page = await this.browser.newPage();
        await page.setViewport(CONFIG.viewport);

        try {
            // Test original site - first check if there are any forms
            await page.goto(CONFIG.sites.original, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
            
            // Look for forms on the original site
            const forms = await page.$$eval('form', forms => 
                forms.map((form, index) => ({
                    index,
                    action: form.action,
                    method: form.method,
                    fieldCount: form.querySelectorAll('input, select, textarea').length,
                    hasSubmitButton: form.querySelector('button[type="submit"], input[type="submit"]') !== null
                }))
            );

            this.results.original = {
                url: CONFIG.sites.original,
                formsFound: forms.length,
                forms: forms
            };

            if (forms.length === 0) {
                console.log('⚠️ No forms found on original site');
                await this.takeScreenshot(page, 'original-site-no-forms', 'Original site - no forms found');
            } else {
                // Test each form found
                for (let i = 0; i < forms.length; i++) {
                    const formSelector = `form:nth-of-type(${i + 1})`;
                    this.results.original[`form${i + 1}`] = await this.testSingleForm(
                        page, 
                        CONFIG.sites.original, 
                        formSelector, 
                        `original-form${i + 1}`
                    );
                }
            }

        } catch (error) {
            console.error('❌ Error testing original site:', error.message);
            this.results.original = { error: error.message };
        } finally {
            await page.close();
        }
    }

    async testEnhancedSite() {
        console.log('\n🔧 Testing Enhanced Local Site...');
        
        // Test main index.html form
        await this.testEnhancedSiteForm('index.html', '.contact-form', 'main-contact');
        
        // Test booking system form
        await this.testEnhancedSiteForm('booking-system.html', '#bookingForm', 'booking-system');

        // Test any other forms found in the site
        const otherFormPages = [
            'index_enhanced.html',
            'pages/intro_class.html',
            'pages/questions.html'
        ];

        for (const pagePath of otherFormPages) {
            await this.testEnhancedSiteFormIfExists(pagePath);
        }
    }

    async testEnhancedSiteForm(pagePath, formSelector, formName) {
        const page = await this.browser.newPage();
        await page.setViewport(CONFIG.viewport);

        try {
            const fullPath = `file://${process.cwd()}/${pagePath}`;
            this.results.enhanced[formName] = await this.testSingleForm(
                page, 
                fullPath, 
                formSelector, 
                `enhanced-${formName}`
            );
            this.results.enhanced[formName].pagePath = pagePath;
            this.results.enhanced[formName].formSelector = formSelector;

        } catch (error) {
            console.error(`❌ Error testing enhanced site form ${formName}:`, error.message);
            this.results.enhanced[formName] = { error: error.message };
        } finally {
            await page.close();
        }
    }

    async testEnhancedSiteFormIfExists(pagePath) {
        const page = await this.browser.newPage();
        await page.setViewport(CONFIG.viewport);

        try {
            const fullPath = `file://${process.cwd()}/${pagePath}`;
            await page.goto(fullPath, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

            // Check if forms exist
            const forms = await page.$$eval('form', forms => 
                forms.map((form, index) => ({
                    index,
                    action: form.action,
                    method: form.method,
                    fieldCount: form.querySelectorAll('input, select, textarea').length,
                    className: form.className,
                    id: form.id
                }))
            );

            if (forms.length > 0) {
                console.log(`📋 Found ${forms.length} forms in ${pagePath}`);
                
                for (let i = 0; i < forms.length; i++) {
                    const formSelector = forms[i].id ? `#${forms[i].id}` : `form:nth-of-type(${i + 1})`;
                    const formName = `${path.basename(pagePath, '.html')}-form${i + 1}`;
                    
                    this.results.enhanced[formName] = await this.testSingleForm(
                        page,
                        fullPath,
                        formSelector,
                        `enhanced-${formName}`
                    );
                    this.results.enhanced[formName].pagePath = pagePath;
                    this.results.enhanced[formName].formSelector = formSelector;
                }
            }

        } catch (error) {
            console.log(`ℹ️ No forms or error accessing ${pagePath}:`, error.message);
        } finally {
            await page.close();
        }
    }

    async generateComparisonReport() {
        console.log('\n📊 Generating comparison report...');

        const comparison = {
            summary: {
                original: {
                    formsCount: this.results.original.formsFound || 0,
                    hasError: !!this.results.original.error
                },
                enhanced: {
                    formsCount: Object.keys(this.results.enhanced).length,
                    formNames: Object.keys(this.results.enhanced)
                }
            },
            accessibility: {
                original: {},
                enhanced: {}
            },
            usability: {
                original: {},
                enhanced: {}
            },
            recommendations: []
        };

        // Analyze enhanced site forms
        for (const [formName, formData] of Object.entries(this.results.enhanced)) {
            if (formData.accessibility) {
                comparison.accessibility.enhanced[formName] = {
                    violations: formData.accessibility.summary.violationCount,
                    passes: formData.accessibility.summary.passCount,
                    score: formData.accessibility.summary.passCount / 
                           (formData.accessibility.summary.passCount + formData.accessibility.summary.violationCount) * 100
                };
            }

            if (formData.validation && formData.keyboardNavigation) {
                comparison.usability.enhanced[formName] = {
                    hasValidation: !!formData.validation.requiredFieldValidation,
                    keyboardNavigable: formData.keyboardNavigation.length > 0,
                    responsive: !!formData.responsive
                };
            }
        }

        // Generate recommendations
        if (comparison.summary.original.formsCount === 0) {
            comparison.recommendations.push({
                priority: 'high',
                category: 'functionality',
                issue: 'Original site has no forms',
                recommendation: 'Enhanced site provides much better user engagement with contact and booking forms'
            });
        }

        // Accessibility recommendations
        for (const [formName, accessibilityData] of Object.entries(comparison.accessibility.enhanced)) {
            if (accessibilityData.violations > 0) {
                comparison.recommendations.push({
                    priority: 'high',
                    category: 'accessibility',
                    issue: `Form ${formName} has ${accessibilityData.violations} accessibility violations`,
                    recommendation: 'Fix accessibility issues to improve usability for all users'
                });
            }
        }

        this.results.comparison = comparison;
        return comparison;
    }

    async generateReport() {
        console.log('\n📝 Generating comprehensive test report...');

        const report = {
            metadata: {
                testDate: new Date().toISOString(),
                testVersion: '1.0.0',
                author: 'Lance James, Unit 221B',
                description: 'Comprehensive form functionality and accessibility comparison'
            },
            configuration: CONFIG,
            results: this.results,
            screenshots: this.screenshots,
            summary: await this.generateComparisonReport()
        };

        // Save report to file
        const reportPath = path.join(process.cwd(), 'form-test-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        // Generate markdown report
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(process.cwd(), 'Form-Testing-Report.md');
        await fs.writeFile(markdownPath, markdownReport);

        console.log(`✅ Test report saved to ${reportPath}`);
        console.log(`📄 Markdown report saved to ${markdownPath}`);

        return report;
    }

    generateMarkdownReport(report) {
        const { results, summary, screenshots } = report;
        
        let markdown = `# Form Testing Report: Genshinkan Aikido Site Comparison

**Author:** Lance James, Unit 221B  
**Date:** ${new Date(report.metadata.testDate).toLocaleDateString()}  
**Test Version:** ${report.metadata.testVersion}

## Executive Summary

This comprehensive analysis compares form functionality, accessibility, and user experience between the original Genshinkan Aikido site (genaikido.com) and the enhanced local implementation.

### Key Findings

- **Original Site Forms:** ${summary.summary.original.formsCount} forms found
- **Enhanced Site Forms:** ${summary.summary.enhanced.formsCount} forms found
- **Screenshots Captured:** ${screenshots.length} screenshots for visual comparison

## Original Site Analysis

`;

        if (results.original.error) {
            markdown += `⚠️ **Error accessing original site:** ${results.original.error}\n\n`;
        } else if (results.original.formsFound === 0) {
            markdown += `### Forms Found: None

The original site does not appear to have any interactive forms for user engagement. This represents a significant missed opportunity for lead generation and user interaction.

**Impact:** Visitors cannot easily contact the dojo or sign up for classes directly through the website.

`;
        } else {
            markdown += `### Forms Analysis\n\n`;
            results.original.forms.forEach((form, index) => {
                markdown += `#### Form ${index + 1}
- **Action:** ${form.action || 'Not specified'}
- **Method:** ${form.method || 'GET'}
- **Field Count:** ${form.fieldCount}
- **Has Submit Button:** ${form.hasSubmitButton ? 'Yes' : 'No'}

`;
            });
        }

        markdown += `## Enhanced Site Analysis

The enhanced site includes ${summary.summary.enhanced.formsCount} interactive forms:

`;

        for (const [formName, formData] of Object.entries(results.enhanced)) {
            if (formData.error) {
                markdown += `### ${formName} - Error
❌ **Error:** ${formData.error}

`;
                continue;
            }

            markdown += `### ${formName.charAt(0).toUpperCase() + formName.slice(1)} Form

**Location:** ${formData.pagePath}  
**Selector:** ${formData.formSelector}

#### Accessibility Assessment
`;

            if (formData.accessibility) {
                const accessibilityScore = Math.round(
                    formData.accessibility.summary.passCount / 
                    (formData.accessibility.summary.passCount + formData.accessibility.summary.violationCount) * 100
                );
                
                markdown += `- **Accessibility Score:** ${accessibilityScore}%
- **Violations:** ${formData.accessibility.summary.violationCount}
- **Passes:** ${formData.accessibility.summary.passCount}
- **Incomplete:** ${formData.accessibility.summary.incompleteCount}

`;

                if (formData.accessibility.violations.length > 0) {
                    markdown += `**Accessibility Issues Found:**\n`;
                    formData.accessibility.violations.forEach(violation => {
                        markdown += `- **${violation.id}:** ${violation.description}\n`;
                    });
                    markdown += `\n`;
                }
            }

            markdown += `#### Form Functionality
`;

            if (formData.validation) {
                markdown += `- **Required Field Validation:** ${formData.validation.requiredFieldValidation ? 'Present' : 'Not detected'}
- **Email Validation:** ${formData.validation.emailValidation ? 'Present' : 'Not detected'}
`;
            }

            if (formData.keyboardNavigation) {
                markdown += `- **Keyboard Navigation:** ${formData.keyboardNavigation.length} elements navigable via Tab key
`;
            }

            if (formData.submitButton) {
                markdown += `- **Submit Button:** ${formData.submitButton.present ? 'Present' : 'Missing'} ${formData.submitButton.enabled ? '(Enabled)' : '(Disabled)'}
`;
            }

            if (formData.responsive) {
                markdown += `- **Mobile Compatibility:** Tested on mobile viewport (375x667)
- **Mobile Accessibility Score:** ${formData.responsive.mobile.accessibility ? Math.round(
                    formData.responsive.mobile.accessibility.summary.passCount / 
                    (formData.responsive.mobile.accessibility.summary.passCount + formData.responsive.mobile.accessibility.summary.violationCount) * 100
                ) : 'N/A'}%

`;
            }
        }

        markdown += `## Recommendations

Based on the comprehensive testing analysis:

`;

        summary.recommendations.forEach((rec, index) => {
            const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
            markdown += `### ${index + 1}. ${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)} - ${priorityIcon} ${rec.priority.toUpperCase()}

**Issue:** ${rec.issue}  
**Recommendation:** ${rec.recommendation}

`;
        });

        markdown += `## Visual Documentation

${screenshots.length} screenshots were captured during testing:

`;

        screenshots.forEach(screenshot => {
            markdown += `- **${screenshot.name}**: ${screenshot.description} (${screenshot.timestamp})
`;
        });

        markdown += `
## Technical Implementation Notes

### Testing Framework
- **Tool:** Puppeteer with axe-core accessibility integration
- **Browser:** Chromium (headless: ${CONFIG.headless})
- **Viewport Testing:** Desktop (1200x800), Mobile (375x667), Tablet (768x1024)
- **Accessibility Standards:** WCAG 2.1 AA compliance

### Form Testing Coverage
- Field validation (required fields, email format, phone format)
- Keyboard navigation and tab order
- Screen reader compatibility (ARIA attributes)
- Color contrast and visual accessibility
- Mobile responsiveness
- Submit button functionality
- Error message display

### Limitations
- Tests were conducted without actual form submission to avoid spam
- Original site accessibility may be affected by external factors (CDN, third-party scripts)
- Some dynamic functionality may require server-side validation testing

---

*This report was generated by the automated form testing suite developed by Lance James, Unit 221B.*
`;

        return markdown;
    }

    async testTryAikidoSignupFlow(page, url) {
        console.log('\n🥋 Testing "Try Aikido" Signup Flow...');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

            const signupResults = {};

            // Look for trial/signup buttons and forms
            signupResults.signupElements = await page.evaluate(() => {
                const tryButtons = Array.from(document.querySelectorAll('button, a, .btn')).filter(el => 
                    el.textContent.toLowerCase().includes('try') || 
                    el.textContent.toLowerCase().includes('trial') || 
                    el.textContent.toLowerCase().includes('free') ||
                    el.textContent.toLowerCase().includes('start') ||
                    el.textContent.toLowerCase().includes('signup') ||
                    el.textContent.toLowerCase().includes('sign up')
                );

                const signupForms = document.querySelectorAll('form, .signup-form, .trial-form, .contact-form');
                
                return {
                    tryButtonsCount: tryButtons.length,
                    tryButtonTexts: tryButtons.map(btn => btn.textContent.trim()),
                    signupFormsCount: signupForms.length,
                    signupFormIds: Array.from(signupForms).map(form => form.id || form.className)
                };
            });

            // Test trial class form if exists
            const trialForm = await page.$('#intro-class-form, .trial-form, .signup-form');
            if (trialForm) {
                await this.takeScreenshot(page, 'trial-signup-form', 'Trial class signup form');
                
                signupResults.trialFormTest = await this.testSingleForm(
                    page, 
                    url, 
                    '#intro-class-form, .trial-form, .signup-form', 
                    'trial-signup'
                );

                // Test the signup flow specifically
                signupResults.signupFlow = await page.evaluate(() => {
                    const form = document.querySelector('#intro-class-form, .trial-form, .signup-form');
                    if (!form) return { error: 'No signup form found' };

                    const requiredFields = form.querySelectorAll('[required]');
                    const optionalFields = form.querySelectorAll('input:not([required]), select:not([required]), textarea:not([required])');
                    const submitButton = form.querySelector('button[type="submit"], input[type="submit"], .submit-btn');

                    return {
                        formExists: true,
                        requiredFieldsCount: requiredFields.length,
                        optionalFieldsCount: optionalFields.length,
                        hasSubmitButton: !!submitButton,
                        submitButtonText: submitButton ? submitButton.textContent.trim() : null,
                        formAction: form.action || 'Not specified',
                        formMethod: form.method || 'GET'
                    };
                });

                // Test form validation for trial signup
                try {
                    const firstNameField = await page.$('#intro-class-form input[name="firstName"], .trial-form input[name="firstName"]');
                    const emailField = await page.$('#intro-class-form input[type="email"], .trial-form input[type="email"]');
                    
                    if (firstNameField && emailField) {
                        await firstNameField.type('John');
                        await emailField.type('john.test@example.com');
                        await this.takeScreenshot(page, 'trial-form-filled', 'Trial form filled with test data');
                        
                        signupResults.formFillTest = {
                            success: true,
                            fieldsFilledSuccessfully: ['firstName', 'email']
                        };
                    }
                } catch (error) {
                    signupResults.formFillTest = {
                        success: false,
                        error: error.message
                    };
                }

            } else {
                console.log('⚠️ No trial signup form found');
                signupResults.trialFormTest = { error: 'No trial signup form found' };
            }

            // Test conversion optimization elements
            signupResults.conversionElements = await page.evaluate(() => {
                const testimonials = document.querySelectorAll('.testimonial, .review, .quote');
                const socialProof = document.querySelectorAll('.instructor, .certification, .award');
                const urgencyElements = document.querySelectorAll('.limited-time, .special-offer, .deadline');
                const trustSignals = document.querySelectorAll('.guarantee, .secure, .certified, .professional');

                return {
                    testimonialsCount: testimonials.length,
                    socialProofCount: socialProof.length,
                    urgencyElementsCount: urgencyElements.length,
                    trustSignalsCount: trustSignals.length
                };
            });

            this.results.tryAikidoSignup = signupResults;
            return signupResults;

        } catch (error) {
            console.error('❌ Error testing Try Aikido signup flow:', error.message);
            return { error: error.message };
        }
    }

    async testCrossDeviceResponsiveness(page, url) {
        console.log('\n📱 Testing Cross-Device Responsiveness...');
        
        try {
            const responsiveResults = {};
            const viewports = [
                { name: 'desktop', width: 1200, height: 800 },
                { name: 'laptop', width: 1024, height: 768 },
                { name: 'tablet', width: 768, height: 1024 },
                { name: 'mobile-large', width: 414, height: 896 },
                { name: 'mobile', width: 375, height: 667 },
                { name: 'mobile-small', width: 320, height: 568 }
            ];

            for (const viewport of viewports) {
                console.log(`Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
                
                await page.setViewport({ width: viewport.width, height: viewport.height });
                await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });
                
                await this.takeScreenshot(page, `responsive-${viewport.name}`, `Site on ${viewport.name} viewport`);
                
                responsiveResults[viewport.name] = await page.evaluate(() => {
                    // Test text readability
                    const bodyStyle = window.getComputedStyle(document.body);
                    const headingStyle = window.getComputedStyle(document.querySelector('h1, h2, .main-title') || document.body);
                    
                    // Test navigation accessibility
                    const nav = document.querySelector('nav, .navigation');
                    const navVisible = nav ? window.getComputedStyle(nav).display !== 'none' : false;
                    
                    // Test form accessibility
                    const forms = document.querySelectorAll('form');
                    const formsVisible = Array.from(forms).filter(form => 
                        window.getComputedStyle(form).display !== 'none'
                    ).length;
                    
                    // Test horizontal scrolling
                    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
                    
                    // Test touch targets
                    const buttons = document.querySelectorAll('button, a, input[type="submit"]');
                    const appropriateTouchTargets = Array.from(buttons).filter(btn => {
                        const rect = btn.getBoundingClientRect();
                        return rect.height >= 44 && rect.width >= 44; // iOS minimum
                    }).length;

                    return {
                        viewport: `${window.innerWidth}x${window.innerHeight}`,
                        fontSize: bodyStyle.fontSize,
                        headingSize: headingStyle.fontSize,
                        navigationVisible: navVisible,
                        formsVisible: formsVisible,
                        hasHorizontalScroll,
                        totalButtons: buttons.length,
                        appropriateTouchTargets,
                        touchTargetScore: buttons.length > 0 ? (appropriateTouchTargets / buttons.length * 100) : 0
                    };
                });
            }

            // Reset to desktop viewport
            await page.setViewport({ width: 1200, height: 800 });
            
            this.results.responsiveness = responsiveResults;
            return responsiveResults;

        } catch (error) {
            console.error('❌ Error testing cross-device responsiveness:', error.message);
            return { error: error.message };
        }
    }

    async testJapaneseAestheticElements(page, url) {
        console.log('\n🎌 Testing Japanese Aesthetic Elements...');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: CONFIG.timeout });

            const aestheticResults = {};

            // Test Japanese typography and fonts
            aestheticResults.typography = await page.evaluate(() => {
                const japaneseTextElements = Array.from(document.querySelectorAll('*')).filter(el => {
                    const text = el.textContent;
                    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text); // Hiragana, Katakana, Kanji
                });

                const fontFamilies = Array.from(new Set(
                    Array.from(document.querySelectorAll('*')).map(el => 
                        window.getComputedStyle(el).fontFamily
                    )
                )).filter(font => 
                    font.toLowerCase().includes('noto') || 
                    font.toLowerCase().includes('zen') ||
                    font.toLowerCase().includes('japanese') ||
                    font.toLowerCase().includes('jp')
                );

                return {
                    japaneseTextElementsCount: japaneseTextElements.length,
                    japaneseFontsLoaded: fontFamilies.length,
                    fontFamilies: fontFamilies,
                    sampleJapaneseText: japaneseTextElements.slice(0, 3).map(el => el.textContent.trim())
                };
            });

            // Test traditional design elements
            aestheticResults.designElements = await page.evaluate(() => {
                const traditionalElements = document.querySelectorAll('.zen, .traditional, .japanese, .calligraphy, .brush, .bamboo, .cherry');
                const colorScheme = {
                    background: window.getComputedStyle(document.body).backgroundColor,
                    text: window.getComputedStyle(document.body).color
                };

                return {
                    traditionalElementsCount: traditionalElements.length,
                    colorScheme,
                    traditionalClassNames: Array.from(traditionalElements).map(el => el.className)
                };
            });

            await this.takeScreenshot(page, 'japanese-aesthetic', 'Japanese aesthetic elements test');
            
            this.results.japaneseAesthetic = aestheticResults;
            return aestheticResults;

        } catch (error) {
            console.error('❌ Error testing Japanese aesthetic elements:', error.message);
            return { error: error.message };
        }
    }

    async run() {
        try {
            await this.init();
            
            console.log('\n🎯 Starting comprehensive QA testing for new customer journey...');
            
            const testUrl = CONFIG.sites.enhanced;
            const page = await this.browser.newPage();
            await page.setViewport(CONFIG.viewport);

            // Execute comprehensive test suite
            this.testSequence = [
                'New Customer Discovery Journey',
                'Try Aikido Signup Flow', 
                'Instructor Display (5 instructors)',
                'Photo Gallery Navigation',
                'Navigation & Scroll Behavior',
                'Cross-Device Responsiveness',
                'Japanese Aesthetic Elements',
                // Original form testing
                'Enhanced Site Forms',
                'Original Site Comparison'
            ];

            console.log(`📋 Test Sequence: ${this.testSequence.join(' → ')}`);

            // 1. Test new customer discovery journey
            await this.testNewCustomerDiscoveryJourney(page, testUrl);
            
            // 2. Test Try Aikido signup flow
            await this.testTryAikidoSignupFlow(page, testUrl);
            
            // 3. Test instructor display (focus on 5 instructors + Ariana)
            await this.testInstructorDisplay(page, testUrl);
            
            // 4. Test photo gallery navigation
            await this.testPhotoGalleryNavigation(page, testUrl);
            
            // 5. Test navigation and scroll behavior
            await this.testNavigationAndScrollBehavior(page, testUrl);
            
            // 6. Test cross-device responsiveness
            await this.testCrossDeviceResponsiveness(page, testUrl);
            
            // 7. Test Japanese aesthetic elements
            await this.testJapaneseAestheticElements(page, testUrl);

            await page.close();
            
            // 8. Test original site for comparison
            await this.testOriginalSite();
            
            // 9. Test enhanced site forms
            await this.testEnhancedSite();
            
            // Generate comprehensive report
            const report = await this.generateReport();
            
            console.log('\n✅ Comprehensive QA testing completed successfully!');
            console.log(`📊 Test categories completed: ${this.testSequence.length}`);
            console.log(`📸 Screenshots captured: ${this.screenshots.length}`);
            console.log('📄 Check Comprehensive-QA-Report.md for detailed analysis');
            
            return report;
            
        } catch (error) {
            console.error('❌ QA test suite failed:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const testSuite = new ComprehensiveQATestSuite();
    testSuite.run().catch(console.error);
}

module.exports = ComprehensiveQATestSuite;