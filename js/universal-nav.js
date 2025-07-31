// Universal Navigation System for Genshinkan Aikido Website
// Works for ALL pages: index.html and all philosophy pages

class UniversalNavigation {
    constructor() {
        // Handle both local development and GitHub Pages deployment
        const path = window.location.pathname;
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.isHomePage = path === '/' || path.endsWith('/') || path.includes('index.html') || path === '/aikido-website/' || path === '/aikido-website/index.html';
        this.basePath = this.isHomePage ? '' : '../';
        this.init();
    }

    getPhilosophySubnav() {
        const currentPage = window.location.pathname.split('/').pop();
        
        const philosophyPages = [
            { file: 'what-is-shoshin.html', name: 'Shoshin', label: 'Shoshin' },
            { file: 'adult-beginners-journey.html', name: 'Beginners', label: 'Beginners' },
            { file: 'honor-values.html', name: 'Values', label: 'Values' },
            { file: 'traditional-values.html', name: 'Traditions', label: 'Traditions' },
            { file: 'the-art-of-peace.html', name: 'The Art of Peace', label: 'Art of Peace' },
            { file: 'health-and-safety.html', name: 'Health & Safety', label: 'Health & Safety' }
        ];

        const subnavItems = philosophyPages.map(page => {
            const isActive = currentPage === page.file;
            const activeStyle = isActive ? 'color: #8B4513; font-weight: 600;' : 'color: #666;';
            return `<a href="${page.file}" style="margin: 0 1rem; ${activeStyle} text-decoration: none; font-size: 14px;">${page.label}</a>`;
        }).join('');

        return `
        <!-- Philosophy Sub-Navigation -->
        <nav class="philosophy-subnav" style="background-color: #f8f8f8 !important; border-bottom: 1px solid #e0e0e0; padding: 1rem 0; position: relative; z-index: 100;">
            <div class="container">
                <div style="text-align: center;">
                    ${subnavItems}
                </div>
            </div>
        </nav>
        `;
    }

    getNavigationHTML() {
        const isPhilosophyPage = !this.isHomePage;
        
        return `
        <!-- Universal Navigation Header -->
        <header class="universal-header">
            <div class="nav-container">
                <div class="nav-content">
                    <a href="${this.basePath}index.html" class="nav-logo">
                        <img src="${this.basePath}images/tree-logo.jpeg" alt="Genshinkan Aikido" class="logo-image">
                    </a>
                    
                    <nav class="nav-menu">
                        <div class="nav-item">
                            <a href="${this.basePath}index.html">Home</a>
                        </div>
                        <div class="nav-item nav-dropdown">
                            <a href="${this.basePath}index.html#about">About</a>
                            <div class="dropdown-menu">
                                <a href="${this.basePath}index.html#instructors">Instructors</a>
                                <a href="${this.basePath}index.html#aikido-world-alliance">Aikido World Alliance</a>
                                <a href="${this.basePath}index.html#training-commitment">The Path</a>
                                <a href="${this.basePath}index.html#who-thrives">Who Thrives Here</a>
                            </div>
                        </div>
                        <div class="nav-item nav-dropdown">
                            <a href="${this.basePath}index.html#classes">Training</a>
                            <div class="dropdown-menu">
                                <a href="${this.basePath}index.html#classes">Adult Training</a>
                                <a href="${this.basePath}index.html#kids-training">Kids Training (Ages 6-12)</a>
                                <a href="${this.basePath}index.html#gallery">Training Gallery</a>
                            </div>
                        </div>
                        <div class="nav-item nav-dropdown">
                            <a href="${this.basePath}index.html#philosophy-community">Philosophy</a>
                            <div class="dropdown-menu">
                                <a href="${this.basePath}pages/what-is-shoshin.html">What is Shoshin</a>
                                <a href="${this.basePath}pages/the-art-of-peace.html">The Art of Peace</a>
                                <a href="${this.basePath}pages/honor-values.html">Honor & Values</a>
                                <a href="${this.basePath}pages/traditional-values.html">Traditions</a>
                                <a href="${this.basePath}pages/health-and-safety.html">Health & Safety</a>
                                <a href="${this.basePath}pages/adult-beginners-journey.html">Adult Beginners Journey</a>
                            </div>
                        </div>
                        <div class="nav-item">
                            <a href="${this.basePath}index.html#questions">Questions</a>
                        </div>
                        <div class="nav-item">
                            <a href="${this.basePath}index.html#signup-form">Training Sign-Up</a>
                        </div>
                    </nav>

                    <!-- Mobile Menu Toggle -->
                    <button class="mobile-toggle" aria-label="Toggle mobile menu">
                        <span class="burger-line"></span>
                        <span class="burger-line"></span>
                        <span class="burger-line"></span>
                    </button>
                </div>

                <!-- Mobile Navigation -->
                <nav class="mobile-nav">
                    <div class="mobile-nav-item">
                        <a href="${this.basePath}index.html">Home</a>
                    </div>
                    <div class="mobile-nav-item mobile-dropdown">
                        <a href="${this.basePath}index.html#about">About</a>
                        <div class="mobile-dropdown-menu">
                            <a href="${this.basePath}index.html#instructors">Instructors</a>
                            <a href="${this.basePath}index.html#aikido-world-alliance">Aikido World Alliance</a>
                            <a href="${this.basePath}index.html#training-commitment">The Path</a>
                            <a href="${this.basePath}index.html#who-thrives">Who Thrives Here</a>
                        </div>
                    </div>
                    <div class="mobile-nav-item mobile-dropdown">
                        <a href="${this.basePath}index.html#classes">Training</a>
                        <div class="mobile-dropdown-menu">
                            <a href="${this.basePath}index.html#classes">Adult Training</a>
                            <a href="${this.basePath}index.html#kids-training">Kids Training (Ages 6-12)</a>
                            <a href="${this.basePath}index.html#gallery">Training Gallery</a>
                        </div>
                    </div>
                    <div class="mobile-nav-item mobile-dropdown">
                        <a href="${this.basePath}index.html#philosophy-community">Philosophy</a>
                        <div class="mobile-dropdown-menu">
                            <a href="${this.basePath}pages/what-is-shoshin.html">What is Shoshin</a>
                            <a href="${this.basePath}pages/the-art-of-peace.html">The Art of Peace</a>
                            <a href="${this.basePath}pages/honor-values.html">Honor & Values</a>
                            <a href="${this.basePath}pages/traditional-values.html">Traditions</a>
                            <a href="${this.basePath}pages/health-and-safety.html">Health & Safety</a>
                            <a href="${this.basePath}pages/adult-beginners-journey.html">Adult Beginners Journey</a>
                        </div>
                    </div>
                    <div class="mobile-nav-item">
                        <a href="${this.basePath}index.html#questions">Questions</a>
                    </div>
                    <div class="mobile-nav-item">
                        <a href="${this.basePath}index.html#signup-form">Training Sign-Up</a>
                    </div>
                </nav>
            </div>
        </header>
        ${isPhilosophyPage ? this.getPhilosophySubnav() : ''}
        `;
    }

