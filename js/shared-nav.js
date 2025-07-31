// Shared Navigation Component for Genshinkan Aikido Website

class SharedNavigation {
    constructor() {
        this.isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html');
        this.basePath = this.isHomePage ? '' : '../';
        this.init();
    }

    getNavigationHTML() {
        return `
        <!-- Header -->
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <a href="${this.basePath}index.html" class="header-logo">
                        <img src="${this.basePath}images/tree-logo.jpeg" alt="Genshinkan Aikido" style="height: 60px; width: auto; max-width: 180px;">
                    </a>
                    <nav class="header-nav">
                        <div class="header-nav-item">
                            <a href="${this.basePath}index.html#about">About</a>
                            <div class="header-nav-dropdown">
                                <a href="${this.basePath}index.html#instructors">Instructors</a>
                                <a href="${this.basePath}index.html#aikido-world-alliance">Aikido World Alliance</a>
                            </div>
                        </div>
                        <div class="header-nav-item">
                            <a href="${this.basePath}index.html#classes">Training</a>
                            <div class="header-nav-dropdown">
                                <a href="${this.basePath}index.html#classes">Adult Training</a>
                                <a href="${this.basePath}index.html#kids-training">Kids Training (Ages 6-12)</a>
                                <a href="${this.basePath}index.html#gallery">Training Gallery</a>
                            </div>
                        </div>
                        <div class="header-nav-item">
                            <a href="${this.basePath}index.html#philosophy-community">Philosophy</a>
                            <div class="header-nav-dropdown">
                                <a href="${this.basePath}pages/what-is-shoshin.html">What is Shoshin</a>
                                <a href="${this.basePath}pages/the-art-of-peace.html">The Art of Peace</a>
                                <a href="${this.basePath}pages/honor-values.html">Honor & Values</a>
                                <a href="${this.basePath}pages/traditional-values.html">Traditions</a>
                                <a href="${this.basePath}pages/health-and-safety.html">Health & Safety</a>
                                <a href="${this.basePath}pages/adult-beginners-journey.html">Adult Beginners Journey</a>
                            </div>
                        </div>
                        <a href="${this.basePath}index.html#contact">Questions</a>
                        <a href="${this.basePath}pages/student-portal.html">Student Portal</a>
                    </nav>
                    <button class="mobile-menu-toggle" aria-label="Toggle mobile menu">
                        <div class="burger-box">
                            <div class="burger-inner">
                                <div class="top-bun"></div>
                                <div class="patty"></div>
                                <div class="bottom-bun"></div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <!-- Mobile Navigation -->
            <nav class="mobile-nav">
                <ul class="mobile-nav-list">
                    <li class="mobile-nav-item">
                        <a href="${this.basePath}index.html#about">About</a>
                        <div class="mobile-nav-dropdown">
                            <a href="${this.basePath}index.html#instructors">Instructors</a>
                            <a href="${this.basePath}index.html#aikido-world-alliance">Aikido World Alliance</a>
                        </div>
                    </li>
                    <li class="mobile-nav-item">
                        <a href="${this.basePath}index.html#classes">Training</a>
                        <div class="mobile-nav-dropdown">
                            <a href="${this.basePath}index.html#classes">Adult Training</a>
                            <a href="${this.basePath}index.html#kids-training">Kids Training (Ages 6-12)</a>
                            <a href="${this.basePath}index.html#gallery">Training Gallery</a>
                        </div>
                    </li>
                    <li class="mobile-nav-item">
                        <a href="${this.basePath}index.html#philosophy-community">Philosophy</a>
                        <div class="mobile-nav-dropdown">
                            <a href="${this.basePath}pages/what-is-shoshin.html">What is Shoshin</a>
                            <a href="${this.basePath}pages/the-art-of-peace.html">The Art of Peace</a>
                            <a href="${this.basePath}pages/honor-values.html">Honor & Values</a>
                            <a href="${this.basePath}pages/traditional-values.html">Traditions</a>
                            <a href="${this.basePath}pages/health-and-safety.html">Health & Safety</a>
                            <a href="${this.basePath}pages/adult-beginners-journey.html">Adult Beginners Journey</a>
                        </div>
                    </li>
                    <li class="mobile-nav-item">
                        <a href="${this.basePath}index.html#contact">Questions</a>
                    </li>
                    <li class="mobile-nav-item">
                        <a href="${this.basePath}pages/student-portal.html">Student Portal</a>
                    </li>
                </ul>
            </nav>
        </header>`;
    }

