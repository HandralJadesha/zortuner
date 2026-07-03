import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
const invoiceDir = path.join(__dirname, '../../../storage/invoices');
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}

export const generateInvoice = async (order, invoiceNumber, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `${invoiceNumber}.pdf`;
      const filePath = path.join(invoiceDir, fileName);
      
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);

      // --- Colors & Branding ---
      const primaryColor = '#111827';
      const secondaryColor = '#4B5563';
      const accentColor = '#3B82F6';

      // --- Header ---
      doc.fontSize(28).font('Helvetica-Bold');
      doc.fillColor('#2c0066').text('Layerly', 50, 50, { continued: true })
         .fillColor('#5b21b6').text('Crafts');
         
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Crafting Ideas Into Reality Through 3D Printing', 50, 80);

      // --- Invoice Details ---
      doc.fillColor(primaryColor)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('INVOICE', 400, 50, { align: 'right' });
         
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Invoice Number:', 400, 80, { align: 'right' })
         .font('Helvetica')
         .text(invoiceNumber, 400, 95, { align: 'right' })
         .font('Helvetica-Bold')
         .text('Order Number:', 400, 115, { align: 'right' })
         .font('Helvetica')
         .text(order._id.toString(), 400, 130, { align: 'right' })
         .font('Helvetica-Bold')
         .text('Date:', 400, 150, { align: 'right' })
         .font('Helvetica')
         .text(new Date().toLocaleDateString(), 400, 165, { align: 'right' });

      doc.moveTo(50, 200).lineTo(550, 200).lineWidth(1).strokeColor('#E5E7EB').stroke();

      // --- Customer Details ---
      doc.fillColor(primaryColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Bill To:', 50, 220);

      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text(user.name, 50, 240)
         .text(user.email, 50, 255);
         
      if (user.contact) {
         doc.text(user.contact, 50, 270);
      }

      const addressY = user.contact ? 285 : 270;
      doc.fillColor(primaryColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Ship To:', 300, 220);

      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`${order.shippingAddress.street}`, 300, 240)
         .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, 300, 255)
         .text(`${order.shippingAddress.country}`, 300, 270);

      doc.moveTo(50, 320).lineTo(550, 320).lineWidth(1).strokeColor('#E5E7EB').stroke();

      // --- Table Header ---
      let y = 350;
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Item', 50, y)
         .text('Material', 250, y)
         .text('Qty', 350, y)
         .text('Unit Price', 400, y)
         .text('Total', 480, y, { align: 'right' });

      doc.moveTo(50, y + 20).lineTo(550, y + 20).lineWidth(1).strokeColor('#E5E7EB').stroke();
      y += 35;

      // --- Table Rows ---
      doc.font('Helvetica');
      for (const item of order.orderItems) {
        doc.fillColor(secondaryColor)
           .text(item.title, 50, y, { width: 190 })
           .text(item.selectedMaterial || '-', 250, y)
           .text(item.quantity.toString(), 350, y)
           .text(`Rs. ${item.price.toFixed(2)}`, 400, y)
           .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 480, y, { align: 'right' });
        
        y += 30;
      }

      doc.moveTo(50, y).lineTo(550, y).lineWidth(1).strokeColor('#E5E7EB').stroke();
      y += 20;

      // --- Totals ---
      doc.fillColor(secondaryColor)
         .text('Subtotal:', 350, y)
         .text(`Rs. ${order.priceDetails.itemsPrice.toFixed(2)}`, 480, y, { align: 'right' });
      y += 20;

      doc.text('Shipping:', 350, y)
         .text(`Rs. ${order.priceDetails.shippingPrice.toFixed(2)}`, 480, y, { align: 'right' });
      y += 20;

      doc.text('Tax (18%):', 350, y)
         .text(`Rs. ${order.priceDetails.taxPrice.toFixed(2)}`, 480, y, { align: 'right' });
      y += 20;

      if (order.priceDetails.couponDiscount > 0) {
        doc.fillColor('#10B981')
           .text('Discount:', 350, y)
           .text(`- Rs. ${order.priceDetails.couponDiscount.toFixed(2)}`, 480, y, { align: 'right' });
        y += 20;
      }

      doc.moveTo(350, y).lineTo(550, y).lineWidth(1).strokeColor('#E5E7EB').stroke();
      y += 15;

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Total Amount:', 350, y)
         .text(`Rs. ${order.priceDetails.totalPrice.toFixed(2)}`, 480, y, { align: 'right' });

      // --- Footer & QR Code ---
      const qrY = 650;
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(`https://layerly.com/dashboard?orderId=${order._id}`);
        doc.image(qrCodeDataUrl, 50, qrY, { width: 70 });
      } catch (err) {
        console.error('QR Generation error:', err);
      }

      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Thank you for choosing Layerly!', 130, qrY + 20)
         .text('For support, contact us at support@layerly.com', 130, qrY + 35);

      doc.end();

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const generateReceiptBuffer = async (order, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Colors & Branding ---
      const primaryColor = '#111827';
      const secondaryColor = '#4B5563';
      const accentColor = '#3B82F6';

      // --- Header ---
      doc.fontSize(28).font('Helvetica-Bold');
      doc.fillColor('#2c0066').text('Layerly', 50, 50, { continued: true })
         .fillColor('#5b21b6').text('Crafts');
         
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Crafting Ideas Into Reality Through 3D Printing', 50, 80);

      // --- Receipt Details ---
      doc.fillColor(primaryColor)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('PAYMENT RECEIPT', 350, 50, { align: 'right' });
         
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Order Number:', 400, 80, { align: 'right' })
         .font('Helvetica')
         .text(order._id.toString(), 400, 95, { align: 'right' })
         .font('Helvetica-Bold')
         .text('Payment Date:', 400, 115, { align: 'right' })
         .font('Helvetica')
         .text(new Date(order.paidAt || order.createdAt).toLocaleDateString(), 400, 130, { align: 'right' })
         .font('Helvetica-Bold')
         .text('Payment ID:', 400, 150, { align: 'right' })
         .font('Helvetica')
         .text(order.razorpayPaymentId || 'N/A', 400, 165, { align: 'right' });

      doc.moveTo(50, 200).lineTo(550, 200).lineWidth(1).strokeColor('#E5E7EB').stroke();

      // --- Customer Details ---
      doc.fillColor(primaryColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Paid By:', 50, 220);

      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica')
         .text(user.name, 50, 240)
         .text(user.email, 50, 255);

      // --- Table Header ---
      let y = 300;
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('Item', 50, y)
         .text('Material', 250, y)
         .text('Qty', 350, y)
         .text('Unit Price', 400, y)
         .text('Total', 480, y, { align: 'right' });

      doc.moveTo(50, y + 20).lineTo(550, y + 20).lineWidth(1).strokeColor('#E5E7EB').stroke();
      y += 35;

      // --- Table Rows ---
      doc.font('Helvetica');
      for (const item of order.orderItems) {
        doc.fillColor(secondaryColor)
           .text(item.title, 50, y, { width: 190 })
           .text(item.selectedMaterial || '-', 250, y)
           .text(item.quantity.toString(), 350, y)
           .text(`Rs. ${item.price.toFixed(2)}`, 400, y)
           .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 480, y, { align: 'right' });
        
        y += 30;
      }

      doc.moveTo(50, y).lineTo(550, y).lineWidth(1).strokeColor('#E5E7EB').stroke();
      y += 20;

      // --- Totals ---
      doc.fillColor(secondaryColor)
         .text('Subtotal:', 350, y)
         .text(`Rs. ${order.priceDetails.itemsPrice.toFixed(2)}`, 480, y, { align: 'right' });
      y += 20;

      doc.text('Shipping:', 350, y)
         .text(`Rs. ${order.priceDetails.shippingPrice.toFixed(2)}`, 480, y, { align: 'right' });
      y += 20;

      doc.text('Tax (18%):', 350, y)
         .text(`Rs. ${order.priceDetails.taxPrice.toFixed(2)}`, 480, y, { align: 'right' });
      y += 20;

      if (order.priceDetails.couponDiscount > 0) {
        doc.fillColor('#10B981')
           .text('Discount:', 350, y)
           .text(`- Rs. ${order.priceDetails.couponDiscount.toFixed(2)}`, 480, y, { align: 'right' });
        y += 20;
      }

      doc.moveTo(350, y).lineTo(550, y).lineWidth(1).strokeColor('#E5E7EB').stroke();
      y += 15;

      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Amount Paid:', 350, y)
         .text(`Rs. ${order.priceDetails.totalPrice.toFixed(2)}`, 480, y, { align: 'right' });

      // --- Footer ---
      const footerY = 700;
      doc.fillColor(secondaryColor)
         .fontSize(10)
         .font('Helvetica-Oblique')
         .text('This is a computer-generated receipt for your payment and does not require a physical signature.', 50, footerY, { align: 'center' });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};
