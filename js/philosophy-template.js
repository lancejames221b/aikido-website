// Philosophy Page Template System
// Creates unified template for all philosophy pages with dynamic content loading

class PhilosophyPageTemplate {
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

    getPageContent() {
        const content = {
            'what-is-shoshin': {
                title: 'What is Shoshin? | Genshinkan Aikido',
                heroTitle: 'What is Shoshin?',
                heroSubtitle: '初心 - The Beginner\'s Mind',
                description: 'Discover the foundational philosophy of Shoshin - the beginner\'s mind that opens pathways to continuous learning and growth in Aikido.',
                navLabel: 'Shoshin',
                content: this.getShoshinContent()
            },
            'the-art-of-peace': {
                title: 'The Art of Peace | Genshinkan Aikido',
                heroTitle: 'The Art of Peace',
                heroSubtitle: 'Morihei Ueshiba\'s Philosophy',
                description: 'Explore the profound teachings of Aikido founder Morihei Ueshiba and his vision of martial arts as a path to peace.',
                navLabel: 'The Art of Peace',
                content: this.getArtOfPeaceContent()
            },
            'honor-values': {
                title: 'Honor & Values | Genshinkan Aikido',
                heroTitle: 'Honor & Values',
                heroSubtitle: 'Living with Integrity',
                description: 'Understanding how traditional martial arts values translate into modern life principles and personal integrity.',
                navLabel: 'Values',
                content: this.getHonorValuesContent()
            },
            'traditional-values': {
                title: 'Rooted in Ancient Traditions | Genshinkan Aikido',
                heroTitle: 'Rooted in Ancient Traditions',
                heroSubtitle: 'Connecting to Timeless Wisdom',
                description: 'Discover how ancient martial traditions create meaningful framework for modern practice and community.',
                navLabel: 'Traditions',
                content: this.getTraditionalValuesContent()
            },
            'health-and-safety': {
                title: 'Health & Safety | Genshinkan Aikido',
                heroTitle: 'Health & Safety',
                heroSubtitle: 'Mindful Practice Guidelines',
                description: 'Our comprehensive approach to safe, healthy Aikido training that respects both body and mind.',
                navLabel: 'Health & Safety',
                content: this.getHealthSafetyContent()
            },
            'adult-beginners-journey': {
                title: 'Adult Beginners Journey | Genshinkan Aikido',
                heroTitle: 'The Adult Beginner\'s Journey',
                heroSubtitle: 'Starting Aikido as an Adult',
                description: 'A supportive guide for adults beginning their Aikido journey, addressing common concerns and celebrating the unique advantages.',
                navLabel: 'Beginners',
                content: this.getAdultBeginnersContent()
            }
        };

        return content[this.currentPage] || content['what-is-shoshin'];
    }