    getNavigationCSS() {
        return `
        /* Shared Navigation Styles */
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            padding: 0;
        }

        .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 0;
            max-width: 1200px;
            margin: 0 auto;
            padding-left: 20px;
            padding-right: 20px;
        }

        .header-logo {
            display: flex;
            align-items: center;
            text-decoration: none;
            color: var(--sumi-black, #2C2C2C);
            font-weight: 600;
            font-size: 24px;
            gap: 12px;
        }

        .header-logo img {
            height: 60px;
            width: auto;
            max-width: 180px;
            object-fit: contain;
        }

        .logo-text {
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
        }

        .header-nav {
            display: flex;
            align-items: center;
            gap: 2rem;
        }

        .header-nav-item {
            position: relative;
        }

        .header-nav-item > a, .header-nav > a {
            text-decoration: none;
            color: var(--zen-gray, #666);
            font-weight: 500;
            font-size: 15px;
            transition: color 0.3s ease;
            padding: 8px 0;
        }

        .header-nav-item > a:hover, .header-nav > a:hover {
            color: var(--warm-brown, #8B4513);
        }

        .header-nav-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            min-width: 180px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-radius: 8px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1001;
        }

        .header-nav-item:hover .header-nav-dropdown {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        /* Ensure the main nav links are clickable even with dropdowns */
        .header-nav-item > a {
            pointer-events: auto;
            z-index: 1002;
            position: relative;
        }
        
        .header-nav-dropdown a {
            display: block;
            padding: 12px 16px;
            border-bottom: 1px solid #f5f5f5;
            font-size: 13px;
            color: var(--zen-gray, #666);
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .header-nav-dropdown a:last-child {
            border-bottom: none;
        }

        .header-nav-dropdown a:hover {
            color: var(--warm-brown, #8B4513);
        }


        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
            display: none;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
        }

        .burger-box {
            width: 24px;
            height: 18px;
            position: relative;
        }

        .burger-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 18px;
        }

        .top-bun, .patty, .bottom-bun {
            width: 100%;
            height: 2px;
            background: var(--sumi-black, #2C2C2C);
            position: absolute;
            transition: all 0.3s ease;
        }

        .top-bun { top: 0; }
        .patty { top: 8px; }
        .bottom-bun { top: 16px; }

        /* Mobile Navigation */
        .mobile-nav {
            display: none;
            background: white;
            border-top: 1px solid #eee;
        }

        .mobile-nav.open {
            display: block;
        }

        .mobile-nav-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .mobile-nav-item {
            border-bottom: 1px solid #f5f5f5;
        }

        .mobile-nav-item > a {
            display: block;
            padding: 16px 20px;
            text-decoration: none;
            color: var(--zen-gray, #666);
            font-weight: 500;
        }

        .mobile-nav-dropdown {
            display: none;
            background: rgba(0, 0, 0, 0.02);
        }

        .mobile-nav-dropdown.open {
            display: block;
        }

        .mobile-nav-dropdown a {
            display: block;
            padding: 12px 40px;
            font-size: 14px;
            color: var(--zen-gray, #666);
            text-decoration: none;
        }

        .mobile-nav-dropdown a:hover {
            color: var(--warm-brown, #8B4513);
        }


        /* Responsive */
        @media (max-width: 768px) {
            .header-nav {
                display: none;
            }

            .mobile-menu-toggle {
                display: block;
            }

            .header-content {
                padding: 10px 15px;
            }

            .header-logo {
                font-size: 20px;
                gap: 8px;
            }

            .header-logo img {
                height: 50px;
                max-width: 150px;
            }

            .mobile-nav-item > a {
                padding: 18px 20px;
                font-size: 16px;
            }

            .mobile-nav-dropdown a {
                padding: 15px 40px;
                font-size: 15px;
            }

        }

        @media (max-width: 480px) {
            .header-logo {
                font-size: 18px;
            }

            .header-logo img {
                height: 45px;
                max-width: 140px;
            }

            .mobile-nav-item > a {
                padding: 20px 15px;
                font-size: 15px;
            }

            .mobile-nav-dropdown a {
                padding: 18px 30px;
                font-size: 14px;
            }
        }

        /* Ensure content doesn't hide behind fixed header */
        body {
            padding-top: 80px;
        }

        @media (max-width: 768px) {
            body {
                padding-top: 70px;
            }
        }
        `;
    }

    init() {
        // Don't inject shared navigation on philosophy pages - they have their own headers
        if (document.body.classList.contains('philosophy-page')) {
            return;
        }

        // Inject navigation HTML
        const navContainer = document.getElementById('shared-navigation');
        if (navContainer) {
            navContainer.innerHTML = this.getNavigationHTML();
        } else {
            // Fallback: insert at beginning of body
            document.body.insertAdjacentHTML('afterbegin', this.getNavigationHTML());
        }

        // Inject navigation CSS
        const style = document.createElement('style');
        style.textContent = this.getNavigationCSS();
        document.head.appendChild(style);

        // Initialize navigation functionality
        this.initMobileMenu();
        this.initDropdowns();
    }

    initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        
        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', () => {
                mobileNav.classList.toggle('open');
                mobileToggle.classList.toggle('active');
            });
        }

        // Handle mobile dropdown toggles
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const link = item.querySelector('a');
            const dropdown = item.querySelector('.mobile-nav-dropdown');
            
            if (dropdown && link) {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    // For mobile, only prevent default for About and Training, let Philosophy navigate
                    if (href.includes('#about') || href.includes('#classes')) {
                        e.preventDefault();
                        dropdown.classList.toggle('open');
                    }
                    // Philosophy link navigates normally on mobile too
                });
            }
        });
    }

    initDropdowns() {
        // Handle desktop dropdown functionality
        document.querySelectorAll('.header-nav-item').forEach(item => {
            const dropdown = item.querySelector('.header-nav-dropdown');
            const link = item.querySelector('a');
            
            if (dropdown && link) {
                // Only prevent default for links that should show dropdown without navigation
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    // Allow Philosophy link to navigate normally, dropdown shows on hover
                    if (href.includes('#about') || href.includes('#classes')) {
                        e.preventDefault();
                        // Let hover handle the dropdown display for these
                    }
                    // Philosophy link navigates normally - no preventDefault
                });
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-nav-item')) {
                document.querySelectorAll('.header-nav-dropdown').forEach(dropdown => {
                    dropdown.style.opacity = '0';
                    dropdown.style.visibility = 'hidden';
                    dropdown.style.transform = 'translateY(-10px)';
                });
            }
        });
    }
}

// Initialize shared navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SharedNavigation();
});