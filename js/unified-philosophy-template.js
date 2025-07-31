// Unified Japanese-Style Philosophy Page Template
// Creates consistent Japanese aesthetic across all philosophy pages

class UnifiedPhilosophyTemplate {
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

    getPageData() {
        const pages = {
            'what-is-shoshin': {
                title: 'What is Shoshin? The Beginner\'s Mind in Aikido | Genshinkan Aikido',
                description: 'Discover the profound philosophy of Shoshin (初心) - Beginner\'s Mind - and how it transforms your Aikido practice and daily life.',
                kanji: '初心',
                pageTitle: 'What is Shoshin?',
                subtitle: 'The Transformative Power of Beginner\'s Mind',
                quote: '"In the beginner\'s mind there are many possibilities, but in the expert\'s mind there are few."',
                quoteAuthor: '— Shunryu Suzuki Roshi'
            },
            'the-art-of-peace': {
                title: 'The Art of Peace | Genshinkan Aikido',
                description: 'Explore the profound teachings of Aikido founder Morihei Ueshiba and his vision of martial arts as a path to peace.',
                kanji: '平和',
                pageTitle: 'The Art of Peace',
                subtitle: 'Morihei Ueshiba\'s Vision of Harmony',
                quote: '"The Art of Peace begins with you. Work on yourself and your appointed task in the Art of Peace."',
                quoteAuthor: '— Morihei Ueshiba'
            },
            'honor-values': {
                title: 'Honor in Training, Honor in Life | Genshinkan Aikido',
                description: 'Understanding how traditional martial arts values translate into modern life principles and personal integrity.',
                kanji: '名誉',
                pageTitle: 'Honor & Values',
                subtitle: 'Living with Integrity Through Martial Arts',
                quote: '"Your character is revealed not by what you do when others are watching, but by what you do when no one else is around."',
                quoteAuthor: '— Martial Arts Wisdom'
            },
            'traditional-values': {
                title: 'Rooted in Ancient Traditions | Genshinkan Aikido',
                description: 'Discover how ancient martial traditions create meaningful framework for modern practice and community.',
                kanji: '伝統',
                pageTitle: 'Rooted in Ancient Traditions',
                subtitle: 'Connecting to Timeless Wisdom',
                quote: '"Tradition is not the worship of ashes, but the preservation of fire."',
                quoteAuthor: '— Gustav Mahler'
            },
            'health-and-safety': {
                title: 'Your Health & Safety First | Genshinkan Aikido',
                description: 'Our comprehensive approach to safe, healthy Aikido training that respects both body and mind.',
                kanji: '健康',
                pageTitle: 'Health & Safety',
                subtitle: 'Mindful Practice Guidelines',
                quote: '"Take care of your body. It\'s the only place you have to live."',
                quoteAuthor: '— Jim Rohn'
            },
            'adult-beginners-journey': {
                title: 'Adult Beginner\'s Journey - Success Stories | Genshinkan Aikido',
                description: 'A supportive guide for adults beginning their Aikido journey, addressing common concerns and celebrating the unique advantages.',
                kanji: '始まり',
                pageTitle: 'The Adult Beginner\'s Journey',
                subtitle: 'Starting Aikido as an Adult',
                quote: '"The best time to plant a tree was 20 years ago. The second best time is now."',
                quoteAuthor: '— Chinese Proverb'
            }
        };

        return pages[this.currentPage] || pages['what-is-shoshin'];
    }

    getUnifiedStyles() {
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

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
                line-height: 1.6;
                color: var(--sumi-black);
                background-color: var(--washi-white);
                font-size: 16px;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                padding-top: 80px;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
            }

            /* Japanese-Style Page Header */
            .main-content {
                padding: 40px 0 80px;
            }

            .page-header {
                text-align: center;
                padding: 60px 0;
                background: linear-gradient(135deg, rgba(248, 245, 240, 0.3) 0%, rgba(255, 255, 255, 0.8) 100%);
                margin-bottom: 60px;
                border-radius: 12px;
            }

            .japanese-characters {
                font-size: 4rem;
                color: var(--warm-brown);
                margin: 0 0 2rem 0;
                font-weight: 300;
                line-height: 1;
                font-family: 'Noto Sans JP', 'Zen Kaku Gothic New', serif;
            }

            .page-title {
                font-size: 3rem;
                color: var(--sumi-black);
                margin-bottom: 1rem;
                font-weight: 600;
                line-height: 1.2;
                font-family: 'Manrope', serif;
            }

            .page-subtitle {
                font-size: 1.3rem;
                color: var(--warm-brown);
                font-weight: 500;
                line-height: 1.4;
            }

            /* Philosophy Sub-Navigation */
            .philosophy-subnav {
                background: var(--tatami-beige);
                border: 1px solid rgba(139, 69, 19, 0.1);
                border-radius: 8px;
                padding: 1rem 0;
                margin-bottom: 40px;
                position: sticky;
                top: 80px;
                z-index: 100;
            }

            .philosophy-subnav > div {
                text-align: center;
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 2rem;
            }

