import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  image: { type: String, required: true }
}, {
  timestamps: true
});

export const Category = model('Category', CategorySchema);
export default Category;
