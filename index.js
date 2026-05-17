const express = require('express');
const cors = require('cors');
const { Xendit, Invoice } = require('xendit-node');

const app = express();
app.use(cors());
app.use(express.json());

const xenditClient = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY });
const { Invoice: InvoiceClient } = xenditClient;

app.post('/api/orders', async (req, res) => {
  try {
    const { orderNumber, amount, customerName, customerEmail } = req.body;
    const invoice = await InvoiceClient.createInvoice({
      externalId: orderNumber,
      amount: amount,
      payerEmail: customerEmail,
      description: `Order ${orderNumber} - Toga Safety Online Shop`,
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