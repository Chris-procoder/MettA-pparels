// server.js (Node.js with Express)
const express = require('express');
const app = express();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_...'); // Your real Secret Key
app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
