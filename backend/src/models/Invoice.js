import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const InvoiceSchema = new Schema({
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  order: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  pdfUrl: { 
    type: String, 
    required: true 
  },
  generatedDate: { 
    type: Date, 
    default: Date.now 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
    default: 'Paid'
  },
  orderTotal: { 
    type: Number, 
    required: true 
  }
}, {
  timestamps: true
});

export const Invoice = model('Invoice', InvoiceSchema);
export default Invoice;
