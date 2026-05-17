const express = require('express');
const cors = require('cors');
const { Xendit } = require('xendit-node');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });

app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

app.post('/api/orders', async (req, res) => {
  try {
    const { orderNumber, amount, customerName, customerEmail } = req.body;
    const invoice = await xenditClient.Invoice.createInvoice({
      externalId: orderNumber,
      amount: amount,
      payerEmail: customerEmail,
      description: `Order ${orderNumber}`,
    });
    res.json({ success: true, invoiceUrl: invoice.invoice_url, invoiceId: invoice.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/webhook/xendit', (req, res) => {
  console.log('Webhook received:', req.body);
  res.json({ received: true });
});

app.listen(process.env.PORT || 3000, () => console.log('Backend running'));
