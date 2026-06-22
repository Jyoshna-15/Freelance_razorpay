const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Invoice = require('../models/invoice');
const auth = require('../middleware/auth');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const order = await razorpay.orders.create({
      amount: invoice.totalAmount * 100,
      currency: 'INR',
      receipt: invoice.invoiceNumber,
    });

    invoice.razorpayOrderId = order.id;
    await invoice.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      invoiceId
    } = req.body;

    // HMAC verification
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex');

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    await Invoice.findByIdAndUpdate(invoiceId, {
      status: 'paid',
      razorpayPaymentId: razorpay_payment_id,
      paidAt: new Date(),
    });

    res.json({ success: true, message: 'Payment verified!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Webhook — HMAC verification
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(req.body)
        .digest('hex');

      if (signature !== expectedSign) {
        return res.status(400).json({ message: 'Invalid webhook' });
      }

      const event = JSON.parse(req.body);
      if (event.event === 'payment.captured') {
        const orderId = event.payload.payment.entity.order_id;
        await Invoice.findOneAndUpdate(
          { razorpayOrderId: orderId },
          { status: 'paid', paidAt: new Date() }
        );
      }

      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;