import fs from 'fs';
import path from 'path';

interface AuthorizedPerson {
  fullName: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  postalCode: string;
  taxFileNumber: string;
  position: string;
  isDirector: boolean;
  isShareholder: boolean;
  shareholderPercentage: string;
}

interface CompanyRegistrationData {
    userId: string;
    userEmail?: string;
    userName?: string;
    companyName?: string;
    companyType?: string;
    companyAddress?: string;
    address?: string;
    postalCode?: string;
    taxFileNumber?: string;
    isDirector?: boolean;
    isShareholder?: boolean;
    shareholderPercentage?: string;
    authorizedPersons?: AuthorizedPerson[];
    status?: string;
    createdAt?: any;
    updatedAt?: any;
    notes?: string;
    serviceType?: string;
}

// HTML template as a string (for production where file access might be limited)
const htmlTemplateString = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Company Registration Request</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* CLIENT-SPECIFIC STYLES */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }

        /* RESET STYLES */
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* GMAIL BLUE LINKS */
        u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /* SAMSUNG MAIL BLUE LINKS */
        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
        }

        /* Universal styles */
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
            line-height: 1.5;
        }

        /* Responsive styles */
        @media screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                max-width: 100% !important;
            }
            .responsive-table {
                width: 100% !important;
            }
            .mobile-padding {
                padding-left: 15px !important;
                padding-right: 15px !important;
            }
            .mobile-stack {
                display: block !important;
                width: 100% !important;
            }
            .mobile-center {
                text-align: center !important;
            }
            .mobile-logo {
                max-width: 120px !important;
            }
        }
    </style>
