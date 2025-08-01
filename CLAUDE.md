# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install dependencies: `npm install`
- Install testing deps only: `npm run install:deps`
- Run form testing suite: `npm run test:forms`
- Run mobile navigation tests: `npm run test:mobile-nav`
- Run tests in headless mode: `npm run test:forms:headless` or `npm run test:mobile-nav:headless`
- Start local development server: `node server.js` (runs on port 3000)
- **New**: For web server local view, open Chrome with http server on port 3000

## Project Architecture

### Website Structure
This is a professional Aikido dojo website targeting Manhattan professionals aged 25-45, with comprehensive testing infrastructure:

- **Main Website File**: Single production version with integrated features
  - `index.html`: Main production version with comprehensive content including philosophy, testimonials, and new student sections
  - `index_backup_20250730_230054.html`: Backup version for rollback if needed
- **Philosophy Pages**: Deep content pages in `/pages/` directory for professionals seeking philosophical depth
- **Universal Navigation System**: JavaScript-based navigation (`js/universal-nav.js`) that adapts to both local and GitHub Pages deployment
- **Testing Infrastructure**: Comprehensive Puppeteer-based testing suites with accessibility validation

### Key Components
- **Express Server** (`server.js`): Local development server with Nodemailer email processing for form submissions
- **Universal Navigation Class** (`js/universal-nav.js`): Handles navigation across all pages with automatic path detection for local/GitHub Pages deployment
- **Form Testing Suite** (`form-testing-suite.js`): Automated form functionality testing with accessibility validation
- **Mobile Navigation Testing** (`mobile-navigation-instructor-test-suite.js`): Specialized mobile navigation testing across multiple device viewports (iPhone SE, iPhone 12, iPad, etc.) with instructor section validation
- **Philosophy Content System**: Structured content pages with interconnected navigation for deeper exploration

### Content Strategy & Target Audience
Based on Phase 2 completion (see README.md), the site targets Manhattan professionals with:
- **Demographics**: Ages 25-45, income $75k-$200k+, professional roles (tech, finance, consulting, creative)
- **Messaging**: "Vulnerability becomes strength" - addressing professional stress, confidence, and community needs
- **Social Proof**: 6 detailed testimonials from relatable professionals showing personal transformation
- **Philosophy Integration**: Deep content for professionals seeking meaningful practice beyond physical fitness

### Testing Framework Architecture
Uses Puppeteer with axe-core for comprehensive validation:
- **Cross-variant Testing**: Validates functionality across all HTML variants
- **Mobile-first Approach**: Specialized mobile navigation and responsive design testing
- **Accessibility Compliance**: axe-core integration for WCAG compliance validation
- **Form Processing**: Tests both local Nodemailer and Squarespace form handling

### Deployment Strategy
- **Primary Platform**: Squarespace for production deployment
- **Development Environment**: Express server with static file serving
- **Form Processing**: Dual configuration for local testing (Nodemailer) and production (Squarespace native forms)
- **GitHub Pages**: Automatic deployment capability with path detection in navigation system

## Development Workflow

### Content Management
The main `index.html` file contains comprehensive sections:
- **Hero Section**: Philosophy-driven messaging with "Where Vulnerability Becomes Strength"
- **New Student Section**: Integrated intro class information and scheduling
- **Testimonials**: Professional transformation stories throughout the page
- **Instructor Profiles**: Detailed 5-instructor grid with Japanese characters and responsive layout
- **Philosophy Integration**: Deep philosophical content integrated throughout

### Universal Navigation System
The `js/universal-nav.js` file handles navigation across all pages:
- **Automatic Path Detection**: Detects whether running locally or on GitHub Pages
- **Philosophy Subnav**: Automatically generates navigation for philosophy pages
- **Responsive Design**: Handles both desktop dropdown and mobile navigation
- **Current Page Highlighting**: Shows active page in navigation

