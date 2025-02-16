// Backend API (Node.js + Express.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// XENDIT Payment Integration
app.post('/api/payment/xendit', async (req, res) => {
    try {
        const response = await fetch('https://api.xendit.co/v2/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(process.env.XENDIT_API_KEY + ':').toString('base64')
            },
            body: JSON.stringify({
                external_id: 'invoice-' + Date.now(),
                amount: req.body.amount,
                payer_email: req.body.email,
                success_redirect_url: 'https://your-app.vercel.app/success'
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NOWPayments (Crypto Payment Integration)
app.post('/api/payment/crypto', async (req, res) => {
    try {
        const response = await fetch('https://api.nowpayments.io/v1/payment', {
            method: 'POST',
            headers: {
                'x-api-key': process.env.NOWPAYMENTS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price_amount: req.body.amount,
                price_currency: 'USD',
                pay_currency: req.body.crypto
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe Payment Integration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
app.post('/api/payment/stripe', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Subscription Plan'
                    },
                    unit_amount: req.body.amount * 100
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: 'https://your-app.vercel.app/success'
        });
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


