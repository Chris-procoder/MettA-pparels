const express = require('express');
const stripe = require('stripe')('your-secret-key'); // Use your Stripe secret key
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors()); // Allow all origins (adjust this for production)
app.use(bodyParser.json());

app.post('/create-payment-intent', async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