    getTemplateHTML() {
        const pageData = this.getPageContent();
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${pageData.title}</title>
            <meta name="description" content="${pageData.description}">
            
            ${this.getCommonStyles()}
        </head>
        <body>
            <!-- Shared Navigation -->
            <div id="shared-navigation"></div>

            <!-- Philosophy Sub-Navigation -->
            ${this.getPhilosophySubNav()}

            <!-- Hero Section -->
            <section class="hero-section">
                <div class="container">
                    <div class="hero-content">
                        <h1 class="hero-title">${pageData.heroTitle}</h1>
                        <p class="hero-subtitle">${pageData.heroSubtitle}</p>
                    </div>
                </div>
            </section>

            <!-- Content Section -->
            <main class="main-content">
                <div class="container">
                    ${pageData.content}
                </div>
            </main>

            <!-- CTA Section -->
            ${this.getCTASection()}

            <!-- Scripts -->
            <script src="${this.basePath}js/shared-nav.js"></script>
            <script>
                // Philosophy page specific functionality
                document.addEventListener('DOMContentLoaded', function() {
                    // Smooth scroll behavior
                    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                        anchor.addEventListener('click', function (e) {
                            e.preventDefault();
                            const target = document.querySelector(this.getAttribute('href'));
                            if (target) {
                                target.scrollIntoView({ behavior: 'smooth' });
                            }
                        });
                    });

                    // Header background on scroll
                    const header = document.querySelector('.header');
                    if (header) {
                        window.addEventListener('scroll', function() {
                            if (window.scrollY > 50) {
                                header.style.background = 'rgba(255, 255, 255, 0.98)';
                                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                            } else {
                                header.style.background = 'rgba(255, 255, 255, 0.95)';
                                header.style.boxShadow = 'none';
                            }
                        });
                    }
                });
            </script>
        </body>
        </html>`;
    }

    getCommonStyles() {
        return `
            <!-- Fonts -->
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,700&family=Manrope:ital,wght@0,400;0,500;0,600;0,700&family=Lato:ital,wght@0,300;0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
            
            <style>
                :root {
                    --sumi-black: #2C2C2C;
                    --zen-gray: #666;
                    --warm-brown: #8B4513;
                    --washi-white: #fff;
                    --muted-gold: #D4AF37;
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

                /* Hero Section */
                .hero-section {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 80px 0 60px;
                    text-align: center;
                }

                .hero-title {
                    font-size: 3rem;
                    font-weight: 700;
                    color: var(--sumi-black);
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }

                .hero-subtitle {
                    font-size: 1.2rem;
                    color: var(--warm-brown);
                    font-weight: 500;
                    margin-bottom: 2rem;
                }

                /* Main Content */
                .main-content {
                    padding: 60px 0;
                }

                .content-section {
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    margin-bottom: 40px;
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
                }

                .section-title {
                    font-size: 2.5rem;
                    color: var(--sumi-black);
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                }

                .section-content p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: var(--zen-gray);
                    margin-bottom: 1.5rem;
                }

                .quote-box {
                    background: #f8f9fa;
                    border-left: 4px solid var(--warm-brown);
                    padding: 30px;
                    margin: 40px 0;
                    border-radius: 8px;
                }

                .quote-text {
                    font-size: 1.3rem;
                    font-style: italic;
                    color: var(--sumi-black);
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                .quote-author {
                    font-size: 1rem;
                    color: var(--warm-brown);
                    font-weight: 600;
                }

                /* CTA Section */
                .cta-section {
                    background: var(--sumi-black);
                    color: var(--washi-white);
                    padding: 80px 0;
                    text-align: center;
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

                /* Philosophy Sub-Navigation */
                .philosophy-subnav {
                    background: #f8f8f8;
                    border-bottom: 1px solid #e0e0e0;
                    padding: 1rem 0;
                    position: sticky;
                    top: 80px;
                    z-index: 100;
                }

                .philosophy-subnav a {
                    margin: 0 1rem;
                    color: var(--zen-gray);
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.3s ease;
                }

                .philosophy-subnav a:hover,
                .philosophy-subnav a.active {
                    color: var(--warm-brown);
                    font-weight: 600;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2rem;
                    }

                    .section-title {
                        font-size: 2rem;
                    }

                    .content-section {
                        padding: 20px;
                        margin-bottom: 20px;
                    }

                    .philosophy-subnav {
                        text-align: center;
                        padding: 0.5rem 0;
                    }

                    .philosophy-subnav a {
                        display: inline-block;
                        margin: 0.25rem 0.5rem;
                        font-size: 13px;
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
                <div style="text-align: center;">
                    <span style="color: var(--warm-brown); font-size: 14px; font-weight: 500; margin-right: 2rem;">Philosophy Topics:</span>
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

    // Content methods for each page (these would contain the specific content for each philosophy page)
    getShoshinContent() {
        return `
        <div class="content-section">
            <h2 class="section-title">The Beginner's Mind</h2>
            <div class="section-content">
                <p>Shoshin (初心) represents the beginner's mind - a state of openness, eagerness, and freedom from preconceptions when approaching any subject, even at an advanced level.</p>
                
                <p>In Aikido, maintaining shoshin means approaching each training session with fresh eyes, regardless of your experience level. This mindset prevents the ego from interfering with learning and allows for continuous growth and discovery.</p>
                
                <div class="quote-box">
                    <p class="quote-text">"In the beginner's mind there are many possibilities, but in the expert's mind there are few."</p>
                    <p class="quote-author">- Shunryu Suzuki</p>
                </div>
                
                <p>At Genshinkan, we cultivate shoshin not just on the mat, but as a life principle. Whether you're taking your first step onto the tatami or you've been training for decades, approaching practice with the curiosity and humility of a beginner opens doors to deeper understanding.</p>
                
                <p>This philosophy creates an environment where questions are welcomed, mistakes are learning opportunities, and every training partner - regardless of rank - has something valuable to offer.</p>
            </div>
        </div>`;
    }

    getArtOfPeaceContent() {
        return `
        <div class="content-section">
            <h2 class="section-title">Morihei Ueshiba's Vision</h2>
            <div class="section-content">
                <p>Morihei Ueshiba, the founder of Aikido, envisioned martial arts not as a means of conquest, but as a path to harmony and peace. His teachings, compiled in "The Art of Peace," provide the philosophical foundation for all Aikido practice.</p>
                
                <div class="quote-box">
                    <p class="quote-text">"The Art of Peace begins with you. Work on yourself and your appointed task in the Art of Peace."</p>
                    <p class="quote-author">- Morihei Ueshiba</p>
                </div>
                
                <p>Ueshiba taught that true victory is not defeating an opponent, but overcoming discord within ourselves. This internal transformation then radiates outward, creating harmony in our relationships and communities.</p>
                
                <p>At Genshinkan, we study these principles not as abstract philosophy, but as practical wisdom that guides our training and daily life. Each technique practiced with proper spirit becomes a meditation on these deeper truths.</p>
            </div>
        </div>`;
    }

    getHonorValuesContent() {
        return `
        <div class="content-section">
            <h2 class="section-title">Living with Integrity</h2>
            <div class="section-content">
                <p>Honor in Aikido extends far beyond the dojo walls. It encompasses how we treat others, how we conduct ourselves in daily life, and the integrity we bring to every interaction.</p>
                
                <p>Traditional martial arts values - respect, humility, perseverance, and sincerity - provide a framework for navigating modern challenges while maintaining our center and principles.</p>
                
                <div class="quote-box">
                    <p class="quote-text">"Your character is revealed not by what you do when others are watching, but by what you do when no one else is around."</p>
                </div>
                
                <p>At Genshinkan, we cultivate these values through daily practice, treating each training session as an opportunity to refine not just our technique, but our character. Every technique practiced with full commitment, every bow offered with genuine respect, every interaction guided by sincerity rather than pretense.</p>
            </div>
        </div>`;
    }

    getTraditionalValuesContent() {
        return `
        <div class="content-section">
            <h2 class="section-title">Connecting to Timeless Wisdom</h2>
            <div class="section-content">
                <p>Our training is rooted in ancient traditions that have guided martial artists for centuries. These time-tested principles provide stability and depth in an ever-changing world.</p>
                
                <p>When we bow before entering the dojo, practice techniques passed down through generations, and maintain proper etiquette, we connect to something larger than ourselves - a lineage of practitioners who have walked this path before us.</p>
                
                <div class="quote-box">
                    <p class="quote-text">"Tradition is not the worship of ashes, but the preservation of fire."</p>
                    <p class="quote-author">- Gustav Mahler</p>
                </div>
                
                <p>At Genshinkan, we honor these traditions not through rigid adherence to form, but by understanding and embodying their deeper meaning. This creates a bridge between ancient wisdom and contemporary life, allowing these principles to guide us in all situations.</p>
            </div>
        </div>`;
    }

    getHealthSafetyContent() {
        return `
        <div class="content-section">
            <h2 class="section-title">Mindful Practice Guidelines</h2>
            <div class="section-content">
                <p>Safe training is essential for long-term growth and development. At Genshinkan, we prioritize both physical safety and emotional well-being, creating an environment where everyone can train with confidence.</p>
                
                <p>Our approach to health and safety encompasses proper warm-up and conditioning, graduated intensity, clear communication between training partners, and respect for individual limitations and boundaries.</p>
                
                <p>We believe that martial arts training should enhance your life, not compromise it. This means listening to your body, communicating openly with instructors and training partners, and understanding that true strength comes from wisdom, not recklessness.</p>
                
                <div class="quote-box">
                    <p class="quote-text">"Take care of your body. It's the only place you have to live."</p>
                    <p class="quote-author">- Jim Rohn</p>
                </div>
                
                <p>Our instructors are trained in injury prevention and first aid, and we maintain clear protocols for addressing any concerns that arise during training. Your safety and well-being are our highest priority.</p>
            </div>
        </div>`;
    }

    getAdultBeginnersContent() {
        return `
        <div class="content-section">
            <h2 class="section-title">Starting Aikido as an Adult</h2>
            <div class="section-content">
                <p>Beginning Aikido as an adult brings unique advantages. Life experience, patience, and the ability to understand abstract concepts can actually accelerate learning compared to younger students.</p>
                
                <p>Many adults worry about starting martial arts "too late" or being too out of shape. At Genshinkan, we've seen students begin their journey at every stage of life and discover capabilities they never knew they had.</p>
                
                <div class="quote-box">
                    <p class="quote-text">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
                    <p class="quote-author">- Chinese Proverb</p>
                </div>
                
                <p>Our adult beginner program is designed to meet you where you are, both physically and mentally. We focus on gradual progression, clear instruction, and creating a supportive community where questions are welcomed and individual growth is celebrated.</p>
                
                <p>Whether you're seeking fitness, stress relief, personal development, or simply trying something new, Aikido offers a path that grows richer with time and practice.</p>
            </div>
        </div>`;
    }

    init() {
        // This would typically replace the entire page content
        // For now, we'll just initialize the template system
        console.log('Philosophy Template System initialized for:', this.currentPage);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PhilosophyPageTemplate();
});