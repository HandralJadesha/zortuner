import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  discountType: { type: String, enum: ['percentage', 'flat'], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

export const Coupon = model('Coupon', CouponSchema);
export default Coupon;
