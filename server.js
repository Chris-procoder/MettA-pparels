require('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');
const cors = require('cors');
app.use(cors());


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(express.json());

// Add to existing payment handler
app.post('/create-payment-intent', async (req, res) => {
  // ... payment processing ...

  // After successful paymentrequire('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  await sendConfirmationEmail({
    email: req.body.email,
    date: req.body.date,
    time: req.body.time
  });
});