    getNavigationCSS() {
        return `
        /* Universal Navigation CSS - Works on ALL pages */
        .universal-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            position: fixed;
            top: 0;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-container, .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .nav-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 0;
        }

        .nav-logo {
            display: flex;
            align-items: center;
            text-decoration: none;
        }

        .logo-image {
            height: 50px;
            width: auto;
            border-radius: 8px;
            transition: all 0.3s ease;
        }

        .logo-image:hover {
            transform: scale(1.05);
        }

        .nav-menu {
            display: flex;
            align-items: center;
            gap: 2rem;
        }

        .nav-item {
            position: relative;
        }

        .nav-item > a {
            color: #333;
            text-decoration: none;
            font-weight: 500;
            font-size: 14px;
            transition: color 0.3s ease;
            padding: 8px 0;
        }

        .nav-item > a:hover {
            color: #8B4513;
        }

        /* Dropdown Menus */
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            min-width: 200px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            z-index: 1010;
            padding: 8px 0;
        }

        .nav-dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-menu a {
            display: block;
            padding: 12px 16px;
            color: #555;
            text-decoration: none;
            font-size: 13px;
            transition: all 0.3s ease;
        }

        .dropdown-menu a:hover {
            background: #f8f9fa;
            color: #8B4513;
        }

        /* Mobile Navigation */
        .mobile-toggle {
            display: none;
            flex-direction: column;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
        }

        .burger-line {
            width: 24px;
            height: 2px;
            background: #333;
            margin: 3px 0;
            transition: 0.3s;
        }

        .mobile-nav {
            display: none;
            background: white;
            border-top: 1px solid #eee;
            padding: 20px 0;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .mobile-nav.open {
            display: block;
        }

        .mobile-nav-item {
            margin-bottom: 10px;
        }

        .mobile-nav-item > a {
            display: block;
            color: #333;
            text-decoration: none;
            font-weight: 500;
            padding: 12px 20px;
            border-bottom: 1px solid #f5f5f5;
            position: relative;
        }
        
        .mobile-dropdown > a::after {
            content: '+';
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            color: #8B4513;
            transition: transform 0.3s ease;
        }
        
        .mobile-dropdown > a.active::after {
            transform: translateY(-50%) rotate(45deg);
        }

        .mobile-dropdown-menu {
            display: none;
            background: #f8f8f8;
            border-left: 3px solid #8B4513;
            margin: 0;
            padding: 10px 0;
        }

        .mobile-dropdown-menu.open {
            display: block;
            animation: slideDown 0.3s ease;
        }

        .mobile-dropdown-menu a {
            display: block;
            color: #666;
            text-decoration: none;
            padding: 10px 20px 10px 40px;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .mobile-dropdown-menu a:hover {
            background: #efefef;
            color: #8B4513;
            padding-left: 45px;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Body padding for fixed header */
        body {
            padding-top: 80px;
        }
        
        /* Additional padding for philosophy pages with subnav */
        body.philosophy-page {
            padding-top: 80px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-menu {
                display: none;
            }

            .mobile-toggle {
                display: flex;
            }
        }

        /* Animation for mobile toggle */
        .mobile-toggle.open .burger-line:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .mobile-toggle.open .burger-line:nth-child(2) {
            opacity: 0;
        }

        .mobile-toggle.open .burger-line:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
        `;
    }

