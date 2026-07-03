import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Invoice } from '../models/Invoice.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.js';
import { sendInvoiceEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('order', 'priceDetails orderStatus createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('user', 'name email contact')
      .populate('order', 'orderStatus priceDetails createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices
    });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    // Security check: only admin or the owner can download
    if (req.user.role !== 'admin' && invoice.user.toString() !== req.user.id.toString()) {
      return next(new AppError('Not authorized to access this invoice', 403));
    }

    const filePath = path.join(__dirname, '../../../storage/invoices', invoice.pdfUrl);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Invoice file not found on server', 404));
    }

    res.download(filePath, `Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};

export const resendInvoiceEmail = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('user')
      .populate('order');
      
    if (!invoice) {
      return next(new AppError('Invoice not found', 404));
    }

    const emailSent = await sendInvoiceEmail(invoice.user, invoice.order, invoice);
    
    if (emailSent) {
      res.status(200).json({ success: true, message: 'Invoice email resent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    next(error);
  }
};