            .subnav-label {
                color: var(--warm-brown);
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .philosophy-subnav a {
                color: var(--zen-gray);
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
                padding: 8px 16px;
                border-radius: 20px;
                transition: all 0.3s ease;
            }

            .philosophy-subnav a:hover,
            .philosophy-subnav a.active {
                color: var(--warm-brown);
                background: rgba(139, 69, 19, 0.1);
                font-weight: 600;
            }

            /* Content Sections */
            .content-section {
                margin-bottom: 4rem;
            }

            .quote-block {
                background: var(--tatami-beige);
                border-left: 4px solid var(--warm-brown);
                padding: 40px;
                margin: 40px 0;
                border-radius: 8px;
                font-style: italic;
                font-size: 1.3rem;
                line-height: 1.6;
                color: var(--sumi-black);
                text-align: center;
            }

            .quote-author {
                margin-top: 20px;
                font-size: 1rem;
                color: var(--warm-brown);
                font-weight: 600;
                font-style: normal;
            }

            .section-title {
                font-size: 2rem;
                color: var(--sumi-black);
                margin-bottom: 1.5rem;
                font-weight: 600;
                font-family: 'Manrope', serif;
            }

            .content-text {
                font-size: 1.1rem;
                line-height: 1.8;
                color: var(--zen-gray);
                margin-bottom: 1.5rem;
            }

            /* CTA Section */
            .cta-section {
                background: var(--sumi-black);
                color: var(--washi-white);
                padding: 80px 0;
                text-align: center;
                margin-top: 80px;
            }

            .cta-title {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                font-weight: 600;
            }

            .cta-text {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                line-height: 1.6;
                opacity: 0.9;
            }

            .btn-primary {
                background: var(--warm-brown);
                color: var(--washi-white);
                padding: 16px 32px;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
                font-size: 1.1rem;
                display: inline-block;
                transition: all 0.3s ease;
            }

            .btn-primary:hover {
                background: #654321;
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding-top: 70px;
                }

                .page-header {
                    padding: 40px 20px;
                    margin-bottom: 40px;
                }

                .japanese-characters {
                    font-size: 3rem;
                }

                .page-title {
                    font-size: 2.2rem;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                }

                .philosophy-subnav {
                    padding: 0.8rem 0;
                    position: sticky;
                    top: 70px;
                }

                .philosophy-subnav > div {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    justify-content: flex-start;
                    padding: 0 20px;
                }

                .philosophy-subnav > div::-webkit-scrollbar {
                    display: none;
                }

                .philosophy-subnav a {
                    display: inline-block;
                    margin: 0 8px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 15px;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .subnav-label {
                    display: none;
                }

                .section-title {
                    font-size: 1.6rem;
                }

                .quote-block {
                    padding: 30px 20px;
                    font-size: 1.2rem;
                }

                .cta-title {
                    font-size: 2rem;
                }
            }

            @media (max-width: 480px) {
                .container {
                    padding: 0 15px;
                }

                .page-header {
                    padding: 30px 15px;
                }

                .japanese-characters {
                    font-size: 2.5rem;
                }

                .page-title {
                    font-size: 1.8rem;
                }

                .quote-block {
                    padding: 25px 15px;
                    font-size: 1.1rem;
                }
            }
        </style>`;
    }

    getPhilosophySubNav() {
        const pages = [
            { name: 'what-is-shoshin', label: 'Shoshin' },
            { name: 'adult-beginners-journey', label: 'Beginners' },
            { name: 'honor-values', label: 'Values' },
            { name: 'traditional-values', label: 'Traditions' },
            { name: 'the-art-of-peace', label: 'Art of Peace' },
            { name: 'health-and-safety', label: 'Health & Safety' },
        ];

        const links = pages.map(page => {
            const isActive = page.name === this.currentPage;
            const activeClass = isActive ? ' class="active"' : '';
            return `<a href="${page.name}.html"${activeClass}>${page.label}</a>`;
        }).join('');

        return `
        <nav class="philosophy-subnav">
            <div class="container">
                <div>
                    <span class="subnav-label">Philosophy Topics:</span>
                    ${links}
                </div>
            </div>
        </nav>`;
    }

    getCTASection() {
        return `
        <section class="cta-section">
            <div class="container">
                <div class="cta-content">
                    <h2 class="cta-title">Experience Traditional Aikido Training</h2>
                    <p class="cta-text">
                        Join a dojo where philosophy and practice unite. Experience the depth that comes from connecting to something greater than technique alone.
                    </p>
                    <a href="${this.basePath}index.html#intro-class" class="btn-primary">Begin Your Journey</a>
                </div>
            </div>
        </section>`;
    }

    replacePageContent() {
        const pageData = this.getPageData();
        
        // Update document title and meta description
        document.title = pageData.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', pageData.description);
        }

        // Inject unified styles
        const existingStyles = document.querySelectorAll('style');
        existingStyles.forEach(style => {
            if (!style.textContent.includes('shared-nav')) {
                style.remove();
            }
        });

        const styleElement = document.createElement('style');
        styleElement.innerHTML = this.getUnifiedStyles();
        document.head.appendChild(styleElement);

        // Replace main content
        const mainContent = document.querySelector('.main-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="container">
                    <!-- Japanese-Style Page Header -->
                    <div class="page-header">
                        <div class="japanese-characters">${pageData.kanji}</div>
                        <h1 class="page-title">${pageData.pageTitle}</h1>
                        <p class="page-subtitle">${pageData.subtitle}</p>
                    </div>

                    <!-- Philosophy Sub-Navigation -->
                    ${this.getPhilosophySubNav()}

                    <!-- Opening Quote -->
                    <section class="content-section">
                        <div class="quote-block">
                            ${pageData.quote}
                            <div class="quote-author">${pageData.quoteAuthor}</div>
                        </div>
                    </section>

                    <!-- Content will be dynamically loaded here -->
                    <div id="page-content"></div>
                </div>
            `;
        }

        // Add CTA section if it doesn't exist
        if (!document.querySelector('.cta-section')) {
            document.body.insertAdjacentHTML('beforeend', this.getCTASection());
        }
    }

    init() {
        // Replace the page content with unified template
        this.replacePageContent();
        
        // Initialize smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        console.log('Unified Philosophy Template initialized for:', this.currentPage);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UnifiedPhilosophyTemplate();
});