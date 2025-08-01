#!/usr/bin/env node

/**
 * Basic Functionality Tests for Genshinkan Aikido Website
 * Author: Lance James @ Unit 221B
 * 
 * Fallback testing approach using HTTP requests and basic checks
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class BasicFunctionalityTests {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.results = [];
    }

    async addResult(testName, status, findings, errors = [], metrics = {}) {
        const result = {
            testName,
            status,
            findings,
            errors,
            metrics,
            timestamp: new Date().toISOString()
        };
        
        this.results.push(result);
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${testName}: ${status}`);
        if (findings) console.log(`   Findings: ${findings}`);
        if (errors.length > 0) console.log(`   Errors: ${errors.join(', ')}`);
        if (Object.keys(metrics).length > 0) {
            console.log(`   Metrics: ${JSON.stringify(metrics, null, 2)}`);
        }
        console.log('');
    }

    async testHttpResponse() {
        console.log('🏠 Testing HTTP Response...');
        
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const req = http.get(this.baseUrl, (res) => {
                const loadTime = Date.now() - startTime;
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', async () => {
                    try {
                        let findings = [];
                        let errors = [];
                        let status = 'PASS';
                        
                        // Check status code
                        if (res.statusCode !== 200) {
                            errors.push(`HTTP Status: ${res.statusCode}`);
                            status = 'FAIL';
                        } else {
                            findings.push(`HTTP Status: ${res.statusCode} OK`);
                        }
                        
                        // Check content length
                        findings.push(`Content Length: ${data.length} bytes`);
                        
                        // Check if it's HTML
                        const isHtml = data.toLowerCase().includes('<html') || data.toLowerCase().includes('<!doctype html');
                        if (isHtml) {
                            findings.push('Valid HTML document detected');
                        } else {
                            errors.push('Response does not appear to be HTML');
                            status = 'FAIL';
                        }
                        
                        // Extract title
                        const titleMatch = data.match(/<title[^>]*>([^<]*)<\/title>/i);
                        const title = titleMatch ? titleMatch[1].trim() : 'No title found';
                        findings.push(`Page title: "${title}"`);
                        
                        // Check for meta description
                        const metaDescMatch = data.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
                        const hasMetaDesc = metaDescMatch !== null;
                        if (hasMetaDesc) {
                            findings.push(`Meta description found: "${metaDescMatch[1]}"`);
                        } else {
                            findings.push('No meta description found');
                        }
                        
                        // Count CSS and JS files
                        const cssCount = (data.match(/<link[^>]*rel="stylesheet"[^>]*>/gi) || []).length;
                        const jsCount = (data.match(/<script[^>]*src=[^>]*>/gi) || []).length;
                        findings.push(`${cssCount} CSS files, ${jsCount} JS files`);
                        
                        // Count images
                        const imgCount = (data.match(/<img[^>]*>/gi) || []).length;
                        findings.push(`${imgCount} images found`);
                        
                        // Check for favicon
                        const hasFavicon = data.toLowerCase().includes('rel="icon"') || data.toLowerCase().includes('rel="shortcut icon"');
                        if (hasFavicon) {
                            findings.push('Favicon link found');
                        } else {
                            findings.push('No favicon link found');
                        }
                        
                        const metrics = {
                            loadTime,
                            statusCode: res.statusCode,
                            contentLength: data.length,
                            title,
                            hasMetaDescription: hasMetaDesc,
                            cssCount,
                            jsCount,
                            imgCount,
                            hasFavicon
                        };
                        
                        await this.addResult(
                            'Homepage Load Test',
                            status,
                            findings.join(', '),
                            errors,
                            metrics
                        );
                        
                        resolve({ data, success: status !== 'FAIL' });
                        
                    } catch (parseError) {
                        await this.addResult(
                            'Homepage Load Test',
                            'FAIL',
                            'Failed to parse response',
                            [parseError.message]
                        );
                        resolve({ data: '', success: false });
                    }
                });
            });
            
            req.on('error', async (error) => {
                await this.addResult(
                    'Homepage Load Test',
                    'FAIL',
                    'Failed to connect to server',
                    [error.message]
                );
                resolve({ data: '', success: false });
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                this.addResult(
                    'Homepage Load Test',
                    'FAIL',
                    'Request timeout',
                    ['Request took longer than 10 seconds']
                ).then(() => resolve({ data: '', success: false }));
            });
        });
    }

    async testNavigationLinks(htmlData) {
        console.log('🧭 Testing Navigation Links...');
        
        try {
            let findings = [];
            let errors = [];
            let status = 'PASS';
            
            // Extract all links
            const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
            const links = [];
            let match;
            
            while ((match = linkRegex.exec(htmlData)) !== null) {
                const href = match[1];
                const text = match[2].replace(/\s+/g, ' ').trim();
                if (href && href !== '#' && text) {
                    links.push({ href, text });
                }
            }
            
            findings.push(`${links.length} navigation links found`);
            
            // Test internal links
            let internalLinks = 0;
            let externalLinks = 0;
            let brokenLinks = [];
            
            for (const link of links) {
                if (link.href.startsWith('http://localhost:3000') || 
                    link.href.startsWith('/') || 
                    link.href.startsWith('./') || 
                    link.href.startsWith('../')) {
                    internalLinks++;
                    
                    // Test the link
                    try {
                        const linkUrl = link.href.startsWith('http') ? link.href : 
                                      `${this.baseUrl}${link.href.startsWith('/') ? '' : '/'}${link.href}`;
                        
                        const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" "${linkUrl}"`);
                        const statusCode = parseInt(stdout.trim());
                        
                        if (statusCode !== 200) {
                            brokenLinks.push({ text: link.text, href: link.href, status: statusCode });
                        }
                    } catch (curlError) {
                        brokenLinks.push({ text: link.text, href: link.href, error: curlError.message });
                    }
                } else if (link.href.startsWith('http')) {
                    externalLinks++;
                }
            }
            
            findings.push(`${internalLinks} internal links`);
            findings.push(`${externalLinks} external links`);
            
            if (brokenLinks.length > 0) {
                errors.push(`${brokenLinks.length} broken links found`);
                brokenLinks.forEach(link => {
                    errors.push(`Broken: "${link.text}" -> ${link.href} (${link.status || link.error})`);
                });
                status = 'FAIL';
            }
            
            // Check for mobile menu elements
            const hasMobileMenu = htmlData.toLowerCase().includes('hamburger') || 
                                 htmlData.toLowerCase().includes('menu-toggle') ||
                                 htmlData.toLowerCase().includes('mobile-menu');
            
            if (hasMobileMenu) {
                findings.push('Mobile menu elements detected');
            }
            
            const metrics = {
                totalLinks: links.length,
                internalLinks,
                externalLinks,
                brokenLinks: brokenLinks.length,
                hasMobileMenu,
                brokenLinksDetail: brokenLinks
            };
            
            await this.addResult(
                'Navigation Testing',
                status,
                findings.join(', '),
                errors,
                metrics
            );
            
        } catch (error) {
            await this.addResult(
                'Navigation Testing',
                'FAIL',
                'Failed to test navigation',
                [error.message]
            );
        }
    }

    async testContactForm(htmlData) {
        console.log('📝 Testing Contact Form...');
        
        try {
            let findings = [];
            let errors = [];
            let status = 'PASS';
            
            // Look for forms
            const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
            const forms = [];
            let match;
            
            while ((match = formRegex.exec(htmlData)) !== null) {
                forms.push(match[1]);
            }
            
            if (forms.length === 0) {
                await this.addResult(
                    'Contact Form Testing',
                    'FAIL',
                    'No forms found on the page',
                    ['No <form> elements detected']
                );
                return;
            }
            
            findings.push(`${forms.length} forms found`);
            
            // Analyze each form
            let contactFormsFound = 0;
            
            for (let i = 0; i < forms.length; i++) {
                const formContent = forms[i].toLowerCase();
                
                // Check if it looks like a contact form
                const isContactForm = formContent.includes('name') || 
                                    formContent.includes('email') || 
                                    formContent.includes('message') ||
                                    formContent.includes('contact');
                
                if (isContactForm) {
                    contactFormsFound++;
                    
                    // Check for required fields
                    const hasNameField = formContent.includes('name') && 
                                        (formContent.includes('input') || formContent.includes('text'));
                    const hasEmailField = formContent.includes('email') && 
                                         formContent.includes('input');
                    const hasMessageField = formContent.includes('message') || 
                                          formContent.includes('textarea');
                    const hasSubmitButton = formContent.includes('submit') || 
                                          formContent.includes('button');
                    
                    if (hasNameField) findings.push('Name field found');
                    else errors.push('Name field missing');
                    
                    if (hasEmailField) findings.push('Email field found');
                    else errors.push('Email field missing');
                    
                    if (hasMessageField) findings.push('Message field found');
                    else errors.push('Message field missing');
                    
                    if (hasSubmitButton) findings.push('Submit button found');
                    else errors.push('Submit button missing');
                    
                    // Check for form validation attributes
                    const hasValidation = formContent.includes('required') || 
                                        formContent.includes('pattern') ||
                                        formContent.includes('minlength');
                    
                    if (hasValidation) {
                        findings.push('Form validation attributes found');
                    } else {
                        findings.push('No validation attributes detected');
                    }
                    
                    break; // Only analyze first contact form
                }
            }
            
            if (contactFormsFound === 0) {
                await this.addResult(
                    'Contact Form Testing',
                    'FAIL',
                    'No contact forms found',
                    ['No forms with contact-related fields detected']
                );
                return;
            }
            
            if (errors.length > 0) {
                status = 'FAIL';
            }
            
            const metrics = {
                totalForms: forms.length,
                contactForms: contactFormsFound
            };
            
            await this.addResult(
                'Contact Form Testing',
                status,
                findings.join(', '),
                errors,
                metrics
            );
            
        } catch (error) {
            await this.addResult(
                'Contact Form Testing',
                'FAIL',
                'Failed to test contact form',
                [error.message]
            );
        }
    }

    async testBasicAccessibility(htmlData) {
        console.log('♿ Testing Basic Accessibility...');
        
        try {
            let findings = [];
            let errors = [];
            let status = 'PASS';
            
            // Check images for alt text
            const imgRegex = /<img[^>]*>/gi;
            const images = htmlData.match(imgRegex) || [];
            let imagesWithAlt = 0;
            let imagesWithoutAlt = 0;
            let decorativeImages = 0;
            
            images.forEach(img => {
                if (img.includes('alt=""')) {
                    decorativeImages++;
                } else if (img.includes('alt=')) {
                    imagesWithAlt++;
                } else {
                    imagesWithoutAlt++;
                }
            });
            
            findings.push(`${images.length} images total`);
            findings.push(`${imagesWithAlt} with alt text`);
            findings.push(`${decorativeImages} decorative (empty alt)`);
            
            if (imagesWithoutAlt > 0) {
                errors.push(`${imagesWithoutAlt} images missing alt text`);
                status = 'FAIL';
            }
            
            // Check heading structure
            const h1Count = (htmlData.match(/<h1[^>]*>/gi) || []).length;
            const totalHeadings = (htmlData.match(/<h[1-6][^>]*>/gi) || []).length;
            
            findings.push(`${totalHeadings} heading elements`);
            
            if (h1Count === 1) {
                findings.push('Proper H1 structure (1 H1)');
            } else if (h1Count === 0) {
                errors.push('No H1 heading found');
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            } else {
                errors.push(`Multiple H1 headings (${h1Count})`);
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }
            
            // Check form labels
            const inputs = (htmlData.match(/<input[^>]*>/gi) || []).length;
            const textareas = (htmlData.match(/<textarea[^>]*>/gi) || []).length;
            const totalInputs = inputs + textareas;
            
            const labels = (htmlData.match(/<label[^>]*>/gi) || []).length;
            const ariaLabels = (htmlData.match(/aria-label=/gi) || []).length;
            
            findings.push(`${totalInputs} form inputs found`);
            findings.push(`${labels} labels, ${ariaLabels} aria-labels`);
            
            if (totalInputs > 0 && (labels + ariaLabels) < totalInputs) {
                errors.push('Some inputs may be missing labels');
                status = status === 'FAIL' ? 'FAIL' : 'WARNING';
            }
            
            // Check for skip links
            const hasSkipLinks = htmlData.toLowerCase().includes('skip to') || 
                                htmlData.toLowerCase().includes('skip nav');
            
            if (hasSkipLinks) {
                findings.push('Skip navigation links found');
            }
            
            const metrics = {
                totalImages: images.length,
                imagesWithAlt,
                imagesWithoutAlt,
                decorativeImages,
                h1Count,
                totalHeadings,
                totalInputs,
                labels,
                ariaLabels,
                hasSkipLinks
            };
            
            await this.addResult(
                'Basic Accessibility Check',
                status,
                findings.join(', '),
                errors,
                metrics
            );
            
        } catch (error) {
            await this.addResult(
                'Basic Accessibility Check',
                'FAIL',
                'Failed to test accessibility',
                [error.message]
            );
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Basic Functionality Tests...\n');
        
        try {
            // Test 1: HTTP Response and Homepage Load
            const { data: htmlData, success } = await this.testHttpResponse();
            
            if (success && htmlData) {
                // Test 2: Navigation Links
                await this.testNavigationLinks(htmlData);
                
                // Test 3: Contact Form
                await this.testContactForm(htmlData);
                
                // Test 4: Basic Accessibility
                await this.testBasicAccessibility(htmlData);
            } else {
                console.log('⚠️  Skipping additional tests due to homepage load failure.');
            }
            
        } catch (error) {
            console.error('Test suite error:', error);
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 BASIC FUNCTIONALITY TESTING REPORT');
        console.log('='.repeat(80));
        
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'PASS').length;
        const failedTests = this.results.filter(r => r.status === 'FAIL').length;
        const warningTests = this.results.filter(r => r.status === 'WARNING').length;
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`Total Tests: ${totalTests}`);
        console.log(`✅ Passed: ${passedTests}`);
        console.log(`❌ Failed: ${failedTests}`);
        console.log(`⚠️  Warnings: ${warningTests}`);
        console.log(`Success Rate: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
        
        console.log(`\n📋 DETAILED RESULTS:`);
        this.results.forEach(result => {
            const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
            console.log(`\n${statusIcon} ${result.testName}: ${result.status}`);
            console.log(`   Findings: ${result.findings}`);
            if (result.errors.length > 0) {
                console.log(`   Errors: ${result.errors.join(', ')}`);
            }
        });

        // Critical Issues Summary
        const criticalIssues = this.results
            .filter(r => r.status === 'FAIL')
            .map(r => `${r.testName}: ${r.errors.join(', ')}`);
            
        if (criticalIssues.length > 0) {
            console.log(`\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:`);
            criticalIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        } else {
            console.log(`\n✅ No critical issues found!`);
        }

        console.log('\n📝 RECOMMENDATIONS:');
        if (failedTests === 0 && warningTests === 0) {
            console.log('• Website appears to be functioning well');
            console.log('• Consider running more comprehensive accessibility tests');
            console.log('• Test form submission functionality manually');
        } else {
            console.log('• Address all failed tests before deployment');
            console.log('• Review warnings for potential improvements');
            console.log('• Test website on multiple devices and browsers');
        }

        console.log('\n' + '='.repeat(80));
        
        // Save report
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests,
                warningTests,
                successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
            },
            results: this.results,
            criticalIssues
        };
        
        const reportPath = path.join(__dirname, `basic-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
        console.log(`📄 Detailed report saved to: ${reportPath}`);
    }
}

// Main execution
async function main() {
    const testSuite = new BasicFunctionalityTests();
    
    try {
        await testSuite.runAllTests();
        testSuite.generateReport();
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = BasicFunctionalityTests;