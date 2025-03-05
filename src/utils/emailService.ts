import nodemailer from 'nodemailer';
import { serviceRequestEmail } from './template/noticeAssesmentEmail';

interface ServiceRequestData {
  userId: string;
  userEmail?: string;
  userName?: string;
  year?: string;
  quarter?: string;
  details: string;
  status?: string;
  user?: any;
  serviceType: 'Notice of Assessment' | 'Tax Return Copy' | 'BAS Lodgement Copy';
}

/**
 * Sends service request emails to both admin and user (if email provided)
 * @param data The service request data
 * @returns Promise resolving to boolean indicating success
 */
export const sendServiceRequestEmails = async (data: ServiceRequestData): Promise<boolean> => {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NEXT_PUBLIC_EMAIL_USER,
        pass: process.env.NEXT_PUBLIC_EMAIL_PASS
      }
    });

    // For BAS Lodgement, use quarter as year in the email template
    const emailData = {
      ...data,
      year: data.serviceType === 'BAS Lodgement Copy' ? data.quarter : data.year
    };

    // Generate HTML content for email
    const emailHtml = serviceRequestEmail(emailData as any);

    // Get appropriate subject line text based on service type
    const getSubjectText = () => {
      switch (data.serviceType) {
        case 'Notice of Assessment':
          return `New Notice of Assessment Request: ${data.userName || 'Client'}`;
        case 'Tax Return Copy':
          return `New Tax Return Copy Request: ${data.userName || 'Client'}`;
        case 'BAS Lodgement Copy':
          return `New BAS Lodgement Copy Request: ${data.userName || 'Client'}`;
        default:
          return `New Service Request: ${data.userName || 'Client'}`;
      }
    };

    // Get appropriate plain text description based on service type
    const getPlainTextDescription = () => {
      const yearOrQuarter = data.serviceType === 'BAS Lodgement Copy' 
        ? `quarter ${data.quarter}` 
        : `year ${data.year}`;
        
      return `New ${data.serviceType} request from ${data.userName || 'Client'} for ${yearOrQuarter}. Please check the details.`;
    };

    // Configure admin email options
    const adminMailOptions = {
      from: process.env.NEXT_PUBLIC_EMAIL_USER,
      replyTo: data.userEmail || 'no-reply@example.com',
      to: process.env.NEXT_PUBLIC_EMAIL_USER, // Send to admin
      subject: getSubjectText(),
      text: getPlainTextDescription(),
      html: emailHtml
    };

    // Send email to admin
    await transporter.sendMail(adminMailOptions);
    
    // Also send confirmation to user if email is available
    if (data.userEmail) {
      const yearOrQuarter = data.serviceType === 'BAS Lodgement Copy' 
        ? `quarter ${data.quarter}` 
        : `year ${data.year}`;
        
      const userMailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        to: data.userEmail,
        subject: `Your ${data.serviceType} Request Confirmation`,
        text: `Thank you for submitting your ${data.serviceType.toLowerCase()} request for ${yearOrQuarter}. We will process it shortly.`,
        html: emailHtml
      };
      
      await transporter.sendMail(userMailOptions);
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};