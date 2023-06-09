import nodemailer, { Transporter } from 'nodemailer';
import logger from '../custom-logger';
import dotenv from 'dotenv';
dotenv.config();

// Create a single instance of the transporter
const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_APPLICATION_PASS,
  },
});

// Function to send email with the HTML table content
async function sendEmail(htmlContent: string, userEmail: string) {
  // Define the email options
  const mailOptions = {
    from: process.env.GMAIL_ADDRESS,
    to: userEmail,
    subject: 'Property Details',
    html: htmlContent,
  };

  try {
    // Send the email using the transporter instance
    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully');
  } catch (error) {
    logger.error('Error occurred while sending email:', error);
  }
}

export default sendEmail;
