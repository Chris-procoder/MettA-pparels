require('dotenv').config();
const express = require('express');
const stripe = require('stripe')('your-secret-key'); // Use your Stripe secret key
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const sgMail = require('@sendgrid/mail');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
    })
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const app = express();
const port = 3000;

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
