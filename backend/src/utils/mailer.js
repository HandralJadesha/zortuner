import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.log('--------------------------------------------------');
      console.log(`[MAILER MOCK] To: ${email}`);
      console.log(`[MAILER MOCK] Subject: Layerly OTP Verification`);
      console.log(`[MAILER MOCK] OTP Code: ${otp}`);
      console.log('--------------------------------------------------');
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const mailOptions = {
      from: `"Layerly" <${user}>`,
      to: email,
      subject: 'Layerly OTP - Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #7C3AED; text-align: center;">Layerly</h2>
          <p>Hello,</p>
          <p>Thank you for choosing Layerly. To verify your email address, please use the following One-Time Password (OTP):</p>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a; margin: 20px 0; border-radius: 4px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes. If you did not request this verification, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Transforming Ideas Into Reality - Layerly 3D Printing</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Mailer error:', error);
    return false;
  }
};
export const sendCustomOrderEmails = async (userEmail, adminEmail, orderDetails) => {
  try {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.log('--------------------------------------------------');
      console.log(`[MAILER MOCK] To User: ${userEmail}`);
      console.log(`[MAILER MOCK] To Admin: ${adminEmail}`);
      console.log(`[MAILER MOCK] Subject: Layerly Custom 3D Print Request`);
      console.log(`[MAILER MOCK] Details: File: ${orderDetails.fileName}, Material: ${orderDetails.selectedMaterial}, Est. Price: ₹${orderDetails.estimatedPrice}`);
      console.log('--------------------------------------------------');
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    // 1. Email to the User
    const userMailOptions = {
      from: `"Layerly" <${user}>`,
      to: userEmail,
      subject: 'Layerly - Custom 3D Print Request Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #7C3AED; text-align: center;">Layerly</h2>
          <p>Hello,</p>
          <p>We have successfully received your custom 3D printing request for <strong>${orderDetails.fileName}</strong>.</p>
          <div style="background-color: #f1f5f9; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <ul style="list-style-type: none; padding: 0;">
              <li><strong>Material:</strong> ${orderDetails.selectedMaterial}</li>
              <li><strong>Color:</strong> ${orderDetails.selectedColor}</li>
              <li><strong>Finish:</strong> ${orderDetails.selectedFinish}</li>
              <li><strong>Estimated Price:</strong> ₹${orderDetails.estimatedPrice}</li>
            </ul>
          </div>
          <p>Our admins will review the printability of your model and update the final quote on your dashboard shortly.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
          <p style="font-size: 12px; color: #64748b; text-align: center;">Transforming Ideas Into Reality - Layerly 3D Printing</p>
        </div>
      `
    };

    // 2. Email to the Admin
    const adminMailOptions = {
      from: `"Layerly" <${user}>`,
      to: adminEmail,
      subject: 'ACTION REQUIRED: New Custom 3D Print Order',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #ef4444;">New Custom Order Submitted</h2>
          <p>A new custom 3D print request has been submitted by <strong>${userEmail}</strong> and requires review.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <ul style="list-style-type: none; padding: 0;">
              <li><strong>File Name:</strong> ${orderDetails.fileName}</li>
              <li><strong>Volume:</strong> ${orderDetails.volume} cm³</li>
              <li><strong>Material:</strong> ${orderDetails.selectedMaterial} (${orderDetails.selectedColor})</li>
              <li><strong>Finish:</strong> ${orderDetails.selectedFinish}</li>
              <li><strong>Estimated System Price:</strong> ₹${orderDetails.estimatedPrice}</li>
            </ul>
          </div>
          <p>Please log in to the admin dashboard to review the STL file, adjust the quote, and approve or reject the request.</p>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    return true;
  } catch (error) {
    console.error('Mailer error:', error);
    return false;
  }
};

export default { sendOtpEmail, sendCustomOrderEmails };
