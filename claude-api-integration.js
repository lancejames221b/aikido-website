/**
 * Claude Sonnet 4 API Integration for Genshinkan Aikido Contact Form
 * Author: Lance James @ Unit 221B
 * 
 * This module handles secure Claude Sonnet 4 API integration for form processing,
 * including intelligent response generation, form validation, and user assistance.
 */

class ClaudeAPIIntegration {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.baseURL = options.baseURL || 'https://api.anthropic.com/v1/messages';
        this.model = options.model || 'claude-sonnet-4-20250514';
        this.maxTokens = options.maxTokens || 1024;
        this.temperature = options.temperature || 0.7;
        
        // Rate limiting and error handling
        this.requestQueue = [];
        this.isProcessing = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second base delay
        
        // Initialize client with proper headers for 2025
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'code-execution-2025-05-22'
        };
        
        this.debugMode = options.debug || false;
    }

    /**
     * Validates API key format and availability
     * @returns {Promise<boolean>}
     */
    async validateAPIKey() {
        if (!this.apiKey || typeof this.apiKey !== 'string') {
            this.log('error', 'Invalid API key format');
            return false;
        }
        
        if (!this.apiKey.startsWith('sk-ant-')) {
            this.log('error', 'API key should start with sk-ant-');
            return false;
        }
        
        try {
            // Test API connection with minimal request
            const testResponse = await this.makeAPIRequest('Hello', { maxTokens: 10 });
            return testResponse.success;
        } catch (error) {
            this.log('error', 'API key validation failed:', error);
            return false;
        }
    }

    /**
     * Processes form data through Claude API for intelligent assistance
     * @param {Object} formData - Form submission data
     * @returns {Promise<Object>} Response with suggestions and validation
     */
    async processFormSubmission(formData) {
        const prompt = this.buildFormAnalysisPrompt(formData);
        
        try {
            const response = await this.makeAPIRequest(prompt, {
                maxTokens: 2048,
                temperature: 0.3 // Lower temperature for more consistent responses
            });
            
            if (response.success) {
                return this.parseFormAnalysisResponse(response.data, formData);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.log('error', 'Form processing failed:', error);
            return this.createFallbackResponse(formData);
        }
    }

    /**
     * Generates personalized welcome message based on user's background
     * @param {Object} formData - User's form submission
     * @returns {Promise<Object>} Personalized message response
     */
    async generateWelcomeMessage(formData) {
        const prompt = this.buildWelcomePrompt(formData);
        
        try {
            const response = await this.makeAPIRequest(prompt, {
                maxTokens: 1024,
                temperature: 0.6
            });
            
            if (response.success) {
                return {
                    success: true,
                    message: this.extractMessageContent(response.data),
                    personalizations: this.extractPersonalizations(response.data, formData)
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.log('error', 'Welcome message generation failed:', error);
            return this.createGenericWelcomeMessage(formData);
        }
    }

    /**
     * Makes authenticated API request to Claude Sonnet 4
     * @param {string} prompt - User message/prompt
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async makeAPIRequest(prompt, options = {}) {
        const requestData = {
            model: this.model,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        };

        this.log('debug', 'Making API request:', { prompt: prompt.substring(0, 100) + '...' });

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const response = await fetch(this.baseURL, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(`HTTP ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
                }

                const data = await response.json();
                
                this.log('debug', 'API response received:', { 
                    usage: data.usage,
                    content_length: data.content?.[0]?.text?.length || 0
                });

                return {
                    success: true,
                    data: data,
                    usage: data.usage
                };

            } catch (error) {
                this.log('error', `API request attempt ${attempt} failed:`, error);
                
                if (attempt === this.retryAttempts) {
                    return {
                        success: false,
                        error: error.message,
                        attempts: attempt
                    };
                }
                
                // Exponential backoff
                await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
            }
        }
    }

    /**
     * Builds prompt for form analysis and validation
     * @param {Object} formData - Form submission data
     * @returns {string} Formatted prompt
     */
    buildFormAnalysisPrompt(formData) {
        return `You are an AI assistant for Genshinkan Aikido, a traditional martial arts dojo in Manhattan. 
Analyze this new student inquiry and provide helpful insights:

Student Information:
- Name: ${formData.fname} ${formData.lname}
- Email: ${formData.email}
- Phone: ${formData.phone}
- Martial Arts Experience: ${formData.experience}
- Interest in Aikido: ${formData.why}
- Preferred Class: ${formData.classTime} on ${formData.classDate}
- How they found us: ${formData.howHeard || 'Not specified'}
- Additional info: ${formData.additionalInfo || 'None'}

Please provide:
1. A brief assessment of their background and interests
2. Specific recommendations for their first class experience
3. Any potential concerns or accommodations needed
4. Suggested follow-up topics for the instructor

Respond in a professional, concise format that helps our instructors prepare for this new student.
Focus on practical insights that enhance their first experience at our dojo.`;
    }

    /**
     * Builds personalized welcome message prompt
     * @param {Object} formData - Form submission data
     * @returns {string} Formatted prompt
     */
    buildWelcomePrompt(formData) {
        return `Create a warm, personalized welcome message for a new Aikido student:

Student: ${formData.fname} ${formData.lname}
Experience: ${formData.experience}
Interest: ${formData.why}
Preferred class: ${formData.classTime}

Write a brief, authentic welcome message (2-3 sentences) that:
- Acknowledges their specific interests and background
- Welcomes them to the Genshinkan Aikido community
- Mentions something relevant to their experience level
- Maintains the respectful, traditional tone of a martial arts dojo

Keep it professional but warm, avoiding overly promotional language.`;
    }

    /**
     * Parses Claude's response for form analysis
     * @param {Object} apiResponse - Raw API response
     * @param {Object} formData - Original form data
     * @returns {Object} Parsed analysis
     */
    parseFormAnalysisResponse(apiResponse, formData) {
        const content = apiResponse.content?.[0]?.text || '';
        
        return {
            success: true,
            analysis: {
                raw_response: content,
                student_profile: this.extractStudentProfile(content),
                recommendations: this.extractRecommendations(content),
                concerns: this.extractConcerns(content),
                follow_up: this.extractFollowUp(content)
            },
            usage: apiResponse.usage,
            processed_at: new Date().toISOString()
        };
    }

    /**
     * Extracts student profile insights from Claude response
     * @param {string} content - Claude's response text
     * @returns {Object} Profile insights
     */
    extractStudentProfile(content) {
        // Simple extraction - in production, you might use more sophisticated parsing
        const profileSection = this.extractSection(content, '1.', '2.');
        return {
            summary: profileSection,
            experience_level: this.determineExperienceLevel(content),
            motivation: this.extractMotivation(content)
        };
    }

    /**
     * Extracts recommendations from Claude response
     * @param {string} content - Claude's response text
     * @returns {Array} Recommendations list
     */
    extractRecommendations(content) {
        const recommendationsSection = this.extractSection(content, '2.', '3.');
        return recommendationsSection.split('\n').filter(line => line.trim().length > 0);
    }

    /**
     * Extracts potential concerns from Claude response
     * @param {string} content - Claude's response text
     * @returns {Array} Concerns list
     */
    extractConcerns(content) {
        const concernsSection = this.extractSection(content, '3.', '4.');
        return concernsSection.split('\n').filter(line => line.trim().length > 0);
    }

    /**
     * Extracts follow-up suggestions from Claude response
     * @param {string} content - Claude's response text
     * @returns {Array} Follow-up suggestions
     */
    extractFollowUp(content) {
        const followUpSection = this.extractSection(content, '4.', '');
        return followUpSection.split('\n').filter(line => line.trim().length > 0);
    }

    /**
     * Utility function to extract text between numbered sections
     * @param {string} content - Full content
     * @param {string} startMarker - Start section marker
     * @param {string} endMarker - End section marker
     * @returns {string} Extracted section
     */
    extractSection(content, startMarker, endMarker) {
        const startIndex = content.indexOf(startMarker);
        if (startIndex === -1) return '';
        
        const contentAfterStart = content.substring(startIndex + startMarker.length);
        
        if (endMarker === '') return contentAfterStart.trim();
        
        const endIndex = contentAfterStart.indexOf(endMarker);
        if (endIndex === -1) return contentAfterStart.trim();
        
        return contentAfterStart.substring(0, endIndex).trim();
    }

    /**
     * Determines experience level from content analysis
     * @param {string} content - Analysis content
     * @returns {string} Experience level
     */
    determineExperienceLevel(content) {
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.includes('beginner') || lowerContent.includes('no experience')) {
            return 'beginner';
        } else if (lowerContent.includes('some experience') || lowerContent.includes('intermediate')) {
            return 'intermediate';
        } else if (lowerContent.includes('experienced') || lowerContent.includes('advanced')) {
            return 'advanced';
        }
        
        return 'unknown';
    }

    /**
     * Extracts motivation insights from content
     * @param {string} content - Analysis content
     * @returns {string} Motivation summary
     */
    extractMotivation(content) {
        // Simple keyword extraction - could be enhanced with NLP
        const motivationKeywords = [
            'stress', 'fitness', 'self-defense', 'philosophy', 
            'discipline', 'meditation', 'community', 'confidence'
        ];
        
        const foundKeywords = motivationKeywords.filter(keyword => 
            content.toLowerCase().includes(keyword)
        );
        
        return foundKeywords.join(', ') || 'general interest';
    }

    /**
     * Extracts message content from Claude response
     * @param {Object} apiResponse - API response object
     * @returns {string} Message content
     */
    extractMessageContent(apiResponse) {
        return apiResponse.content?.[0]?.text || '';
    }

    /**
     * Extracts personalization elements from welcome message
     * @param {Object} apiResponse - API response object
     * @param {Object} formData - Original form data
     * @returns {Object} Personalization elements
     */
    extractPersonalizations(apiResponse, formData) {
        const content = apiResponse.content?.[0]?.text || '';
        
        return {
            mentions_experience: content.toLowerCase().includes(formData.experience.toLowerCase()),
            mentions_interest: formData.why && content.toLowerCase().includes(formData.why.toLowerCase()),
            tone: this.analyzeTone(content),
            length: content.length
        };
    }

    /**
     * Analyzes tone of generated content
     * @param {string} content - Text content
     * @returns {string} Tone assessment
     */
    analyzeTone(content) {
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.includes('welcome') && lowerContent.includes('honored')) {
            return 'formal_welcoming';
        } else if (lowerContent.includes('excited') || lowerContent.includes('great')) {
            return 'enthusiastic';
        } else if (lowerContent.includes('respectful') || lowerContent.includes('traditional')) {
            return 'traditional';
        }
        
        return 'professional';
    }

    /**
     * Creates fallback response when API fails
     * @param {Object} formData - Original form data
     * @returns {Object} Fallback response
     */
    createFallbackResponse(formData) {
        return {
            success: false,
            fallback: true,
            analysis: {
                student_profile: {
                    summary: `New student: ${formData.fname} ${formData.lname}`,
                    experience_level: this.mapExperienceLevel(formData.experience),
                    motivation: formData.why || 'General interest in Aikido'
                },
                recommendations: [
                    'Provide standard beginner introduction',
                    'Ensure proper safety briefing',
                    'Focus on basic etiquette and movements'
                ],
                concerns: [],
                follow_up: [
                    'Check in after first class',
                    'Provide information about regular classes'
                ]
            },
            processed_at: new Date().toISOString(),
            note: 'Generated using fallback logic due to API unavailability'
        };
    }

    /**
     * Creates generic welcome message when AI generation fails
     * @param {Object} formData - Form data
     * @returns {Object} Generic welcome message
     */
    createGenericWelcomeMessage(formData) {
        return {
            success: false,
            fallback: true,
            message: `Welcome to Genshinkan Aikido, ${formData.fname}! We look forward to having you join us for your first class. Our instructors will ensure you have a positive introduction to the art of Aikido.`,
            personalizations: {
                mentions_experience: false,
                mentions_interest: false,
                tone: 'generic',
                length: 150
            }
        };
    }

    /**
     * Maps experience level to standard categories
     * @param {string} experience - Raw experience text
     * @returns {string} Mapped experience level
     */
    mapExperienceLevel(experience) {
        const lowerExp = experience.toLowerCase();
        
        if (lowerExp.includes('no') || lowerExp.includes('beginner') || lowerExp.includes('never')) {
            return 'beginner';
        } else if (lowerExp.includes('some') || lowerExp.includes('little')) {
            return 'intermediate';
        } else if (lowerExp.includes('experienced') || lowerExp.includes('years')) {
            return 'advanced';
        }
        
        return 'beginner'; // Default to beginner for safety
    }

    /**
     * Utility function for adding delays
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Logging utility with different levels
     * @param {string} level - Log level (debug, info, error)
     * @param {string} message - Log message
     * @param {*} data - Additional data to log
     */
    log(level, message, data = null) {
        if (!this.debugMode && level === 'debug') return;
        
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level) {
            case 'error':
                console.error(logMessage, data);
                break;
            case 'debug':
                console.debug(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }

    /**
     * Get API usage statistics
     * @returns {Object} Usage statistics
     */
    getUsageStats() {
        return {
            total_requests: this.totalRequests || 0,
            successful_requests: this.successfulRequests || 0,
            failed_requests: this.failedRequests || 0,
            total_tokens_used: this.totalTokensUsed || 0,
            last_request: this.lastRequestTime || null
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClaudeAPIIntegration;
} else if (typeof window !== 'undefined') {
    window.ClaudeAPIIntegration = ClaudeAPIIntegration;
}