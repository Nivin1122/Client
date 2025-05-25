const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../../models/payment/paymentModel');
const Checkout = require('../../models/checkout/checkoutModal');
const Size = require('../../models/product/sizesVariantModel');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
  try {
    const { amount, currency, checkoutId } = req.body;
    
    if (!checkoutId) {
      return res.status(400).json({ message: "Checkout ID is required" });
    }

    // Verify checkout exists and get details
    const checkout = await Checkout.findById(checkoutId)
      .populate('items.sizeVariant', 'discountPrice price')
      .populate('shipping.address');

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    // Calculate total amount using discounted prices
    const totalAmount = checkout.items.reduce((total, item) => {
      const price = item.sizeVariant.discountPrice || item.sizeVariant.price;
      return total + (price * item.quantity);
    }, 0);

    // Add delivery charge if total is less than 1000
    const deliveryCharge = totalAmount < 1000 ? 40 : 0;
    const finalAmount = (totalAmount + deliveryCharge) * 100; // Convert to paise

    const options = {
      amount: Math.round(finalAmount),
      currency: currency || 'INR',
      receipt: 'order_' + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    // Save order details to database
    const payment = await Payment.create({
      userId: req.user.id,
      orderId: order.id,
      amount: finalAmount / 100, // Store in rupees
      currency: currency || 'INR',
      status: 'created',
      checkoutId: checkoutId
    });

    // Update checkout payment status
    checkout.payment.status = 'created';
    await checkout.save();

    res.status(200).json({
      id: order.id,
      amount: finalAmount,
      currency: currency || 'INR',
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      message: 'Failed to create order', 
      error: error.message 
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      checkoutId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !checkoutId) {
      return res.status(400).json({ message: 'Missing required payment parameters' });
    }

    // Verify the payment signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'completed'
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update checkout record
    const checkout = await Checkout.findByIdAndUpdate(
      checkoutId,
      { 
        'payment.status': 'completed',
        'payment.transactionId': razorpay_payment_id,
        'orderStatus': 'Processing',
        'items.$[].status': 'Processing'
      },
      { new: true }
    );

    if (!checkout) {
      return res.status(404).json({ message: 'Checkout record not found' });
    }

    res.json({
      status: 'success',
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

const handlePaymentCancel = async (req, res) => {
  try {
    const { orderId, checkoutId, error } = req.body;
    
    if (!orderId || !checkoutId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      {
        status: 'failed',
        error: error || 'Payment cancelled by user'
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update checkout status
    const checkout = await Checkout.findByIdAndUpdate(
      checkoutId,
      { 
        'payment.status': 'failed',
        'orderStatus': 'Cancelled',
        'items.$[].status': 'Cancelled',
        'reason': error?.description || 'Payment cancelled by user'
      },
      { new: true }
    );

    if (!checkout) {
      return res.status(404).json({ message: 'Checkout record not found' });
    }

    // Restore stock quantities
    for (const item of checkout.items) {
      await Size.findByIdAndUpdate(
        item.sizeVariant,
        {
          $inc: { stockCount: item.quantity },
          $set: { inStock: true }
        }
      );
    }

    res.json({
      status: 'success',
      message: 'Payment cancelled successfully',
      payment: {
        id: payment._id,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Payment cancellation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to handle payment cancellation',
      error: error.message
    });
  }
};

// Make sure all functions are exported
module.exports = {
  createOrder,
  verifyPayment,
  handlePaymentCancel
};