import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }]
}, {
  timestamps: true
});

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

export const Review = model('Review', ReviewSchema);
export default Review;
