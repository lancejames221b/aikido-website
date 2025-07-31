# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install dependencies: `npm install`
- Run form testing suite: `npm run test:forms`
- Run mobile navigation tests: `npm run test:mobile-nav`
- Run tests in headless mode: `npm run test:forms:headless` or `npm run test:mobile-nav:headless`
- Start local development server: `node server.js` (runs on port 3000)

## Project Architecture

### Website Structure
This is a static Aikido dojo website project with multiple HTML variants and comprehensive testing infrastructure:

- **Main Website Files**: Multiple index variations (`index.html`, `index_shoshin.html`, `index_enhanced.html`, `index_testimonials.html`)
- **Page Structure**: Individual pages in `/pages/` directory for different sections (about, classes, instructors, specialized content)
- **Asset Management**: Images stored in both `/images/` and `/assets/images/` directories
- **Testing Infrastructure**: Comprehensive Puppeteer-based testing suites for forms and mobile navigation

### Key Components
- **Express Server** (`server.js`): Local development server with email form processing via Nodemailer
- **Form Testing Suite** (`form-testing-suite.js`): Automated testing for form functionality across site variants
- **Mobile Navigation Testing** (`mobile-navigation-test-suite.js`, `mobile-navigation-instructor-test-suite.js`): Mobile-specific navigation testing
- **Squarespace Integration** (`squarespace-form.js`): Form processing for Squarespace deployment

### Content Strategy
The project follows a phased enhancement approach:
- **Phase 1**: Shoshin-centered messaging strategy (completed)
- **Phase 2**: Enhanced social proof and testimonials (completed)  
- **Phase 3**: Technical and functional improvements (in progress)

### Testing Framework
Uses Puppeteer with axe-core for:
- Form functionality testing across different site variants
- Mobile navigation testing
- Accessibility compliance checking
- Cross-browser compatibility validation

### Deployment Strategy
- **Primary Platform**: Squarespace (see `squarespace-deployment-guide.md`)
- **Local Development**: Express server for testing and development
- **Form Processing**: Configured for both local Nodemailer and Squarespace native forms

## Development Workflow

### Working with HTML Variants
When making changes, consider which variant(s) need updates:
- `index.html`: Main production version
- `index_shoshin.html`: Shoshin philosophy focused version
- `index_enhanced.html`: Enhanced features version
- `index_testimonials.html`: Testimonial-focused version

### Testing Process
Always run the appropriate test suite after making changes:
```bash
npm run test:forms          # Test form functionality
npm run test:mobile-nav     # Test mobile navigation
```

### Content Updates
- **Research Files**: Comprehensive market research and strategy documents in markdown files
- **Student Materials**: PDF forms and guides for student onboarding
- **Analytics**: Google Analytics 4 integration configured in HTML files

## Specialized Pages
- **Philosophy Pages**: `what-is-shoshin.html`, `the-aikido-path.html`, `the-art-of-peace.html`
- **Practical Pages**: `adult-beginners-journey.html`, `health-and-safety.html`
- **Values Pages**: `honor-values.html`, `traditional-values.html`
- **Instructor Pages**: `sensei-connection.html`, dedicated instructor sections

## Image Management
- Logo files: `tree-logo.jpeg`, `logo.jpeg` in `/images/`
- Gallery images: `gallery1.jpg` through `gallery6.jpg`
- Instructor photos: Various formats in `/assets/images/`
- Squarespace CDN integration for production deployment

## Form Configuration
- Local development uses Express + Nodemailer
- Production deployment uses Squarespace native forms
- Email configuration through environment variables
- Comprehensive form testing for validation and submission

## Server Configuration
- Port 3000 is the local HTTP server for this project
- ngrok URL: https://6856264314dc.ngrok.app/ also works for external access

## Task Management
- Update vibe kanban tickets before starting a task, and after ending a task
- Do tasks in parallel when applicable for tickets