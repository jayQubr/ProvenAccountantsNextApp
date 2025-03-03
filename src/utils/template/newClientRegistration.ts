const newClientRegistration = (userData: any, files: any, accountantLocation: string) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Client Registration</title>
        <style>
            /* Reset styles */
            body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            
            table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
            
            img {
                -ms-interpolation-mode: bicubic;
            }

            /* General styles */
            body {
                margin: 0;
                padding: 0;
                background-color: #f4f4f5;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .container {
                max-width: 600px !important;
                margin: 0 auto !important;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .header {
                background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                padding: 40px 30px;
                text-align: center;
            }

            .content {
                padding: 30px;
            }

            .section {
                margin-bottom: 30px;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                border: 1px solid #e2e8f0;
            }

            .section-title {
                color: #0ea5e9;
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 20px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }

            .info-row {
                margin-bottom: 12px;
            }

            .label {
                color: #64748b;
                font-weight: 500;
                font-size: 14px;
                padding-bottom: 4px;
            }

            .value {
                color: #1e293b;
                font-size: 15px;
            }

            .declaration-box {
                background-color: #f8fafc;
                border-radius: 8px;
                padding: 20px;
                margin-top: 30px;
                border: 1px solid #e2e8f0;
            }

            .footer {
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                color: #64748b;
                font-size: 12px;
                border-top: 1px solid #e2e8f0;
            }

            /* Responsive styles */
            @media only screen and (max-width: 620px) {
                .container {
                    width: 100% !important;
                    border-radius: 0;
                }
                
                .header {
                    padding: 30px 20px;
                }
                
                .content {
                    padding: 20px;
                }
                
                .section {
                    padding: 15px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://your-logo-url.com/logo.png" alt="Proven Accountants" style="max-width: 200px; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Client Registration</h1>
                <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">
                    ${new Date().toLocaleDateString('en-AU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                    })}
                </p>
            </div>

            <!-- Main Content -->
            <div class="content">
                <!-- Personal Information Section -->
                <div class="section">
                    <h2 class="section-title">Personal Information</h2>
                    <div class="info-row">
                        <div class="label">Full Name</div>
                        <div class="value">${userData.firstName} ${userData.lastName}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Email Address</div>
                        <div class="value">${userData.email}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Phone Number</div>
                        <div class="value">${userData.mobileNumber}</div>
                    </div>
                    ${userData.dateOfBirth ? `
                    <div class="info-row">
                        <div class="label">Date of Birth</div>
                        <div class="value">
                            ${(() => {
                                const dob = new Date(userData.dateOfBirth);
                                return !isNaN(dob.getTime()) ? dob.toLocaleDateString('en-AU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : userData.dateOfBirth;
                            })()}
                        </div>
                    </div>` : ''}
                </div>

                <!-- Address Section -->
                <div class="section">
                    <h2 class="section-title">Address Details</h2>
                    <div class="info-row">
                        <div class="label">Postal Address</div>
                        <div class="value">${userData.postalAddress}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Postal Code</div>
                        <div class="value">${userData.postalCode}</div>
                    </div>
                </div>

                <!-- Business Information Section -->
                ${userData.accountType === 'organization' ? `
                <div class="section">
                    <h2 class="section-title">Business Information</h2>
                    <div class="info-row">
                        <div class="label">Company Name</div>
                        <div class="value">${userData.companyName}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">ABN</div>
                        <div class="value">${userData.ABN}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">ACN</div>
                        <div class="value">${userData.acn}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Company Email</div>
                        <div class="value">${userData.companyEmail}</div>
                    </div>
                </div>` : ''}

                <!-- Tax Information Section -->
                <div class="section">
                    <h2 class="section-title">Tax Information</h2>
                    <div class="info-row">
                        <div class="label">Tax File Number</div>
                        <div class="value">${userData.taxFileNumber}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">Preferred Location</div>
                        <div class="value">${accountantLocation}</div>
                    </div>
                </div>

                <!-- Documents Section -->
                <div class="section">
                    <h2 class="section-title">Attached Documents</h2>
                    <div class="info-row">
                        <div class="label">ID Documents</div>
                        <div class="value">
                            ${files.idDocuments ? (Array.isArray(files.idDocuments) ?
                                `${files.idDocuments.length} file(s) attached` :
                                '1 file attached') : 'No files attached'}
                        </div>
                    </div>
                    <div class="info-row">
                        <div class="label">Other Documents</div>
                        <div class="value">
                            ${files.otherDocuments ? (Array.isArray(files.otherDocuments) ?
                                `${files.otherDocuments.length} file(s) attached` :
                                '1 file attached') : 'No files attached'}
                        </div>
                    </div>
                </div>

                <!-- Declaration Box -->
                <div class="declaration-box">
                    <h3 style="margin: 0 0 10px 0; color: #0ea5e9; font-size: 16px;">Declaration</h3>
                    <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">
                        Client has ${userData.declaration ? 
                            '<span style="color: #059669; font-weight: 500;">agreed</span>' : 
                            '<span style="color: #dc2626; font-weight: 500;">not agreed</span>'} 
                        to authorize Proven Associated Server Pty Ltd & Mr Aman Nagma T/A Proven Accountants 
                        to act as their tax agent and represent them in all dealings with the Australian Taxation Office.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} Proven Accountants. All rights reserved.</p>
                <p style="margin: 0;">This email contains confidential information and is intended only for the recipient.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return htmlTemplate;
}

export default newClientRegistration;