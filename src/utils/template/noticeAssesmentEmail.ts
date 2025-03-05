import fs from 'fs';
import path from 'path';

interface ServiceRequestData {
    userId: string;
    userEmail?: string;
    userName?: string;
    year: string;
    details: string;
    status: string;
    user?: any;
    serviceType?: 'Notice of Assessment' | 'Tax Return Copy';
}

// HTML template as a string (for production where file access might be limited)
const htmlTemplateString = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{SERVICE_TYPE}} Request</title>
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
        New {{SERVICE_TYPE}} Request - Please review the details
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
                                        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: bold;">{{SERVICE_TYPE}} Request</h1>
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
                                            A new {{SERVICE_TYPE}} request has been submitted. Please review the details below:
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
                        <tr>
                            <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Phone:</td>
                            <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{PHONE}}</td>
                        </tr>
                        <tr>
                            <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Address:</td>
                            <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{ADDRESS}}</td>
                        </tr>
                        <tr>
                            <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Submission Date:</td>
                            <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{SUBMISSION_DATE}}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </td>
</tr>
                    
                    <!-- REQUEST DETAILS SECTION -->
                    <tr>
                        <td style="padding: 0 30px 25px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                                            {{SERVICE_TYPE}} Details
                                        </h2>
                                        
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="120" style="padding: 5px 0; color: #666666; font-size: 14px; font-weight: bold;">Year:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{YEAR}}</td>
                                            </tr>
                                            <tr>
                                                <td width="120" style="padding: 5px 0 0 0; vertical-align: top; color: #666666; font-size: 14px; font-weight: bold;">Details:</td>
                                                <td style="padding: 5px 0; color: #333333; font-size: 14px;">{{DETAILS}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- ACTION REQUIRED SECTION -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #e1f5fe; border-left: 4px solid #0369a1; border-radius: 5px;">
                                <tr>
                                    <td style="padding: 15px;">
                                        <h3 style="margin: 0 0 10px 0; color: #0369a1; font-size: 16px; font-weight: bold;">Action Required</h3>
                                        <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.5;">
                                            Please review this {{SERVICE_TYPE}} request and update the status in the dashboard.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- BUTTON SECTION -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;margin: 0 auto;display: flex;justify-content: center;">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="border-radius: 4px;" bgcolor="#0369a1">
                                        <a href="https://admin.provenaccountants.com.au" target="_blank" style="font-size: 16px; font-family: Arial, Helvetica, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; border: 1px solid #0369a1; display: inline-block; font-weight: bold;">Review in Dashboard</a>
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

const serviceRequestEmail = (data: ServiceRequestData) => {
    // Set default service type if not provided
    const serviceType = data.serviceType || 'Notice of Assessment';
    
    let htmlTemplate = '';
    
    try {
        // First try to read from file (development environment)
        const templatePath = path.join(process.cwd(), 'src/utils/template/service-request-email.html');
        htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
        // If file reading fails, use the embedded template (production environment)
        console.log('Using embedded HTML template');
        htmlTemplate = htmlTemplateString;
    }
    
    htmlTemplate = htmlTemplate
    .replace(/\{\{SERVICE_TYPE\}\}/g, serviceType)
    .replace('{{DATE}}', new Date().toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
    }))
    .replace('{{STATUS}}', data.status || 'Pending')
    .replace('{{NAME}}', data.userName || 'Not provided')
    .replace('{{EMAIL}}', data.userEmail || 'Not provided')
    .replace('{{USER_ID}}', data.userId)
    .replace('{{YEAR}}', data.year)
    .replace('{{DETAILS}}', data.details.replace(/\n/g, '<br>'))
    .replace('{{PHONE}}', data.user?.phone || 'Not provided')
    .replace('{{ADDRESS}}', data.user?.address || 'Not provided')
    .replace('{{SUBMISSION_DATE}}', new Date().toLocaleDateString('en-AU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }))
    .replace('{{YEAR}}', new Date().getFullYear().toString());

return htmlTemplate;
};

// For backward compatibility
const noticeAssessmentEmail = (data: ServiceRequestData) => {
    return serviceRequestEmail({
        ...data,
        serviceType: 'Notice of Assessment'
    });
};

// Export both functions
export { serviceRequestEmail };
export default noticeAssessmentEmail;