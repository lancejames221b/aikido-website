// Squarespace-compatible form handling for Genshinkan Aikido
// This script adds client-side validation and AJAX submission to work with Squarespace

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('intro-class-form');
    
    if (!form) return;

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

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Clear previous errors
        const errorMessages = form.querySelectorAll('.error-message, .form-error');
        errorMessages.forEach(error => error.remove());

        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim(),
            phone: formData.get('phone')?.trim(),
            experience: formData.get('experience'),
            message: formData.get('message')?.trim()
        };

        // Validation
        let hasErrors = false;

        if (!data.name) {
            showError(form.querySelector('[name="name"]'), 'Name is required');
            hasErrors = true;
        }

        if (!data.email) {
            showError(form.querySelector('[name="email"]'), 'Email is required');
            hasErrors = true;
        } else if (!validateEmail(data.email)) {
            showError(form.querySelector('[name="email"]'), 'Please enter a valid email address');
            hasErrors = true;
        }

        if (!data.experience) {
            showError(form.querySelector('[name="experience"]'), 'Please select your experience level');
            hasErrors = true;
        }

        if (data.phone && !validatePhone(data.phone)) {
            showError(form.querySelector('[name="phone"]'), 'Please enter a valid phone number');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Show loading state
        const submitButton = form.querySelector('.form-submit-btn');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';

        // For Squarespace compatibility, we'll use a simple form submission
        // with fallback to external service if needed
        
        // Try native form submission first (for Squarespace forms)
        if (window.location.hostname.includes('squarespace')) {
            // Squarespace form handling
            form.action = '/contact'; // Default Squarespace contact form
            form.submit();
            return;
        }

        // For custom deployment, use fetch API
        fetch('/submit-intro-class', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showSuccess(result.message);
                
                // Track conversion with Google Analytics 4
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        'event_category': 'engagement',
                        'event_label': 'intro_class_signup',
                        'value': 1,
                        'custom_parameter_1': 'aikido_school',
                        'custom_parameter_2': 'form_interaction'
                    });
                    
                    // Enhanced ecommerce event for lead generation
                    gtag('event', 'generate_lead', {
                        'currency': 'USD',
                        'value': 150, // Estimated value of intro class lead
                        'items': [{
                            'item_id': 'intro_class',
                            'item_name': 'Aikido Intro Class Registration',
                            'item_category': 'martial_arts',
                            'item_category2': 'aikido',
                            'quantity': 1,
                            'price': 150
                        }]
                    });
                }
                
                // Track with Facebook Pixel
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead', {
                        content_name: 'Aikido Intro Class',
                        content_category: 'martial_arts',
                        value: 150,
                        currency: 'USD'
                    });
                    
                    fbq('trackCustom', 'IntroClassSignup', {
                        school_type: 'aikido',
                        location: 'east_village_nyc',
                        experience_level: data.experience
                    });
                }
            } else {
                showFormError(result.message);
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showFormError('Sorry, there was an error submitting your request. Please try again or call us directly at (212) 555-0123.');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        });
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
});

// Alternative: Squarespace form block configuration
// If using Squarespace's built-in form blocks, configure as follows:
/*
Form Settings in Squarespace:
1. Add Form Block
2. Configure fields:
   - Name (Text, Required)
   - Email (Email, Required) 
   - Phone (Phone, Optional)
   - Experience (Dropdown, Required)
     Options: "No experience", "Some experience", "Experienced"
   - Message (Textarea, Optional)
3. Form Actions:
   - Send email to: lancejames@unit221b.com
   - Auto-reply: Enable with welcome message
   - Redirect: Optional thank you page
*/