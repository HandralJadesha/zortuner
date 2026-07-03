import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Order', 'Quote', 'Support', 'System'], required: true },
  isRead: { type: Boolean, default: false },
  referenceId: { type: String }
}, {
  timestamps: true
});

export const Notification = model('Notification', NotificationSchema);
export default Notification;
