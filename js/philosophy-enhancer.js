// Philosophy Page Enhancer
// Adds Japanese aesthetic styling and navigation to existing philosophy pages
// WITHOUT replacing any existing content

class PhilosophyEnhancer {
    constructor() {
        this.isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
        this.basePath = this.isHomePage ? '' : '../';
        this.currentPage = this.getCurrentPageName();
        this.init();
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename;
    }

    getJapaneseStyleEnhancements() {
        return `
        <style>
            :root {
                --sumi-black: #2C2C2C;
                --zen-gray: #666;
                --warm-brown: #8B4513;
                --washi-white: #fff;
                --muted-gold: #D4AF37;
                --tatami-beige: #f8f5f0;
                --ink-blue: #1B365D;
            }

            /* Enhanced Japanese Typography */
            body {
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
                line-height: 1.6;
                color: var(--sumi-black);
                background-color: var(--washi-white);
                font-size: 16px;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* Enhanced Japanese Characters */
            .japanese-characters {
                font-family: 'Noto Sans JP', 'Zen Kaku Gothic New', serif !important;
                font-size: 4rem !important;
                color: var(--warm-brown) !important;
                margin: 2rem 0 !important;
                font-weight: 300 !important;
                line-height: 1 !important;
                text-shadow: 0 2px 4px rgba(139, 69, 19, 0.1);
            }

            /* Enhanced Page Title */
            .page-title {
                font-family: 'Manrope', serif !important;
                font-size: 3rem !important;
                color: var(--sumi-black) !important;
                margin-bottom: 1rem !important;
                font-weight: 600 !important;
                line-height: 1.2 !important;
            }

            /* Enhanced Page Subtitle */
            .page-subtitle {
                font-size: 1.3rem !important;
                color: var(--warm-brown) !important;
                font-weight: 500 !important;
                line-height: 1.4 !important;
            }

            /* Enhanced Page Header */
            .page-header {
                text-align: center;
                padding: 60px 0 !important;
                background: linear-gradient(135deg, rgba(248, 245, 240, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%) !important;
                margin-bottom: 60px !important;
                border-radius: 12px;
                border: 1px solid rgba(139, 69, 19, 0.05);
            }

            /* Enhanced Philosophy Sub-Navigation */
            .philosophy-subnav {
                background: var(--tatami-beige) !important;
                border: 1px solid rgba(139, 69, 19, 0.1) !important;
                border-radius: 8px !important;
                padding: 1rem 0 !important;
                margin-bottom: 40px !important;
                position: sticky !important;
                top: 80px !important;
                z-index: 90 !important; /* Lower than mobile nav which is 999 */
                box-shadow: 0 2px 8px rgba(139, 69, 19, 0.05);
            }

            .philosophy-subnav > div {
                text-align: center !important;
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 2rem !important;
            }

            .philosophy-subnav span {
                color: var(--warm-brown) !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
            }

            .philosophy-subnav a {
                color: var(--zen-gray) !important;
                text-decoration: none !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                transition: all 0.3s ease !important;
                background: rgba(255, 255, 255, 0.6);
            }

            .philosophy-subnav a:hover,
            .philosophy-subnav a[style*="color: #8B4513"],
            .philosophy-subnav a[style*="color: rgb(139, 69, 19)"] {
                color: var(--warm-brown) !important;
                background: rgba(139, 69, 19, 0.1) !important;
                font-weight: 600 !important;
            }

            /* Enhanced Quote Blocks */
            .quote-block {
                background: var(--tatami-beige) !important;
                border-left: 4px solid var(--warm-brown) !important;
                padding: 40px !important;
                margin: 40px 0 !important;
                border-radius: 8px !important;
                font-style: italic;
                font-size: 1.3rem !important;
                line-height: 1.6 !important;
                color: var(--sumi-black) !important;
                text-align: center;
                box-shadow: 0 2px 8px rgba(139, 69, 19, 0.05);
            }

            .quote-author {
                margin-top: 20px !important;
                font-size: 1rem !important;
                color: var(--warm-brown) !important;
                font-weight: 600 !important;
                font-style: normal !important;
            }

            /* Enhanced Section Titles */
            .section-title {
                font-family: 'Manrope', serif !important;
                font-size: 2rem !important;
                color: var(--sumi-black) !important;
                margin-bottom: 1.5rem !important;
                font-weight: 600 !important;
                border-left: 4px solid var(--warm-brown) !important;
                padding-left: 1rem !important;
            }

            /* Enhanced Content Text */
            .content-text {
                font-size: 1.1rem !important;
                line-height: 1.8 !important;
                color: var(--zen-gray) !important;
                margin-bottom: 1.5rem !important;
            }

            /* Enhanced Cards and Sections */
            .principle-card,
            .example-item {
                background: white !important;
                border-top: 4px solid var(--warm-brown) !important;
                border-radius: 15px !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08) !important;
                transition: transform 0.3s ease !important;
            }

            .principle-card:hover,
            .example-item:hover {
                transform: translateY(-5px) !important;
                box-shadow: 0 8px 25px rgba(139, 69, 19, 0.15) !important;
            }

            /* Enhanced Background Sections */
            .aikido-connection,
            .meditation-section {
                background: linear-gradient(135deg, var(--tatami-beige) 0%, rgba(248, 245, 240, 0.5) 100%) !important;
                border: 1px solid rgba(139, 69, 19, 0.1) !important;
                border-radius: 20px !important;
                box-shadow: 0 2px 8px rgba(139, 69, 19, 0.05) !important;
            }

            /* Enhanced Call to Action */
            .call-to-action {
                background: var(--sumi-black) !important;
                color: var(--washi-white) !important;
                border-radius: 20px !important;
                box-shadow: 0 8px 25px rgba(44, 62, 80, 0.2) !important;
            }

            .btn-primary {
                background: var(--warm-brown) !important;
                color: var(--washi-white) !important;
                padding: 16px 32px !important;
                border-radius: 50px !important;
                text-decoration: none !important;
                font-weight: 600 !important;
                font-size: 1.1rem !important;
                display: inline-block !important;
                transition: all 0.3s ease !important;
            }

            .btn-primary:hover {
                background: #654321 !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3) !important;
            }

            /* Enhanced Typography for Titles */
            .principle-title,
            .example-title {
                font-family: 'Manrope', serif !important;
                color: var(--sumi-black) !important;
                font-weight: 600 !important;
            }

            /* Enhanced Responsive Design */
            @media (max-width: 768px) {
                .japanese-characters {
                    font-size: 3rem !important;
                }

                .page-title {
                    font-size: 2.2rem !important;
                }

                .page-subtitle {
                    font-size: 1.1rem !important;
                }

                .philosophy-subnav {
                    padding: 0.8rem 0 !important;
                    position: sticky !important;
                    top: 70px !important;
                    z-index: 90 !important; /* Keep it below mobile nav */
                }
                
                /* Hide philosophy subnav when mobile menu is open */
                body:has(.mobile-nav.open) .philosophy-subnav {
                    opacity: 0.3;
                    pointer-events: none;
                }

                .philosophy-subnav > div {
                    overflow-x: auto !important;
                    -webkit-overflow-scrolling: touch !important;
                    scrollbar-width: none !important;
                    justify-content: flex-start !important;
                    padding: 0 20px !important;
                }

                .philosophy-subnav > div::-webkit-scrollbar {
                    display: none !important;
                }

                .philosophy-subnav a {
                    display: inline-block !important;
                    margin: 0 8px !important;
                    padding: 8px 12px !important;
                    background: rgba(255, 255, 255, 0.8) !important;
                    border-radius: 15px !important;
                    white-space: nowrap !important;
                    flex-shrink: 0 !important;
                }

                .philosophy-subnav span {
                    display: none !important;
                }

                .section-title {
                    font-size: 1.6rem !important;
                }

                .quote-block {
                    padding: 30px 20px !important;
                    font-size: 1.2rem !important;
                }
            }

            @media (max-width: 480px) {
                .page-header {
                    padding: 30px 15px !important;
                }

                .japanese-characters {
                    font-size: 2.5rem !important;
                }

                .page-title {
                    font-size: 1.8rem !important;
                }

                .quote-block {
                    padding: 25px 15px !important;
                    font-size: 1.1rem !important;
                }
            }
        </style>`;
    }

