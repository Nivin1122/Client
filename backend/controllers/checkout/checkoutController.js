const Checkout = require("../../models/checkout/checkoutModal");
const Cart = require("../../models/cart/cartModal");
const Address = require("../../models/address/addressModal");
const Size = require("../../models/product/sizesVariantModel");
const SizeVariant = require("../../models/product/sizesVariantModel");
const asyncHandler = require("express-async-handler");
const { mongoose } = require("mongoose");
const Coupon = require("../../models/coupon/couponModal");

const orderPopulateConfig = [
  {
    path: "user",
    select: "name email",
  },
  {
    path: "items.product",
    select: "name price",
  },
  {
    path: "items.variant",
    select: "color mainImage",
  },
  {
    path: "items.sizeVariant",
    select: "size price stockCount",
  },
  {
    path: "shipping.address",
    select: "fullName address city state pincode mobileNumber addressType",
  },
];

const createCheckout = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      cartId,
      items: quickBuyItems,
      addressId,
      shippingMethod,
      paymentMethod,
      transactionId,
      paymentStatus,
      finalTotal,
      couponCode,
      discountAmount,
      directPurchase,
    } = req.body;

    if (
      (!cartId && !directPurchase) ||
      !addressId ||
      !shippingMethod ||
      !paymentMethod ||
      !transactionId ||
      !paymentStatus ||
      !finalTotal
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    let items = [];

    if (directPurchase) {
      if (
        !quickBuyItems ||
        !Array.isArray(quickBuyItems) ||
        quickBuyItems.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Items are required for direct purchase" });
      }

      for (const item of quickBuyItems) {
        const sizeVariant = await SizeVariant.findById(item.sizeVariantId);
        if (!sizeVariant) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Size variant not found for item`,
          });
        }

        if (sizeVariant.stockCount < item.quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Available: ${sizeVariant.stockCount}`,
          });
        }

        // Deduct stock
        sizeVariant.stockCount -= item.quantity;
        sizeVariant.inStock = sizeVariant.stockCount > 0;
        await sizeVariant.save({ session });

        items.push({
          product: item.productId,
          variant: item.variantId,
          sizeVariant: item.sizeVariantId,
          quantity: item.quantity,
          price: item.price,
          finalPrice: item.price, // Adjust if using discounts
          status: "pending",
        });
      }
    } else {
      // Handle normal cart-based checkout
      const cart = await Cart.findById(cartId)
        .populate("items.product")
        .populate("items.variant")
        .populate("items.sizeVariant");

      if (!cart) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Cart not found" });
      }

      for (const item of cart.items) {
        const sizeVariant = await SizeVariant.findById(item.sizeVariant._id);
        if (!sizeVariant) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Size variant not found for ${item.product.name}`,
          });
        }

        if (sizeVariant.stockCount < item.quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Not enough stock for ${item.product.name}`,
          });
        }

        sizeVariant.stockCount -= item.quantity;
        sizeVariant.inStock = sizeVariant.stockCount > 0;
        await sizeVariant.save({ session });

        items.push({
          product: item.product._id,
          variant: item.variant._id,
          sizeVariant: item.sizeVariant._id,
          quantity: item.quantity,
          price: item.sizeVariant.price,
          finalPrice: item.sizeVariant.discountPrice || item.sizeVariant.price,
          status: "pending",
        });
      }

      // Clear cart
      cart.items = [];
      await cart.save({ session });
    }

    const address = await Address.findById(addressId);
    if (!address) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Address not found" });
    }

    const deliveryCharge = finalTotal < 1000 ? 40 : 0;

    const newCheckout = new Checkout({
      user: req.user.id,
      cart: cartId || null,
      items,
      shipping: {
        address: addressId,
        shippingMethod,
        deliveryCharge,
      },
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        transactionId,
        amount: finalTotal,
        paymentDate: new Date(),
      },
      orderStatus: "pending",
      totalAmount: finalTotal,
      couponCode,
      discountAmount,
    });

    await newCheckout.save({ session });

    if (couponCode) {
      const coupon = await Coupon.findOne({ couponCode });
      if (coupon && !coupon.usedBy.includes(req.user.id)) {
        coupon.usedBy.push(req.user.id);
        await coupon.save({ session });
      }
    }

    await session.commitTransaction();

    const completedOrder = await Checkout.findById(newCheckout._id)
      .populate("items.product")
      .populate("items.variant")
      .populate("items.sizeVariant")
      .populate("shipping.address")
      .populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: completedOrder,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error creating checkout",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

