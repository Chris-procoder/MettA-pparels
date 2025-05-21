require('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email validation middleware
const validateEmail = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Payment handler with improved security
app.post(
  '/create-payment-intent',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    validateEmail
  ],
  async (req, res) => {
    try {
      const { email, amount } = req.body;
      
      // Validate payment amount
      if (amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Process payment
      // ... payment processing ...

      // Send confirmation email
      await sendConfirmationEmail({
        email,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString()
      });

      res.status(200).json({ success: true, message: 'Payment processed successfully' });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
