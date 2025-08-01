#!/usr/bin/env node

/**
 * Accessibility Issue Finder for Genshinkan Aikido Website
 * Author: Lance James @ Unit 221B
 * 
 * Identifies specific accessibility issues found during testing
 */

const http = require('http');

class AccessibilityIssueFinder {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
    }

    async findSpecificIssues() {
        console.log('🔍 Identifying Specific Accessibility Issues...\n');
        
        return new Promise((resolve) => {
            const req = http.get(this.baseUrl, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    this.analyzeAccessibilityIssues(data);
                    resolve();
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ Failed to fetch page:', error.message);
                resolve();
            });
        });
    }

    analyzeAccessibilityIssues(htmlData) {
        console.log('📊 SPECIFIC ACCESSIBILITY ISSUES IDENTIFIED:\n');
        
        // Find images without alt text
        const imgRegex = /<img[^>]*>/gi;
        const images = htmlData.match(imgRegex) || [];
        let issueCount = 0;
        
        console.log('🖼️  IMAGE ALT TEXT ANALYSIS:');
        images.forEach((img, index) => {
            if (!img.includes('alt=')) {
                issueCount++;
                console.log(`❌ Image ${index + 1} missing alt attribute:`);
                console.log(`   ${img.substring(0, 100)}...`);
                
                // Try to extract src for identification
                const srcMatch = img.match(/src="([^"]*)"/);
                if (srcMatch) {
                    console.log(`   Image source: ${srcMatch[1]}`);
                }
                console.log('');
            } else if (img.includes('alt=""')) {
                console.log(`ℹ️  Image ${index + 1} has empty alt (decorative - OK):`);
                const srcMatch = img.match(/src="([^"]*)"/) || img.match(/src='([^']*)'/);
                if (srcMatch) {
                    console.log(`   Image source: ${srcMatch[1]}`);
                }
                console.log('');
            }
        });
        
        if (issueCount === 0) {
            console.log('✅ All images have alt attributes!\n');
        }
        
        // Find form inputs without labels
        console.log('📝 FORM LABEL ANALYSIS:');
        
        // Extract all inputs
        const inputRegex = /<input[^>]*>/gi;
        const textareaRegex = /<textarea[^>]*>/gi;
        const selectRegex = /<select[^>]*>/gi;
        
        const inputs = [
            ...(htmlData.match(inputRegex) || []),
            ...(htmlData.match(textareaRegex) || []),
            ...(htmlData.match(selectRegex) || [])
        ];
        
        // Extract all labels
        const labelRegex = /<label[^>]*for="([^"]*)"[^>]*>/gi;
        const labels = [];
        let labelMatch;
        while ((labelMatch = labelRegex.exec(htmlData)) !== null) {
            labels.push(labelMatch[1]);
        }
        
        console.log(`Found ${inputs.length} form inputs and ${labels.length} labels with 'for' attributes\n`);
        
        let unlabeledInputs = 0;
        inputs.forEach((input, index) => {
            // Check if input has id and if there's a corresponding label
            const idMatch = input.match(/id="([^"]*)"/);
            const nameMatch = input.match(/name="([^"]*)"/);
            const ariaLabelMatch = input.match(/aria-label="([^"]*)"/);
            const ariaLabelledByMatch = input.match(/aria-labelledby="([^"]*)"/);
            
            const hasLabel = idMatch && labels.includes(idMatch[1]);
            const hasAriaLabel = ariaLabelMatch || ariaLabelledByMatch;
            
            if (!hasLabel && !hasAriaLabel) {
                unlabeledInputs++;
                console.log(`❌ Input ${index + 1} lacks proper labeling:`);
                console.log(`   ${input.substring(0, 100)}...`);
                if (idMatch) console.log(`   ID: ${idMatch[1]}`);
                if (nameMatch) console.log(`   Name: ${nameMatch[1]}`);
                console.log('   Suggestion: Add <label for="input-id"> or aria-label attribute');
                console.log('');
            }
        });
        
        if (unlabeledInputs === 0) {
            console.log('✅ All form inputs have proper labels!\n');
        }
        
        // Summary
        console.log('📋 ACCESSIBILITY ISSUE SUMMARY:');
        console.log(`• Images missing alt text: ${issueCount}`);
        console.log(`• Form inputs missing labels: ${unlabeledInputs}`);
        console.log(`• Total accessibility violations: ${issueCount + unlabeledInputs}`);
        
        if (issueCount + unlabeledInputs === 0) {
            console.log('\n🎉 No accessibility issues found! Website is ready for deployment.');
        } else {
            console.log('\n⚠️  Please fix these issues before deployment to ensure WCAG compliance.');
        }
    }
}

// Main execution
async function main() {
    const finder = new AccessibilityIssueFinder();
    await finder.findSpecificIssues();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = AccessibilityIssueFinder;