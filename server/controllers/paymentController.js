const { processPayment } = require('../services/paymentService');

// Process a payment
exports.processPayment = async (req, res) => {
  const { amount, currency, source, description } = req.body;

  try {
    const paymentResult = await processPayment(amount, currency, source, description);
    res.json(paymentResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};