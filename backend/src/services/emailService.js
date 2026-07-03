import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We will store the test account globally so we don't create it every time
let testAccount = null;

const createTransporter = async () => {
  if (process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    if (!testAccount) {
      testAccount = await nodemailer.createTestAccount();
    }
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

export const sendInvoiceEmail = async (user, order, invoice) => {
  try {
    const transporter = await createTransporter();
    
    const invoicePath = path.join(__dirname, '../../../storage/invoices', invoice.pdfUrl);

    const mailOptions = {
      from: `"Layerly" <${process.env.SMTP_FROM || 'no-reply@layerly.com'}>`,
      to: user.email,
      subject: `Your Invoice from Layerly - Order #${order._id}`,
      text: `Dear ${user.name},\n\nThank you for your order! Your payment was successful.\n\nPlease find your invoice attached.\n\nOrder Total: Rs. ${order.priceDetails.totalPrice.toFixed(2)}\nEstimated Delivery: 5-7 Business Days\n\nCrafting Ideas Into Reality Through 3D Printing.\n\nBest regards,\nLayerly Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111827;">Thank you for your order, ${user.name}!</h2>
          <p>Your payment was successful and your order is now being processed.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Order Summary</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> Rs. ${order.priceDetails.totalPrice.toFixed(2)}</p>
            <p><strong>Estimated Delivery:</strong> 5-7 Business Days</p>
          </div>
          <p>Please find your detailed invoice attached to this email.</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Crafting Ideas Into Reality Through 3D Printing.<br/>
            <strong>Layerly Team</strong>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          path: invoicePath,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${user.email}: ${info.messageId}`);
    
    if (!process.env.SMTP_USER) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending invoice email:', error);
    // We don't want the whole request to fail if email fails, so just return false
    return false;
  }
};

export const sendTicketReplyEmail = async (guestEmail, guestName, subject, replyMessage) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Layerly Support" <${process.env.SMTP_FROM || 'support@layerly.com'}>`,
      to: guestEmail,
      subject: `Re: ${subject} - Layerly Support`,
      text: `Dear ${guestName || 'Customer'},\n\nAn admin has replied to your inquiry regarding "${subject}":\n\n${replyMessage}\n\nBest regards,\nLayerly Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #111827;">Layerly Support Update</h2>
          <p>Dear ${guestName || 'Customer'},</p>
          <p>An admin has replied to your inquiry regarding <strong>"${subject}"</strong>:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #374151; white-space: pre-wrap;">${replyMessage}</p>
          </div>
          <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
            Crafting Ideas Into Reality Through 3D Printing.<br/>
            <strong>Layerly Team</strong>
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Support reply email sent to ${guestEmail}: ${info.messageId}`);
    
    if (!process.env.SMTP_USER) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending support reply email:', error);
    return false;
  }
};