</head>
<body id="body" style="margin: 0 !important; padding: 0 !important; background-color: #f5f5f5;">
    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Arial, Helvetica, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        New Company Registration Request - Please review the details
    </div>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" class="responsive-table">
                    <!-- HEADER WITH LOGO AND TITLE -->
                    <tr>
                        <td style="padding: 0; border-top-left-radius: 5px; border-top-right-radius: 5px; background-color: #0369a1;">
                            <!-- Logo section on top of colored background -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="padding: 25px 0 15px 0;">
                                        <div style="background-color: #ffffff; padding: 20px; border-radius: 5px;width: 120px;height: 120px;">
                                            <img src="https://provenaccountants.com.au/wp-content/uploads/2018/10/PROVEN-LOGO-1.png" width="120" height="30" alt="Proven Accountants" style="display: block; width: 120px; height: auto;" class="mobile-logo">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Header content -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding: 0 25px 25px 25px; text-align: center;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: bold;">Company Registration Request</h1>
                                        <p style="margin: 10px 0 0 0; color: #e0f2fe; font-size: 14px;">
                                            Submitted on {{DATE}}
                                        </p>
                                        
                                        <!-- Status badge -->
                                        <table border="0" cellpadding="0" cellspacing="0" style="margin: 15px auto 0 auto;">
                                            <tr>
                                                <td style="border-radius: 3px; background-color: #fff4e5; padding: 5px 15px;">
                                                    <p style="margin: 0; color: #b45309; font-size: 14px; font-weight: bold;">
                                                        Status: {{STATUS}}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 15px; line-height: 1.5; max-width: 450px; display: inline-block;">
                                            A new company registration request has been submitted. Please review the details below:
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CLIENT INFORMATION SECTION -->
                    <tr>
                        <td style="padding: 25px 30px 25px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                            Client Information
                                        </h2>
                                        
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Name:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{NAME}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Email Address:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{EMAIL}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">User ID:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{USER_ID}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- COMPANY INFORMATION SECTION -->
                    <tr>
                        <td style="padding: 0 30px 25px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                            Company Details
                                        </h2>
                                        
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Company Name:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{COMPANY_NAME}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Company Type:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{COMPANY_TYPE}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Address:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{ADDRESS}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Postal Code:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{POSTAL_CODE}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Tax File Number:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{TAX_FILE_NUMBER}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- MAIN APPLICANT POSITION SECTION -->
                    <tr>
                        <td style="padding: 0 30px 25px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                            Main Applicant Position
                                        </h2>
                                        
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Position:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{MAIN_POSITION}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- AUTHORIZED PERSONS SECTION -->
                    {{AUTHORIZED_PERSONS}}
                    
                    <!-- ACTION REQUIRED SECTION -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #e1f5fe; border-left: 4px solid #0369a1; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 16px; font-weight: bold;">Action Required</h3>
                                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.5;">
                                            Please review this company registration request and update the status in the dashboard.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- FOOTER SECTION -->
                    <tr>
                        <td style="padding: 20px; text-align: center; background-color: #f0f0f0; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.5;">
                                This is an automated email from Proven Accountants.
                            </p>
                            <p style="margin: 8px 0 0 0; color: #666666; font-size: 12px; line-height: 1.5;">
                                &copy; {{YEAR}} Proven Accountants. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const companyRegistrationEmail = (data: CompanyRegistrationData) => {
    let htmlTemplate = '';
    
    try {
        // First try to read from file (development environment)
        const templatePath = path.join(process.cwd(), 'src/utils/template/company-registration-email.html');
        htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        // If file reading fails, use the embedded template (production environment)
        console.log('Using embedded HTML template for company registration');
        htmlTemplate = htmlTemplateString;
    }
    
    // Format main applicant position info
    let mainApplicantPositionInfo = [];
    if (data.isDirector) mainApplicantPositionInfo.push('Director');
    if (data.isShareholder) mainApplicantPositionInfo.push(`Shareholder (${data.shareholderPercentage}%)`);
    
    // Format authorized persons HTML
    let authorizedPersonsHtml = '';
    
    if (data.authorizedPersons && data.authorizedPersons.length > 0) {
        data.authorizedPersons.forEach((person, index) => {
            let positionInfo = [];
            if (person.isDirector) positionInfo.push('Director');
            if (person.isShareholder) positionInfo.push(`Shareholder (${person.shareholderPercentage}%)`);
            
            authorizedPersonsHtml += `
            <tr>
                <td style="padding: 0 30px 25px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 5px;">
                        <tr>
                            <td style="padding: 15px;">
                                <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                    Authorized Person ${index + 1}: ${person.fullName || 'N/A'}
                                </h2>
                                
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Email:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${person.email || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Date of Birth:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${person.dateOfBirth || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Phone:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${person.phone || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Address:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${person.address || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Postal Code:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${person.postalCode || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Tax File Number:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${person.taxFileNumber || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Position:</td>
                                        <td style="padding: 5px 0; color: #333333; font-size: 14px;">${positionInfo.length > 0 ? positionInfo.join(', ') : 'N/A'}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>`;
        });
    } else {
        authorizedPersonsHtml = `
        <tr>
            <td style="padding: 0 30px 25px 30px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 5px;">
                    <tr>
                        <td style="padding: 15px;">
                            <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                Authorized Persons
                            </h2>
                            <p style="color: #666666; font-style: italic;">No authorized persons added</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>`;
    }
    
    // Replace placeholders with actual data
    htmlTemplate = htmlTemplate
        .replace('{{DATE}}', new Date().toLocaleDateString('en-AU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        }))
        .replace('{{STATUS}}', data.status ? data.status.toUpperCase() : 'PENDING')
        .replace('{{NAME}}', data.userName || 'Not provided')
        .replace('{{EMAIL}}', data.userEmail || 'Not provided')
        .replace('{{USER_ID}}', data.userId)
        .replace('{{COMPANY_NAME}}', data.companyName || 'Not provided')
        .replace('{{COMPANY_TYPE}}', data.companyType || 'Not provided')
        .replace('{{ADDRESS}}', data.address || 'Not provided')
        .replace('{{POSTAL_CODE}}', data.postalCode || 'Not provided')
        .replace('{{TAX_FILE_NUMBER}}', data.taxFileNumber || 'Not provided')
        .replace('{{MAIN_POSITION}}', mainApplicantPositionInfo.length > 0 ? mainApplicantPositionInfo.join(', ') : 'No positions selected')
        .replace('{{AUTHORIZED_PERSONS}}', authorizedPersonsHtml)
        .replace('{{YEAR}}', new Date().getFullYear().toString());
    
    return htmlTemplate;
};

export default companyRegistrationEmail;