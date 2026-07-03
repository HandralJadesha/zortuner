import { SupportTicket } from '../models/SupportTicket.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/error.js';
import { sendTicketReplyEmail } from '../services/emailService.js';

export const createTicket = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { subject, message } = req.body;
    const ticket = new SupportTicket({
      user: req.user.id,
      subject,
      status: 'Open',
      messages: [
        {
          sender: 'user',
          message
        }
      ]
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

export const createGuestTicket = async (req, res, next) => {
  try {
    const { guestName, guestEmail, subject, message } = req.body;
    
    if (!guestName || !guestEmail || !subject || !message) {
      return next(new AppError('Please provide name, email, subject and message', 400));
    }

    const ticket = new SupportTicket({
      guestName,
      guestEmail,
      subject,
      status: 'Open',
      messages: [
        {
          sender: 'user',
          message
        }
      ]
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await SupportTicket.findById(id).populate('user', 'name email');
    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const { id } = req.params;
    const { message, status } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return next(new AppError('Ticket not found', 404));
    }

    const senderRole = req.user.role === 'admin' ? 'admin' : 'user';

    ticket.messages.push({
      sender: senderRole,
      message
    });

    if (status) {
      ticket.status = status;
    } else if (senderRole === 'admin') {
      ticket.status = 'In Progress';
    }

    await ticket.save();

    if (senderRole === 'admin') {
      if (ticket.user) {
        const notification = new Notification({
          user: ticket.user,
          message: `Admin replied to your support ticket: "${ticket.subject}"`,
          type: 'Support',
          referenceId: ticket._id.toString()
        });
        await notification.save();
      } else if (ticket.guestEmail) {
        await sendTicketReplyEmail(ticket.guestEmail, ticket.guestName, ticket.subject, message);
      }
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    next(error);
  }
};

export const getMyNotifications = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    if (!req.user) return next(new AppError('Not authorized', 401));

    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};
