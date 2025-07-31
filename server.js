const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('.'));

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'aikido@example.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/submit-intro-class', async (req, res) => {
    try {
        const { name, email, phone, experience, message } = req.body;

        // Basic validation
        if (!name || !email || !experience) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and experience level are required fields.'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        // Prepare email content
        const mailOptions = {
            from: process.env.EMAIL_USER || 'aikido@example.com',
            to: 'lancejames@unit221b.com',
            subject: 'New Intro Class Registration - Genshinkan Aikido',
            html: `
                <h2>New Intro Class Registration</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Experience:</strong> ${experience}</p>
                <p><strong>Message:</strong> ${message || 'None'}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            `
        };

        // Send confirmation email to user
        const userConfirmation = {
            from: process.env.EMAIL_USER || 'aikido@example.com',
            to: email,
            subject: 'Welcome to Genshinkan Aikido - Intro Class Confirmation',
            html: `
                <h2>Thank you for your interest in Genshinkan Aikido!</h2>
                <p>Dear ${name},</p>
                <p>We've received your request for an intro class and will contact you within 24 hours to schedule your session.</p>
                
                <h3>What to expect:</h3>
                <ul>
                    <li>Personal consultation about your goals</li>
                    <li>Introduction to Aikido philosophy and techniques</li>
                    <li>Opportunity to observe or participate in a class</li>
                    <li>No pressure - just authentic Aikido experience</li>
                </ul>
                
                <p><strong>Location:</strong> 62 E 4th St, Manhattan, NY</p>
                <p><strong>Questions?</strong> Call us at (212) 555-0123</p>
                
                <p>Looking forward to meeting you!</p>
                <p>Gary Wagener Sensei & the Genshinkan Aikido Team</p>
            `
        };

        // Send both emails
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(userConfirmation);

        // Success response
        res.json({
            success: true,
            message: 'Thank you! We\'ve received your request and will contact you within 24 hours.'
        });

    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, there was an error processing your request. Please try again or call us directly at (212) 555-0123.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Genshinkan Aikido server running on port ${PORT}`);
});