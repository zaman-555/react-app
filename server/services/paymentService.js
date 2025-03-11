const { createCharge } = require('../services/paymentService');

const processPayment = async (amount, currency, source, description) => {
    try {
        const charge = await createCharge(amount, currency, source, description);
        console.log('Payment processed successfully:', charge);
        return charge;
    } catch (error) {
        console.error('Failed to process payment:', error);
        throw error;
    }
};

module.exports = {
    processPayment,
};