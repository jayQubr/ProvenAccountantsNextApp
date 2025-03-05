import nodemailer from 'nodemailer';
import { serviceRequestEmail } from './template/noticeAssesmentEmail';
import atoRegistrationEmail from './template/atoRegistrationEmail';
import companyRegistrationEmail from './template/companyRegistrationEmail';

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
  trustName?: string;
  companyName?: string;
  address?: string;
  postalCode?: string;
  taxFileNumber?: string;
  position?: string;
  trustType?: string;
  companyType?: string;
  authorizedPersons?: any[];
  status?: string;
  user?: any;
  isDirector?: boolean;
  isShareholder?: boolean;
  shareholderPercentage?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  // ATO Registration fields
  abn?: boolean;
  gst?: boolean;
  fuelTaxCredit?: boolean;
  businessActivity?: string;
  abnRegistrationDate?: string;
  businessAddress?: string;
  annualIncome?: string;
  gstRegistrationDate?: string;
  accountingMethod?: string;
  hasTrucks?: boolean;
  hasMachinery?: boolean;
  hasAgriculture?: boolean;
  serviceType: 
    | 'Notice of Assessment' 
    | 'Tax Return Copy' 
    | 'BAS Lodgement Copy' 
    | 'Update Address' 
    | 'ATO Portal Copy' 
    | 'Payment Plan'
    | 'Trust Registration'
    | 'Company Registration'
    | 'ATO Registration';
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
      case 'ATO Registration':
        emailData.year = 'N/A'; // Not applicable for ATO registrations
        
        // Build details string for ATO registration
        let atoDetails = '';
        
        if (data.abn) {
          atoDetails += 'ABN Registration: Yes\n';
          if (data.businessActivity) atoDetails += `Business Activity: ${data.businessActivity}\n`;
          if (data.abnRegistrationDate) atoDetails += `ABN Registration Date: ${data.abnRegistrationDate}\n`;
          if (data.businessAddress) atoDetails += `Business Address: ${data.businessAddress}\n`;
        } else {
          atoDetails += 'ABN Registration: No\n';
        }
        
        if (data.gst) {
          atoDetails += 'GST Registration: Yes\n';
          if (data.annualIncome) atoDetails += `Annual Income: ${data.annualIncome}\n`;
          if (data.gstRegistrationDate) atoDetails += `GST Registration Date: ${data.gstRegistrationDate}\n`;
          if (data.accountingMethod) atoDetails += `Accounting Method: ${data.accountingMethod}\n`;
        } else {
          atoDetails += 'GST Registration: No\n';
        }
        
        if (data.fuelTaxCredit) {
          atoDetails += 'Fuel Tax Credit: Yes\n';
          if (data.hasTrucks) atoDetails += '- Has vehicles over 4.5 tonnes\n';
          if (data.hasMachinery) atoDetails += '- Has machinery using fuel\n';
          if (data.hasAgriculture) atoDetails += '- Has agricultural/poultry/fishery work\n';
        } else {
          atoDetails += 'Fuel Tax Credit: No\n';
        }
        
        emailData.details = atoDetails;
        break;
      case 'Trust Registration':
        emailData.year = 'N/A'; // Not applicable for trust registrations
        // If details is not provided, generate it from the trust data
        if (!emailData.details) {
          const authorizedPersonsDetails = data.authorizedPersons && data.authorizedPersons.length > 0
            ? data.authorizedPersons.map((person: any, index: number) => 
                `Person ${index + 1}: ${person.fullName || 'N/A'}, Position: ${person.position || 'N/A'}, Email: ${person.email || 'N/A'}`
              ).join('\n')
            : 'No authorized persons added';

          emailData.details = `
Trust Name: ${data.trustName}
Trust Type: ${data.trustType}
Address: ${data.address}
Postal Code: ${data.postalCode}
Tax File Number: ${data.taxFileNumber}
Position: ${data.position}

Authorized Persons:
${authorizedPersonsDetails}
          `;
        }
        break;
      case 'Company Registration':
        emailData.year = 'N/A';
        
        // Format authorized persons details
        const companyAuthorizedPersonsDetails = data.authorizedPersons && data.authorizedPersons.length > 0
          ? data.authorizedPersons.map((person: any, index: number) => {
              let positionInfo = [];
              if (person.isDirector) positionInfo.push('Director');
              if (person.isShareholder) positionInfo.push(`Shareholder (${person.shareholderPercentage}%)`);
              
              return `
Person ${index + 1}: ${person.fullName || 'N/A'}
Email: ${person.email || 'N/A'}
Date of Birth: ${person.dateOfBirth || 'N/A'}
Phone: ${person.phone || 'N/A'}
Address: ${person.address || 'N/A'}
Postal Code: ${person.postalCode || 'N/A'}
Tax File Number: ${person.taxFileNumber || 'N/A'}
Position: ${positionInfo.length > 0 ? positionInfo.join(', ') : 'N/A'}

              `;
            }).join('\n\n')
          : 'No authorized persons added';

        // Format main applicant position info
        let mainApplicantPositionInfo = [];
        if (data.isDirector) mainApplicantPositionInfo.push('Director');
        if (data.isShareholder) mainApplicantPositionInfo.push(`Shareholder (${data.shareholderPercentage}%)`);
        
        emailData.details = `
Company Name: ${data.companyName || 'N/A'}
Company Type: ${data.companyType || 'N/A'}
Address: ${data.address || 'N/A'}
Postal Code: ${data.postalCode || 'N/A'}
Tax File Number: ${data.taxFileNumber || 'N/A'}

Main Applicant Position: ${mainApplicantPositionInfo.length > 0 ? mainApplicantPositionInfo.join(', ') : 'N/A'}

Authorized Persons:
${companyAuthorizedPersonsDetails}
        `;
        break;
    }

    // Generate HTML content for email
    let emailHtml;
    
    // Use specialized template based on service type
    if (data.serviceType === 'ATO Registration') {
      // Convert flat structure to nested structure expected by atoRegistrationEmail
      const atoData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        postalAddress: data.address || '',
        postalCode: data.postalCode || '',
        status: data.status || 'Pending',
        user: data.user,
        abn: {
          selected: !!data.abn,
          businessActivity: data.businessActivity,
          registrationDate: data.abnRegistrationDate,
          businessAddress: data.businessAddress
        },
        gst: {
          selected: !!data.gst,
          annualIncome: data.annualIncome,
          registrationDate: data.gstRegistrationDate,
          accountingMethod: data.accountingMethod
        },
        fuelTaxCredit: {
          selected: !!data.fuelTaxCredit,
          hasTrucks: !!data.hasTrucks,
          hasMachinery: !!data.hasMachinery,
          hasAgriculture: !!data.hasAgriculture
        }
      };
      
      emailHtml = atoRegistrationEmail(atoData);
    } else if (data.serviceType === 'Company Registration') {
      // Use the specialized company registration template
      const companyData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        companyName: data.companyName,
        companyType: data.companyType,
        address: data.address,
        postalCode: data.postalCode,
        taxFileNumber: data.taxFileNumber,
        isDirector: data.isDirector,
        isShareholder: data.isShareholder,
        shareholderPercentage: data.shareholderPercentage,
        authorizedPersons: data.authorizedPersons || [],
        status: data.status || 'pending',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        notes: data.notes
      };
      
      emailHtml = companyRegistrationEmail(companyData);
    } else {
      // Use generic template for other service types
      emailHtml = serviceRequestEmail(emailData);
    }

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
        case 'Trust Registration':
          return `New Trust Registration Request: ${clientName}`;
        case 'Company Registration':
          return `New Company Registration Request: ${clientName}`;
        case 'ATO Registration':
          return `New ATO Registration Request: ${clientName}`;
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
        case 'Trust Registration':
          return `New Trust Registration request from ${clientName} for trust "${data.trustName}". Please check the details.`;
        case 'Company Registration':
          return `New Company Registration request from ${clientName} for company "${data.companyName}". Please check the details.`;
        case 'ATO Registration':
          return `New ATO Registration request from ${clientName}. Please check the details.`;
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
        case 'Trust Registration':
          confirmationText = `Thank you for submitting your trust registration request for "${data.trustName}". We will process it shortly.`;
          break;
        case 'Company Registration':
          confirmationText = `Thank you for submitting your company registration request for "${data.companyName}". We will process it shortly.`;
          break;
        case 'ATO Registration':
          confirmationText = `Thank you for submitting your ATO registration request. We will process it shortly.`;
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