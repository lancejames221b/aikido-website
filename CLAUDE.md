# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install dependencies: `npm install`
- Install testing deps only: `npm run install:deps`
- Run form testing suite: `npm run test:forms`
- Run mobile navigation tests: `npm run test:mobile-nav`
- Run tests in headless mode: `npm run test:forms:headless` or `npm run test:mobile-nav:headless`
- Run Phase 2 UX tests: `npm run test:phase2` or `npm run test:phase2:headless`
- Start local development server: `node server.js` (runs on port 3000)
- View site locally: Open Chrome and navigate to http://localhost:3000

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
npm run test:phase2         # Comprehensive UX analysis across devices
npm run test:phase2:headless # Headless UX analysis for CI/CD
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

## Current Optimization Initiative (Phase 2+)
Based on content analysis showing 75% marketing / 25% martial content balance:
- **Goal**: Shift toward 50/50 balance between accessibility and authenticity
- **Approach**: "Less is more" budo approach - removing promotional language while maintaining effectiveness
- **Focus**: Individual journey discovery rather than demographic targeting
- **Reference**: genaikido.com for minimal, authentic communication style

## Important Files & Resources

### Key Data Files
- `original_site_data.json`: Comprehensive scrape of genaikido.com showing minimal approach
- `new_site.json`: Current site content extraction with balance analysis
- `scraped_data.json`: Additional reference data from original site

### Testing Reports
- `testing/phase2-comprehensive-ux-report.md`: Latest UX analysis across all devices
- `testing/comprehensive-website-testing-suite.js`: Main testing framework
- `testing/phase2-ux-analysis-suite.js`: Phase 2 UX testing implementation

### Communication Analysis
- `communication-analysis-sensei-2023-2025.md`: Analysis of authentic communication style from Slack/email

## External References

### Website Domains & Contacts
- genaikido.com: Original website reference for minimal approach
- genaikidonyc@gmail.com: Sensei's primary email
- genaikido@gmail.com: Alternative sensei email
- aikidoalliance@yahoo.com: Sato Sensei's email for Aikido Alliance
- https://www.aikidoworldalliance.com/: Aikido World Alliance website

### Content Guidelines
- Leave instructor bios verbatim from `original_site_data.json`
- When needing detailed information, reference genaikido.com content
- Maintain traditional martial arts terminology without excessive explanation
- Focus on "what Aikido demands of students, not just what it offers them"