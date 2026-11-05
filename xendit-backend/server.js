require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_BACKEND_TOKEN = process.env.XENDIT_BACKEND_TOKEN;

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

app.post('/api/create-xendit-checkout', async (req, res) => {
  if (!XENDIT_SECRET_KEY || !XENDIT_BACKEND_TOKEN) {
    return res.status(503).json({ error: 'Xendit server configuration is incomplete' });
  }
  const authorization = req.headers.authorization || '';
  const providedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!constantTimeEqual(XENDIT_BACKEND_TOKEN, providedToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { amount, description, items } = req.body;
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 1) {
    return res.status(400).json({ error: 'A valid payment amount is required' });
  }

  try {
    const response = await axios.post(
      'https://api.xendit.co/v2/invoices',
      {
        external_id: `order-${Date.now()}`,
        amount: numericAmount,
        currency: 'PHP',
        description: description || 'Park-IT App Order',
        success_redirect_url: 'myapp://payment-success',
        failure_redirect_url: 'myapp://payment-failed',
        items: items || [],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
        },
      }
    );

    res.json({ checkoutUrl: response.data.invoice_url });
  } catch (error) {
    console.error('Xendit Invoice Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment invoice' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Xendit Payment Server running on http://localhost:${PORT}`));