### Philosophy Content Architecture
Philosophy pages are interconnected through the universal navigation with specific focus areas:
- **Shoshin Pages**: `what-is-shoshin.html` - beginner's mind philosophy
- **Journey Pages**: `adult-beginners-journey.html` (renamed to "Student Stories") - testimonials and experiences  
- **Values Pages**: `honor-values.html`, `traditional-values.html` - ethical and cultural foundations
- **Practice Pages**: `the-art-of-peace.html`, `health-and-safety.html` - deeper philosophical and practical guidance

### Testing Process
Always run appropriate test suites after making changes:
```bash
npm run test:forms          # Test form functionality and accessibility
npm run test:mobile-nav     # Test mobile navigation across device viewports and instructor section
npm run test:forms:headless # Headless form testing for CI/CD
npm run test:mobile-nav:headless # Headless mobile testing for CI/CD
```

### Mobile-Specific Testing
The mobile navigation test suite validates:
- **Responsive Design**: Tests across iPhone SE (320px), iPhone 12 (375px), iPhone 12 Pro Max (414px), iPad (768px), and iPad Pro (1024px)
- **Navigation Elements**: Hamburger menu functionality, anchor links, dropdown menus
- **Instructor Section**: 5-instructor grid layout, Japanese character rendering, photo gallery navigation
- **Accessibility**: axe-core validation for WCAG compliance across all viewports

### Content Strategy Implementation
Based on targeting Manhattan professionals seeking depth:
- **Professional Testimonials**: Real stories from similar demographics showing vulnerability-to-strength transformation
- **Philosophy Integration**: Each page connects practical benefits to deeper philosophical principles
- **Progressive Disclosure**: Homepage provides overview with clear paths to deeper content for interested users

## Critical Architecture Notes

### Form Processing Dual System
- **Local Development**: Express server with Nodemailer for testing form submissions
- **Production**: Squarespace native forms for actual deployment
- **Environment Variables**: EMAIL_USER and EMAIL_PASS for local email configuration
- **CORS Configuration**: Enabled for cross-origin form submissions during development

### Navigation Path Logic
The Universal Navigation system uses sophisticated path detection:
```javascript
// Handles both local development and GitHub Pages deployment
this.isGitHubPages = window.location.hostname.includes('github.io');
this.isHomePage = path === '/' || path.endsWith('/') || path.includes('index.html');
this.basePath = this.isHomePage ? '' : '../';
```

### Philosophy Page Integration
Philosophy pages use a subnav system that:
- Automatically detects current page and highlights it
- Provides consistent navigation across all philosophy content
- Maintains responsive design for mobile users
- Links back to main navigation seamlessly

## Server Configuration
- **Port 3000**: Default local development server
- **Static File Serving**: All files served from root directory
- **Email Processing**: Configured for Gmail SMTP with app password authentication
- **CORS Enabled**: For development and testing cross-origin requests

## Content Optimization Considerations
The homepage contains comprehensive content that may benefit from strategic condensation:
- **Information Density**: Current homepage has extensive content that provides depth but may overwhelm some users
- **Mobile Experience**: Long-form content requires significant scrolling on mobile devices
- **Progressive Disclosure**: Consider hub-and-spoke approach with summary content linking to detailed philosophy pages
- **Call-to-Action Focus**: Primary goal of intro class signup can get diluted by extensive content sections

## Workflow Notes
- Put tickets in review after you finish so we can review. If changes are needed, ticket goes back to progress, then review again, and finally to done when complete.

## Testing Infrastructure Notes
- **Puppeteer Testing**: Added infrastructure for checking web application functionality and user interactions
  - Puppeteer testing for checking different aspects of website behavior and responsiveness

## Web Infrastructure

### Website Domains
- genaikido.com is the original website 

### Contact Emails
- genaikidonyc@gmail.com is sensei's primary email
- genaikido@gmail.com is another sensei email
- aikidoalliance@yahoo.com is Sato Sensei's email for the Aikido Alliance

### External Resources
- https://www.aikidoworldalliance.com/ is the aikidoworld alliance website study that as well