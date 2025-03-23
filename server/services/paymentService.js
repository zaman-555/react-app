const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');

// Process payment using Stripe
exports.processPayment = async (req, res, next) => {
  try {
    logger.info('Request body:', req.body); // Log the request body

    const { amount, paymentMethod, cardDetails } = req.body;

    // Validate required fields
    if (!amount || !paymentMethod || !cardDetails) {
      return res.status(400).json({
        error: 'Missing required fields: amount, paymentMethod, or cardDetails.',
      });
    }

    // Validate card details
    if (
      !cardDetails.number ||
      !cardDetails.expMonth ||
      !cardDetails.expYear ||
      !cardDetails.cvc
    ) {
      return res.status(400).json({
        error: 'Invalid card details. Please provide number, expMonth, expYear, and cvc.',
      });
    }

    // Process payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethod,
      confirm: true,
      payment_method_data: {
        type: 'card',
        card: {
          number: cardDetails.number,
          exp_month: cardDetails.expMonth,
          exp_year: cardDetails.expYear,
          cvc: cardDetails.cvc,
        },
      },
    });

    res.status(200).json({
      message: 'Payment processed successfully.',
      paymentIntent,
    });
  } catch (err) {
    console.error('Error processing payment:', err); // Log the error
    res.status(500).json({ error: 'Payment processing failed. Please try again later.' });
  }
};