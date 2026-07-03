import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  image: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  selectedMaterial: { type: String, required: true },
  selectedColor: { type: String, required: true }
});

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [OrderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  paymentMethod: { type: String, required: true, default: 'Razorpay' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  priceDetails: {
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true }
  },
  couponApplied: { type: Schema.Types.ObjectId, ref: 'Coupon' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Processing', 'Printing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date }
}, {
  timestamps: true
});

export const Order = model('Order', OrderSchema);
export const OrderItem = model('OrderItem', OrderItemSchema);
export default Order;
