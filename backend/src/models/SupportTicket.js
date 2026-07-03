import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const TicketMessageSchema = new Schema({
  sender: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SupportTicketSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String },
  guestEmail: { type: String },
  subject: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  messages: [TicketMessageSchema]
}, {
  timestamps: true
});

export const SupportTicket = model('SupportTicket', SupportTicketSchema);
export default SupportTicket;
