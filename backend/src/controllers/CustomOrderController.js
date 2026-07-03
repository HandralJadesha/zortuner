import { CustomOrder } from '../models/CustomOrder.js';
import { AppError } from '../middleware/error.js';
import { parseSTL } from '../utils/stlParser.js';
import { calculateQuote } from '../utils/quoteCalculator.js';
import { Notification } from '../models/Notification.js';
import { sendCustomOrderEmails } from '../utils/mailer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const parseStlAndEstimate = async (req, res, next) => {
  try {
    let buffer = null;
    let fileName = 'model.stl';

    if (req.body && Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (req.body && req.body.fileBase64) {
      buffer = Buffer.from(req.body.fileBase64, 'base64');
      fileName = req.body.fileName || 'model.stl';
    }

    if (!buffer) {
      const vol = req.body.volume || Math.round((20 + Math.random() * 80) * 100) / 100;
      const material = req.body.selectedMaterial || 'PLA';
      const finish = req.body.selectedFinish || 'Raw';
      const infill = req.body.infill || 20;

      const quote = calculateQuote({ volume: vol, material, finish, infill });
      return res.status(200).json({
        success: true,
        fileName: req.body.fileName || 'custom-design.stl',
        volume: vol,
        dimensions: req.body.dimensions || { length: 50, width: 50, height: 60 },
        weight: quote.weight,
        printDuration: quote.printDuration,
        estimatedPrice: quote.estimatedPrice
      });
    }

    let stlMetrics = { volume: req.body.volume || 35.0, dimensions: { length: 50, width: 50, height: 50 } };
    if (fileName.toLowerCase().endsWith('.stl')) {
      try {
        stlMetrics = parseSTL(buffer);
      } catch (e) {
        console.warn('Failed to parse STL:', e);
      }
    }

    const material = req.body.selectedMaterial || 'PLA';
    const finish = req.body.selectedFinish || 'Raw';
    const infill = req.body.infill || 20;

    const quote = calculateQuote({ volume: stlMetrics.volume, material, finish, infill });

    res.status(200).json({
      success: true,
      fileName,
      volume: stlMetrics.volume,
      dimensions: stlMetrics.dimensions,
      weight: quote.weight,
      printDuration: quote.printDuration,
      estimatedPrice: quote.estimatedPrice
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomOrder = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const {
      fileUrl,
      fileName,
      volume,
      dimensions,
      selectedMaterial,
      selectedColor,
      selectedFinish,
      infill
    } = req.body;

    let finalFileUrl = fileUrl;
    if (fileUrl && fileUrl.startsWith('data:')) {
      const matches = fileUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const uploadDir = path.join(__dirname, '../../public/uploads/custom_orders');
        
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeFileName = fileName ? fileName.replace(/[^a-zA-Z0-9.\-]/g, '_') : 'model.stl';
        const uniqueFileName = `${Date.now()}-${safeFileName}`;
        const filePath = path.join(uploadDir, uniqueFileName);

        fs.writeFileSync(filePath, buffer);

        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const host = req.get('host');
        finalFileUrl = `${protocol}://${host}/uploads/custom_orders/${uniqueFileName}`;
      }
    }

    const quote = calculateQuote({
      volume,
      material: selectedMaterial,
      finish: selectedFinish,
      infill
    });

    const customOrder = new CustomOrder({
      user: req.user.id,
      fileUrl: finalFileUrl,
      fileName,
      volume,
      weight: quote.weight,
      dimensions,
      selectedMaterial,
      selectedColor,
      selectedFinish,
      estimatedPrice: quote.estimatedPrice,
      status: 'Pending Quote',
      chatHistory: [
        {
          sender: 'admin',
          message: 'Thank you for submitting your design. We are reviewing the printability of your STL model. A final quote will be updated shortly.'
        }
      ]
    });

    await customOrder.save();

    const notification = new Notification({
      user: req.user.id,
      message: `Your custom design "${fileName}" has been submitted for review.`,
      type: 'Quote',
      referenceId: customOrder._id.toString()
    });
    await notification.save();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@layerly.com';
    // We can run this asynchronously without awaiting to not block the response
    sendCustomOrderEmails(req.user.email, adminEmail, {
      fileName,
      volume,
      selectedMaterial,
      selectedColor,
      selectedFinish,
      estimatedPrice: quote.estimatedPrice
    }).catch(err => console.error('Failed to send custom order emails:', err));

    res.status(201).json({
      success: true,
      customOrder
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCustomOrders = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const customOrders = await CustomOrder.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      customOrders
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customOrder = await CustomOrder.findById(id).populate('user', 'name email');
    if (!customOrder) {
      return next(new AppError('Custom design order not found', 404));
    }

    res.status(200).json({
      success: true,
      customOrder
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetCustomOrders = async (req, res, next) => {
  try {
    const customOrders = await CustomOrder.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      customOrders
    });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminQuotedPrice, status, systemMessage } = req.body;

    const customOrder = await CustomOrder.findById(id);
    if (!customOrder) {
      return next(new AppError('Custom order not found', 404));
    }

    if (adminQuotedPrice !== undefined) customOrder.adminQuotedPrice = adminQuotedPrice;
    if (status !== undefined) customOrder.status = status;

    if (systemMessage) {
      customOrder.chatHistory.push({
        sender: 'admin',
        message: systemMessage
      });
    }

    await customOrder.save();

    const notification = new Notification({
      user: customOrder.user,
      message: `Your custom design quote for "${customOrder.fileName}" has been updated. Status: ${customOrder.status}`,
      type: 'Quote',
      referenceId: customOrder._id.toString()
    });
    await notification.save();

    res.status(200).json({
      success: true,
      customOrder
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { id } = req.params;
    const { message } = req.body;

    const customOrder = await CustomOrder.findById(id);
    if (!customOrder) {
      return next(new AppError('Custom order not found', 404));
    }

    if (req.user.role !== 'admin' && customOrder.user.toString() !== req.user.id) {
      return next(new AppError('Not authorized to message on this order', 403));
    }

    const senderRole = req.user.role === 'admin' ? 'admin' : 'user';
    customOrder.chatHistory.push({
      sender: senderRole,
      message
    });

    await customOrder.save();

    const recipientId = senderRole === 'admin' ? customOrder.user : null;
    if (recipientId) {
      const notification = new Notification({
        user: recipientId,
        message: `New message regarding your custom print "${customOrder.fileName}"`,
        type: 'Quote',
        referenceId: customOrder._id.toString()
      });
      await notification.save();
    }

    res.status(200).json({
      success: true,
      chatHistory: customOrder.chatHistory
    });
  } catch (error) {
    next(error);
  }
};
