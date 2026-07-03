import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ProductSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  basePrice: { type: Number, required: true },
  discountPrice: { type: Number },
  images: [{ type: String, required: true }],
  materials: [{ type: String, default: ['PLA'] }],
  colors: [{ type: String, default: ['White', 'Black', 'Grey', 'Red', 'Blue', 'Gold', 'Silver'] }],
  dimensions: {
    length: { type: Number }, // in mm
    width: { type: Number },  // in mm
    height: { type: Number }  // in mm
  },
  weight: { type: String, required: true }, // can be a range like "10-20"
  inventory: { type: Number, required: true, default: 10 },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  printDuration: { type: Number }, // in hours
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isHidden: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Product = model('Product', ProductSchema);
export default Product;
