// Enhanced form handling for Genshinkan Aikido with Claude Sonnet 4 API Integration
// Author: Lance James @ Unit 221B
// This script adds intelligent form processing using Claude AI

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('intro-class-form');
    
    if (!form) return;

    // Initialize Claude API integration
    let claudeAPI = null;
    
    // Check for API key in environment or prompt user
    const initializeClaudeAPI = async () => {
        // First try to get API key from secure storage or environment
        let apiKey = await getStoredAPIKey();
        
        if (!apiKey) {
            // If no stored key, check if we're in a development environment
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                apiKey = prompt('Please enter your Claude API key for testing (starts with sk-ant-):');
                if (apiKey && apiKey.startsWith('sk-ant-')) {
                    await storeAPIKey(apiKey); // Store securely for this session
                }
            }
        }
        
        if (apiKey) {
            try {
                claudeAPI = new ClaudeAPIIntegration(apiKey, {
                    debug: window.location.hostname === 'localhost',
                    maxTokens: 2048,
                    temperature: 0.6
                });
                
                // Validate API key
                const isValid = await claudeAPI.validateAPIKey();
                if (!isValid) {
                    console.error('Invalid Claude API key');
                    claudeAPI = null;
                    showNotification('Claude AI integration unavailable - using standard form processing', 'warning');
                } else {
                    console.log('Claude API integration initialized successfully');
                    showNotification('Claude AI integration active - enhanced form processing enabled', 'success');
                }
            } catch (error) {
                console.error('Failed to initialize Claude API:', error);
                claudeAPI = null;
                showNotification('Claude AI unavailable - form will use standard processing', 'info');
            }
        }
    };

    // Initialize API integration
    initializeClaudeAPI();

    // Form validation functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validatePhone(phone) {
        if (!phone) return true; // Optional field
        const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)\.]{7,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    function showError(field, message) {
        // Remove existing error
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add error styling
        field.style.borderColor = '#e74c3c';
        field.style.backgroundColor = '#fdf2f2';

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            padding: 0.25rem 0;
        `;
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    function clearError(field) {
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
        field.style.backgroundColor = '';
    }

    function showSuccess(message) {
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border: 1px solid #c3e6cb;
            text-align: center;
            font-weight: 500;
        `;
        successDiv.textContent = message;
        
        form.parentNode.insertBefore(successDiv, form);
        form.style.display = 'none';
        
        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showFormError(message) {
        // Remove existing form error
        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // Create form error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            border: 1px solid #f5c6cb;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        form.insertBefore(errorDiv, form.firstChild);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Real-time validation
    form.addEventListener('input', function(e) {
        const field = e.target;
        clearError(field);

        if (field.name === 'email' && field.value) {
            if (!validateEmail(field.value)) {
                showError(field, 'Please enter a valid email address');
            }
        }

        if (field.name === 'phone' && field.value) {
            if (!validatePhone(field.value)) {
                showError(field, 'Please enter a valid phone number');
            }
        }
    });

    // Enhanced form submission with Claude AI integration
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        const errorMessages = form.querySelectorAll('.error-message, .form-error');
        errorMessages.forEach(error => error.remove());

        // Get form data - updated to match actual form fields
        const formData = new FormData(form);
        const data = {
            fname: formData.get('fname')?.trim(),
            lname: formData.get('lname')?.trim(),
            email: formData.get('email')?.trim(),
            phone: formData.get('phone')?.trim(),
            experience: formData.get('experience')?.trim(),
            why: formData.get('why')?.trim(),
            classDate: formData.get('classDate'),
            classTime: formData.get('classTime'),
            howHeard: formData.get('howHeard'),
            additionalInfo: formData.get('additionalInfo')?.trim()
        };

        // Enhanced validation with Claude AI insights
        let hasErrors = false;

        // Basic required field validation
        if (!data.fname) {
            showError(form.querySelector('[name="fname"]'), 'First name is required');
            hasErrors = true;
        }

        if (!data.lname) {
            showError(form.querySelector('[name="lname"]'), 'Last name is required');
            hasErrors = true;
        }

        if (!data.email) {
            showError(form.querySelector('[name="email"]'), 'Email is required');
            hasErrors = true;
        } else if (!validateEmail(data.email)) {
            showError(form.querySelector('[name="email"]'), 'Please enter a valid email address');
            hasErrors = true;
        }

        if (!data.phone) {
            showError(form.querySelector('[name="phone"]'), 'Phone number is required');
            hasErrors = true;
        } else if (!validatePhone(data.phone)) {
            showError(form.querySelector('[name="phone"]'), 'Please enter a valid phone number');
            hasErrors = true;
        }

        if (!data.experience) {
            showError(form.querySelector('[name="experience"]'), 'Please describe your martial arts experience');
            hasErrors = true;
        }

        if (!data.why) {
            showError(form.querySelector('[name="why"]'), 'Please tell us what draws you to Aikido');
            hasErrors = true;
        }

        if (!data.classDate) {
            showError(form.querySelector('[name="classDate"]'), 'Please select a preferred date');
            hasErrors = true;
        }

        if (!data.classTime) {
            showError(form.querySelector('[name="classTime"]'), 'Please select a class time');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Show loading state with Claude AI processing indicator
        const submitButton = form.querySelector('.form-submit-btn');
        const originalText = submitButton.textContent;
        submitButton.textContent = claudeAPI ? 'Processing with AI...' : 'Sending...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';

        // Enhanced processing with Claude AI
        let aiAnalysis = null;
        let welcomeMessage = null;

        try {
            if (claudeAPI) {
                showNotification('Claude AI is analyzing your request...', 'info');
                
                // Process form with Claude AI in parallel
                const [analysisResult, welcomeResult] = await Promise.all([
                    claudeAPI.processFormSubmission(data).catch(err => {
                        console.error('AI analysis failed:', err);
                        return claudeAPI.createFallbackResponse(data);
                    }),
                    claudeAPI.generateWelcomeMessage(data).catch(err => {
                        console.error('Welcome message generation failed:', err);
                        return claudeAPI.createGenericWelcomeMessage(data);
                    })
                ]);

                aiAnalysis = analysisResult;
                welcomeMessage = welcomeResult;
                
                console.log('Claude AI Analysis:', aiAnalysis);
                console.log('Claude AI Welcome:', welcomeMessage);
            }

            // Update button text for submission
            submitButton.textContent = 'Submitting...';

            // For Squarespace compatibility, prepare enhanced data
            const enhancedData = {
                ...data,
                ai_analysis: aiAnalysis,
                ai_welcome: welcomeMessage,
                processed_with_ai: !!claudeAPI,
                submission_timestamp: new Date().toISOString()
            };

            // Try native form submission first (for Squarespace forms)
            if (window.location.hostname.includes('squarespace')) {
                // For Squarespace, we'll need to adapt the form or use webhooks
                // Store AI analysis in sessionStorage for potential retrieval
                if (aiAnalysis) {
                    sessionStorage.setItem('aikido_ai_analysis', JSON.stringify({
                        student: `${data.fname} ${data.lname}`,
                        analysis: aiAnalysis,
                        timestamp: new Date().toISOString()
                    }));
                }
                
                form.action = '/contact';
                form.submit();
                return;
            }

            // For custom deployment, use enhanced fetch API
            const response = await fetch('/submit-intro-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enhancedData)
            });

            const result = await response.json();

            if (result.success) {
                // Show enhanced success message with AI insights
                const successMessage = welcomeMessage && welcomeMessage.success 
                    ? welcomeMessage.message 
                    : result.message;
                
                showEnhancedSuccess(successMessage, aiAnalysis);
                
                // Track enhanced conversion with AI insights
                trackEnhancedConversion(data, aiAnalysis);
                
            } else {
                throw new Error(result.message || 'Form submission failed');
            }

        } catch (error) {
            console.error('Enhanced form submission error:', error);
            showFormError(`Sorry, there was an error submitting your request. ${claudeAPI ? 'Our AI analysis was completed, but ' : ''}Please try again or call us directly at (212) 555-0123.`);
            
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    });

    // Add smooth scrolling for form anchor link
    const signupLinks = document.querySelectorAll('a[href="#signup-form"]');
    signupLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.getElementById('signup-form');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Supporting functions for Claude API integration

    /**
     * Secure API key storage for development/testing
     */
    async function getStoredAPIKey() {
        try {
            // In production, this should use secure backend storage
            return sessionStorage.getItem('claude_api_key') || localStorage.getItem('claude_api_key_dev');
        } catch (error) {
            console.error('Error retrieving API key:', error);
            return null;
        }
    }

    async function storeAPIKey(apiKey) {
        try {
            // Only store in session for security - never in localStorage for production
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                sessionStorage.setItem('claude_api_key', apiKey);
                // For development convenience only
                localStorage.setItem('claude_api_key_dev', apiKey);
            }
        } catch (error) {
            console.error('Error storing API key:', error);
        }
    }

    /**
     * Enhanced notification system
     */
    function showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.claude-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `claude-notification claude-notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-size: 14px;
            max-width: 350px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        return notification;
    }

    function getNotificationColor(type) {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        return colors[type] || colors.info;
    }

    /**
     * Enhanced success display with AI insights
     */
    function showEnhancedSuccess(message, aiAnalysis) {
        const successDiv = document.createElement('div');
        successDiv.className = 'enhanced-success-message';
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin: 1rem 0;
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
            text-align: center;
            font-weight: 500;
        `;

        let content = `
            <div style="font-size: 1.2rem; margin-bottom: 1rem;">
                ✓ ${message}
            </div>
        `;

        // Add AI insights if available
        if (aiAnalysis && aiAnalysis.success && aiAnalysis.analysis) {
            const recommendations = aiAnalysis.analysis.recommendations;
            if (recommendations && recommendations.length > 0) {
                content += `
                    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.3);">
                        <div style="font-size: 0.9rem; opacity: 0.9;">
                            🤖 Our AI has prepared some insights for your instructor to enhance your first class experience.
                        </div>
                    </div>
                `;
            }
        }

        content += `
            <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.9;">
                We'll contact you within 24 hours with class details and dojo location information.
            </div>
        `;

        successDiv.innerHTML = content;
        form.parentNode.insertBefore(successDiv, form);
        form.style.display = 'none';

        // Scroll to success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Enhanced conversion tracking with AI insights
     */
    function trackEnhancedConversion(formData, aiAnalysis) {
        // Track conversion with Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                'event_category': 'engagement',
                'event_label': 'intro_class_signup_ai_enhanced',
                'value': 1,
                'custom_parameter_1': 'aikido_school',
                'custom_parameter_2': 'claude_ai_integration',
                'ai_processed': !!aiAnalysis,
                'experience_level': aiAnalysis?.analysis?.student_profile?.experience_level || 'unknown'
            });

            // Enhanced ecommerce event for lead generation
            gtag('event', 'generate_lead', {
                'currency': 'USD',
                'value': 150,
                'items': [{
                    'item_id': 'intro_class_ai',
                    'item_name': 'AI-Enhanced Aikido Intro Class Registration',
                    'item_category': 'martial_arts',
                    'item_category2': 'aikido_ai',
                    'quantity': 1,
                    'price': 150
                }]
            });
        }

        // Track with Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'AI-Enhanced Aikido Intro Class',
                content_category: 'martial_arts',
                value: 150,
                currency: 'USD'
            });

            fbq('trackCustom', 'IntroClassSignupAI', {
                school_type: 'aikido',
                location: 'east_village_nyc',
                experience_level: aiAnalysis?.analysis?.student_profile?.experience_level || formData.experience,
                ai_processed: !!aiAnalysis,
                ai_recommendations_count: aiAnalysis?.analysis?.recommendations?.length || 0
            });
        }

        // Track AI usage statistics
        if (claudeAPI) {
            console.log('Claude API Usage Stats:', claudeAPI.getUsageStats());
        }
    }

    /**
     * Toggle optional fields functionality  
     */
    const toggleOptionalButton = document.getElementById('toggle-optional');
    const optionalFields = document.getElementById('optional-fields');
    
    if (toggleOptionalButton && optionalFields) {
        toggleOptionalButton.addEventListener('click', function() {
            const isHidden = optionalFields.style.display === 'none';
            optionalFields.style.display = isHidden ? 'block' : 'none';
            toggleOptionalButton.textContent = isHidden 
                ? '➖ Optional: How did you find us?' 
                : '➕ Optional: How did you find us?';
        });
    }
});

// Production deployment notes for Claude API integration:
/*
SECURITY CONSIDERATIONS:
1. API keys should NEVER be stored in client-side code in production
2. Implement server-side proxy for Claude API calls
3. Use environment variables for API key storage
4. Implement rate limiting and usage monitoring
5. Add request validation and sanitization

DEPLOYMENT STEPS:
1. Set up secure backend endpoint for Claude API integration
2. Configure environment variables for API key
3. Implement webhook endpoint for Squarespace form processing
4. Add monitoring and logging for AI processing
5. Test thoroughly with various form inputs

SQUARESPACE INTEGRATION:
1. Use Squarespace Developer Platform for custom form handling
2. Set up webhook endpoint to receive form submissions
3. Process submissions through Claude API on backend
4. Send enhanced data back to Squarespace or email system
5. Configure form redirect to custom thank you page

RECOMMENDED BACKEND ARCHITECTURE:
- Node.js/Express server with Claude API integration
- Secure API key management using environment variables
- Rate limiting and error handling
- Email service integration (SendGrid, Mailgun, etc.)
- Analytics and monitoring (DataDog, New Relic, etc.)
*/