    getCurrentPageData() {
        const pages = {
            'what-is-shoshin': {
                kanji: '初心',
                pageTitle: 'What is Shoshin?'
            },
            'the-art-of-peace': {
                kanji: '平和',
                pageTitle: 'The Art of Peace'
            },
            'honor-values': {
                kanji: '名誉',
                pageTitle: 'Honor & Values'
            },
            'traditional-values': {
                kanji: '伝統',
                pageTitle: 'Rooted in Ancient Traditions'
            },
            'health-and-safety': {
                kanji: '健康',
                pageTitle: 'Health & Safety'
            },
            'adult-beginners-journey': {
                kanji: '始まり',
                pageTitle: 'The Adult Beginner\'s Journey'
            }
        };

        return pages[this.currentPage] || { kanji: '哲学', pageTitle: 'Philosophy' };
    }

    enhanceExistingContent() {
        // Add enhanced Japanese typography fonts
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Inject enhanced styles
        const styleElement = document.createElement('style');
        styleElement.innerHTML = this.getJapaneseStyleEnhancements();
        document.head.appendChild(styleElement);

        // Enhance existing Japanese characters if they exist but don't have kanji
        const japaneseChars = document.querySelector('.japanese-characters');
        if (japaneseChars) {
            const pageData = this.getCurrentPageData();
            // Only add kanji if the element is empty or contains placeholder text
            if (!japaneseChars.textContent.trim() || japaneseChars.textContent.trim().length < 2) {
                japaneseChars.textContent = pageData.kanji;
            }
        }

        // Mark current page as active in philosophy subnav
        this.updatePhilosophySubNav();
    }

    updatePhilosophySubNav() {
        const currentPageFile = `${this.currentPage}.html`;
        const subnavLinks = document.querySelectorAll('.philosophy-subnav a');
        
        subnavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPageFile || href.endsWith(`/${currentPageFile}`)) {
                // Mark as active by updating the style
                link.style.color = '#8B4513';
                link.style.fontWeight = '600';
                link.style.background = 'rgba(139, 69, 19, 0.1)';
            } else {
                // Reset to inactive state
                link.style.color = '#666';
                link.style.fontWeight = '500';
                link.style.background = 'rgba(255, 255, 255, 0.6)';
            }
        });
    }

    init() {
        // Only enhance existing content, don't replace anything
        this.enhanceExistingContent();
        
        // Initialize smooth scrolling for any new elements
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        console.log('Philosophy Enhancer initialized for:', this.currentPage);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhilosophyEnhancer();
});