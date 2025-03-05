import nodemailer from 'nodemailer';
import { serviceRequestEmail } from './template/noticeAssesmentEmail';

interface ServiceRequestData {
  userId: string;
  userEmail?: string;
  userName?: string;
  year?: string;
  quarter?: string;
  period?: string;
  details?: string;
  oldAddress?: string;
  newAddress?: string;
  planType?: string;
  amount?: number;
  status?: string;
  user?: any;
  serviceType: 
    | 'Notice of Assessment' 
    | 'Tax Return Copy' 
    | 'BAS Lodgement Copy' 
    | 'Update Address' 
    | 'ATO Portal Copy' 
    | 'Payment Plan';
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

    // Prepare data for email template based on service type
    let emailData: any = { ...data };
    
    // Format details based on service type
    switch (data.serviceType) {
      case 'BAS Lodgement Copy':
        emailData.year = data.quarter; // Use quarter as year in the email template
        break;
      case 'Update Address':
        emailData.year = 'N/A'; // Not applicable for address updates
        emailData.details = `Old Address: ${data.oldAddress}\nNew Address: ${data.newAddress}`;
        break;
      case 'ATO Portal Copy':
        emailData.year = data.period; // Use period as year in the email template
        break;
      case 'Payment Plan':
        emailData.year = 'N/A'; // Not applicable for payment plans
        emailData.details = `Plan Type: ${data.planType}\nAmount: $${data.amount}\n${data.details || ''}`;
        break;
    }

    // Generate HTML content for email
    const emailHtml = serviceRequestEmail(emailData);

    // Get appropriate subject line text based on service type
    const getSubjectText = () => {
      const clientName = data.userName || 'Client';
      switch (data.serviceType) {
        case 'Notice of Assessment':
          return `New Notice of Assessment Request: ${clientName}`;
        case 'Tax Return Copy':
          return `New Tax Return Copy Request: ${clientName}`;
        case 'BAS Lodgement Copy':
          return `New BAS Lodgement Copy Request: ${clientName}`;
        case 'Update Address':
          return `New Address Update Request: ${clientName}`;
        case 'ATO Portal Copy':
          return `New ATO Portal Copy Request: ${clientName}`;
        case 'Payment Plan':
          return `New Payment Plan Request: ${clientName}`;
        default:
          return `New Service Request: ${clientName}`;
      }
    };

    // Get appropriate plain text description based on service type
    const getPlainTextDescription = () => {
      const clientName = data.userName || 'Client';
      
      switch (data.serviceType) {
        case 'Notice of Assessment':
        case 'Tax Return Copy':
          return `New ${data.serviceType} request from ${clientName} for year ${data.year}. Please check the details.`;
        case 'BAS Lodgement Copy':
          return `New ${data.serviceType} request from ${clientName} for quarter ${data.quarter}. Please check the details.`;
        case 'Update Address':
          return `New Address Update request from ${clientName}. Old address: ${data.oldAddress}, New address: ${data.newAddress}`;
        case 'ATO Portal Copy':
          return `New ATO Portal Copy request from ${clientName} for period ${data.period}. Please check the details.`;
        case 'Payment Plan':
          return `New Payment Plan request from ${clientName}. Plan type: ${data.planType}, Amount: $${data.amount}. Please check the details.`;
        default:
          return `New service request from ${clientName}. Please check the details.`;
      }
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
    console.log('Sending email to admin:', adminMailOptions.to);
    await transporter.sendMail(adminMailOptions);
    
    // Also send confirmation to user if email is available
    if (data.userEmail) {
      let confirmationText = '';
      
      switch (data.serviceType) {
        case 'Notice of Assessment':
        case 'Tax Return Copy':
          confirmationText = `Thank you for submitting your ${data.serviceType.toLowerCase()} request for year ${data.year}. We will process it shortly.`;
          break;
        case 'BAS Lodgement Copy':
          confirmationText = `Thank you for submitting your ${data.serviceType.toLowerCase()} request for quarter ${data.quarter}. We will process it shortly.`;
          break;
        case 'Update Address':
          confirmationText = `Thank you for submitting your address update request. We will process the change from "${data.oldAddress}" to "${data.newAddress}" shortly.`;
          break;
        case 'ATO Portal Copy':
          confirmationText = `Thank you for submitting your ATO portal copy request for period ${data.period}. We will process it shortly.`;
          break;
        case 'Payment Plan':
          confirmationText = `Thank you for submitting your payment plan request (${data.planType}) for $${data.amount}. We will process it shortly.`;
          break;
        default:
          confirmationText = `Thank you for submitting your service request. We will process it shortly.`;
      }
      
      const userMailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        to: data.userEmail,
        subject: `Your ${data.serviceType} Request Confirmation`,
        text: confirmationText,
        html: emailHtml
      };
      
      console.log('Sending confirmation email to user:', data.userEmail);
      await transporter.sendMail(userMailOptions);
    }

    console.log(`Email sent successfully for ${data.serviceType} service`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};