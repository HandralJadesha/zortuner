import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ChatMessageSchema = new Schema({
  sender: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const CustomOrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  volume: { type: Number },
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  selectedMaterial: { type: String, required: true, default: 'PLA' },
  selectedColor: { type: String, required: true, default: 'White' },
  selectedFinish: { type: String, required: true, default: 'Raw' },
  estimatedPrice: { type: Number },
  adminQuotedPrice: { type: Number },
  status: {
    type: String,
    enum: ['Pending Quote', 'Quoted', 'Approved', 'Printing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending Quote'
  },
  chatHistory: [ChatMessageSchema],
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date }
}, {
  timestamps: true
});

export const CustomOrder = model('CustomOrder', CustomOrderSchema);
export default CustomOrder;