    init() {
        // Insert navigation HTML
        const navContainer = document.getElementById('universal-navigation');
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

        // Initialize functionality
        this.initMobileMenu();
        this.initDropdowns();
    }

    initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-toggle');
        const mobileNav = document.querySelector('.mobile-nav');

        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('open');
                mobileNav.classList.toggle('open');
            });

            // Handle mobile dropdowns
            document.querySelectorAll('.mobile-dropdown > a').forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    const dropdown = link.nextElementSibling;
                    
                    // Always prevent default and toggle dropdown for mobile
                    e.preventDefault();
                    if (dropdown) {
                        // Close other dropdowns first
                        document.querySelectorAll('.mobile-dropdown-menu.open').forEach(openDropdown => {
                            if (openDropdown !== dropdown) {
                                openDropdown.classList.remove('open');
                                openDropdown.previousElementSibling.classList.remove('active');
                            }
                        });
                        dropdown.classList.toggle('open');
                        link.classList.toggle('active');
                    }
                    
                    // If link has an actual target and dropdown is already open, navigate
                    if (href && href !== '#' && dropdown && dropdown.classList.contains('open')) {
                        // Allow navigation on second click
                        link.addEventListener('click', function handleSecondClick(e) {
                            link.removeEventListener('click', handleSecondClick);
                            window.location.href = href;
                        }, { once: true });
                    }
                });
            });
            
            // Handle clicks on dropdown menu items to close mobile nav
            document.querySelectorAll('.mobile-dropdown-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    // Close mobile navigation when clicking on any dropdown item
                    const mobileNav = document.querySelector('.mobile-nav');
                    const mobileToggle = document.querySelector('.mobile-toggle');
                    if (mobileNav) mobileNav.classList.remove('open');
                    if (mobileToggle) mobileToggle.classList.remove('open');
                    
                    // Also close all dropdowns
                    document.querySelectorAll('.mobile-dropdown-menu.open').forEach(dropdown => {
                        dropdown.classList.remove('open');
                        dropdown.previousElementSibling.classList.remove('active');
                    });
                });
            });
            
            // Handle clicks on non-dropdown nav items to close mobile nav
            document.querySelectorAll('.mobile-nav-item:not(.mobile-dropdown) > a').forEach(link => {
                link.addEventListener('click', () => {
                    // Close mobile navigation when clicking on regular nav items
                    const mobileNav = document.querySelector('.mobile-nav');
                    const mobileToggle = document.querySelector('.mobile-toggle');
                    if (mobileNav) mobileNav.classList.remove('open');
                    if (mobileToggle) mobileToggle.classList.remove('open');
                });
            });
        }
    }

    initDropdowns() {
        // Desktop dropdowns work with CSS hover
        // Remove any inline styles that might have been set
        document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
            dropdown.style.removeProperty('opacity');
            dropdown.style.removeProperty('visibility');
            dropdown.style.removeProperty('transform');
        });
        
        // Fix for dropdown links - allow navigation while keeping dropdown functional
        document.querySelectorAll('.nav-dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                // If the link has an href (not just #), allow navigation
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    // Let the link work normally
                    return true;
                }
                // Otherwise prevent default for dropdown-only items
                e.preventDefault();
            });
        });
    }
}

// Initialize universal navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Universal Navigation: DOM loaded, initializing...');
    const nav = new UniversalNavigation();
    
    // Reset dropdowns on window resize to prevent stuck states
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Remove any inline styles from dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                dropdown.style.removeProperty('opacity');
                dropdown.style.removeProperty('visibility');
                dropdown.style.removeProperty('transform');
            });
            
            // Close mobile menu if window is resized to desktop
            if (window.innerWidth > 768) {
                const mobileNav = document.querySelector('.mobile-nav');
                const mobileToggle = document.querySelector('.mobile-toggle');
                if (mobileNav) mobileNav.classList.remove('open');
                if (mobileToggle) mobileToggle.classList.remove('open');
            }
        }, 250);
    });
});