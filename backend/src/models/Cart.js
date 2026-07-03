import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const CartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedMaterial: { type: String, required: true, default: 'PLA' },
  selectedColor: { type: String, required: true, default: 'White' }
});

const CartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema]
}, {
  timestamps: true
});

export const Cart = model('Cart', CartSchema);
export default Cart;
