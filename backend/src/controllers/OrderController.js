import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { Cart } from '../models/Cart.js';
import { AppError } from '../middleware/error.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { Invoice } from '../models/Invoice.js';
import { generateInvoice } from '../services/invoiceService.js';
import { sendInvoiceEmail } from '../services/emailService.js';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.log('[RAZORPAY] Missing keys. Operating in MOCK mode.');
    return null;
  }
  return new Razorpay({ key_id, key_secret });
};

export const createOrder = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    let itemsPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new AppError(`Product not found: ${item.title}`, 404));
      }
      if (product.inventory < item.quantity) {
        return next(new AppError(`Insufficient stock for product: ${product.title}`, 400));
      }
      itemsPrice += product.basePrice * item.quantity;
    }

    let couponDiscount = 0;
    let couponApplied = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && new Date() < coupon.expiryDate && coupon.usageCount < coupon.usageLimit) {
        couponApplied = coupon._id;
        if (coupon.discountType === 'percentage') {
          couponDiscount = (itemsPrice * coupon.discountValue) / 100;
        } else {
          couponDiscount = coupon.discountValue;
        }
      }
    }

    const shippingPrice = itemsPrice > 1000 ? 0 : 99;
    const taxableAmount = Math.max(0, itemsPrice - couponDiscount);
    const taxPrice = Math.round((taxableAmount - (taxableAmount / 1.18)) * 100) / 100;
    const totalPrice = Math.max(0, Math.round((taxableAmount + shippingPrice) * 100) / 100);

    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      priceDetails: {
        itemsPrice,
        shippingPrice,
        taxPrice,
        couponDiscount,
        totalPrice
      },
      couponApplied
    });

    const userDoc = await User.findById(req.user.id);
    if (userDoc) {
      const isNewAddress = !userDoc.addresses.some(
        a => a.street === shippingAddress.street && a.postalCode === shippingAddress.postalCode
      );
      if (isNewAddress) {
        userDoc.addresses.push({ ...shippingAddress, isDefault: userDoc.addresses.length === 0 });
        await userDoc.save();
      }
    }

    const razorpay = getRazorpayInstance();
    if (razorpay) {
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(totalPrice * 100),
        currency: 'INR',
        receipt: order._id.toString()
      });
      order.razorpayOrderId = rzpOrder.id;
    } else {
      order.razorpayOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
    }

    await order.save();

    if (order.couponApplied) {
      await Coupon.findByIdAndUpdate(order.couponApplied, {
        $inc: { usageCount: 1 }
      });
    }

    res.status(201).json({
      success: true,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123456789'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    const razorpay = getRazorpayInstance();
    if (razorpay) {
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      const shasum = crypto.createHmac('sha256', key_secret);
      shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpaySignature) {
        return next(new AppError('Payment signature verification failed', 400));
      }
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = 'Paid';
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    await order.save();

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { inventory: -item.quantity }
      });
    }

    await Cart.findOneAndUpdate({ user: order.user }, { items: [] });

    // --- Generate Invoice ---
    try {
      const invoiceCount = await Invoice.countDocuments();
      const invoiceNumber = `ZF-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
      
      const userDoc = await User.findById(order.user);
      const pdfFileName = await generateInvoice(order, invoiceNumber, userDoc);

      const invoice = new Invoice({
        invoiceNumber,
        order: order._id,
        user: order.user,
        pdfUrl: pdfFileName,
        orderTotal: order.priceDetails.totalPrice,
        paymentStatus: 'Paid'
      });
      await invoice.save();

      // Send email asynchronously without blocking the response
      sendInvoiceEmail(userDoc, order, invoice).catch(err => console.error('Email failed:', err));
    } catch (invError) {
      console.error('Invoice generation error:', invError);
    }
    // --- End Invoice Generation ---

    const notification = new Notification({
      user: order.user,
      message: `Your payment of ₹${order.priceDetails.totalPrice} was successful. Order is now processing.`,
      type: 'Order',
      referenceId: order._id.toString()
    });
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and order placed!',
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const orders = await Order.find({ user: req.user.id }).populate('orderItems.product', 'images title').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'name email').populate('orderItems.product', 'images title');
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('orderItems.product', 'images title').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
      }

      // Check if invoice exists, if not generate one
      const { Invoice } = await import('../models/Invoice.js');
      const existingInvoice = await Invoice.findOne({ order: order._id });
      if (!existingInvoice) {
        try {
          const { User } = await import('../models/User.js');
          const { generateInvoice } = await import('../services/invoiceService.js');
          const userDoc = await User.findById(order.user);
          const invoiceCount = await Invoice.countDocuments();
          const invoiceNumber = `ZF-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
          const pdfFileName = await generateInvoice(order, invoiceNumber, userDoc);
          
          const invoice = new Invoice({
            invoiceNumber,
            order: order._id,
            user: order.user,
            pdfUrl: pdfFileName,
            orderTotal: order.priceDetails.totalPrice,
            paymentStatus: 'Paid'
          });
          await invoice.save();
        } catch (invError) {
          console.error('Invoice generation error on delivery:', invError);
        }
      }
    }

    await order.save();

    const notification = new Notification({
      user: order.user,
      message: `Your order status has been updated to "${status}".`,
      type: 'Order',
      referenceId: order._id.toString()
    });
    await notification.save();

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

export const downloadReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id.toString()) {
      return next(new AppError('Not authorized to access this receipt', 403));
    }

    if (!order.isPaid) {
      return next(new AppError('Receipt is only available for paid orders', 400));
    }

    const { generateReceiptBuffer } = await import('../services/invoiceService.js');
    const pdfBuffer = await generateReceiptBuffer(order, order.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt_${order._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const downloadOrderInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id.toString()) {
      return next(new AppError('Not authorized to access this invoice', 403));
    }

    if (order.orderStatus !== 'Delivered') {
      return next(new AppError('Invoice is only available after delivery', 400));
    }

    const { Invoice } = await import('../models/Invoice.js');
    let invoice = await Invoice.findOne({ order: order._id });
    
    // Fallback: Lazy Generation for legacy/skipped orders
    if (!invoice) {
      try {
        const { User } = await import('../models/User.js');
        const { generateInvoice } = await import('../services/invoiceService.js');
        const userDoc = await User.findById(order.user);
        const invoiceCount = await Invoice.countDocuments();
        const invoiceNumber = `ZF-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(5, '0')}`;
        const pdfFileName = await generateInvoice(order, invoiceNumber, userDoc);
        
        invoice = new Invoice({
          invoiceNumber,
          order: order._id,
          user: order.user,
          pdfUrl: pdfFileName,
          orderTotal: order.priceDetails.totalPrice,
          paymentStatus: 'Paid'
        });
        await invoice.save();
        
        if (!order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          await order.save();
        }
      } catch (invError) {
        console.error('Lazy invoice generation error:', invError);
        return next(new AppError('Failed to generate missing invoice', 500));
      }
    }

    const path = await import('path');
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, '../../../storage/invoices', invoice.pdfUrl);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Invoice file not found on server', 404));
    }

    res.download(filePath, `Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};