const returnProduct = asyncHandler(async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { reason, details } = req.body;

    // Validate input
    if (!reason || !details?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Return reason and additional details are required",
      });
    }

    // Find the order with populated items
    const order = await Checkout.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the specific item in the order
    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    const item = order.items[itemIndex];

    // Check if item is eligible for return
    if (item.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered items can be returned",
      });
    }

    if (item.returnRequested) {
      return res.status(400).json({
        success: false,
        message: "Return already requested for this item",
      });
    }

    // Update the item with return request
    order.items[itemIndex].returnRequested = true;
    order.items[itemIndex].returnReason = reason;
    order.items[itemIndex].additionalDetails = details;
    order.items[itemIndex].returnStatus = "Return Pending";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      order: {
        orderId: order._id,
        items: order.items.map((item) => ({
          itemId: item._id,
          status: item.status,
          returnRequested: item.returnRequested,
          returnStatus: item.returnStatus,
          returnReason: item.returnReason,
          additionalDetails: item.additionalDetails,
        })),
      },
    });
  } catch (error) {
    console.error("Return product error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the return request",
      error: error.message,
    });
  }
});

const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Checkout.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate(orderPopulateConfig);

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    const formattedOrders = orders.map((order) => ({
      orderId: order._id,
      orderDate: order.createdAt,
      orderStatus: order.orderStatus,
      shippingAddress: order.shipping.address,
      shippingMethod: order.shipping.shippingMethod,
      payment: {
        method: order.payment.method,
        status: order.payment.status,
        amount: order.totalAmount,
      },
      items: order.items.map((item) => ({
        itemId: item._id,
        status: item.status,
        productId: item.product?._id, // Add productId
        productName: item.product?.name || "N/A",
        price: item.price || 0,
        finalPrice: item.finalPrice || 0,
        quantity: item.quantity,
        variantId: item.variant?._id, // Add variantId
        color: item.variant?.color || "N/A",
        sizeVariantId: item.sizeVariant?._id, // Add sizeVariantId
        size: item.sizeVariant?.size || "N/A",
        image: item.variant?.mainImage || "N/A",
        returnRequested: item.returnRequested || false,
      })),
      totalAmount: order.totalAmount,
      deliveryCharge: order.shipping.deliveryCharge,
      couponCode: order.couponCode,
      discountAmount: order.discountAmount || 0,
      subTotal: order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

const cancelOrder = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    const order = await Checkout.findById(orderId).populate({
      path: "items.sizeVariant",
      select: "stockCount inStock",
    });

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const item = order.items[itemIndex];

    // Only restore stock if item wasn't already cancelled
    if (item.status !== "Cancelled") {
      const sizeVariant = await Size.findById(item.sizeVariant._id);

      if (sizeVariant) {
        sizeVariant.stockCount += item.quantity;
        if (sizeVariant.stockCount > 0) {
          sizeVariant.inStock = true;
        }
        await sizeVariant.save({ session });
      }
    }

    order.items[itemIndex].status = "Cancelled";
    order.items[itemIndex].cancellationReason = reason;

    const allCancelled = order.items.every(
      (item) => item.status === "Cancelled"
    );

    if (allCancelled) {
      order.orderStatus = "Cancelled";
      order.reason = reason;
    }

    await order.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Order item cancelled successfully",
      order,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Error cancelling item",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

module.exports = {
  createCheckout,
  getOrders,
  cancelOrder,
  returnProduct,
};
