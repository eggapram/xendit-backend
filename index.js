const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

app.post('/api/orders', async (req, res) => {
  try {
    const { orderNumber, amount, customerName, customerEmail } = req.body;

    const response = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.XENDIT_SECRET_KEY + ':').toString('base64')
      },
      body: JSON.stringify({
        external_id: orderNumber,
        amount: amount,
        payer_email: customerEmail,
        description: `Order ${orderNumber}`,
        customer: { given_names: customerName }
      })
    });

    const invoice = await response.json();

    if (!response.ok) {
      return res.status(500).json({ success: false, message: invoice.message });
    }

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
