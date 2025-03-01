const newClientRegistration = (userData: any, files: any, accountantLocation: string) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Client Registration</title>
      <style>
        @media only screen and (max-width: 620px) {
          table.body h1 {
            font-size: 24px !important;
            margin-bottom: 12px !important;
          }
          table.body .wrapper {
            padding: 10px !important;
          }
          table.body .content {
            padding: 0 !important;
          }
          table.body .container {
            padding: 0 !important;
            width: 100% !important;
          }
          table.body .main {
            border-radius: 0 !important;
            border-left-width: 0 !important;
            border-right-width: 0 !important;
          }
          .header {
            padding: 15px !important;
          }
          .footer {
            padding: 15px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; width: 100%; background-color: #f8fafc;">
        <tr>
          <td style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
          <td class="container" style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top; max-width: 600px; padding: 20px; margin: 0 auto !important;">
            <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 600px; padding: 20px;">
              <!-- HEADER -->
              <table role="presentation" class="main header" style="border-collapse: separate; width: 100%; background-color: #0ea5e9; border-radius: 8px 8px 0 0; margin-bottom: 0;">
                <tr>
                  <td class="wrapper" style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 25px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                      <tr>
                        <td style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top;">
                          <h1 style="color: #ffffff; font-family: Arial, sans-serif; font-weight: 700; margin: 0; margin-bottom: 15px; font-size: 28px; line-height: 1.2;">New Client Registration</h1>
                          <p style="font-family: Arial, sans-serif; font-size: 16px; font-weight: normal; margin: 0; margin-bottom: 15px; color: #ffffff;">A new client has registered with Proven Accountants.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- MAIN CONTENT -->
              <table role="presentation" class="main" style="border-collapse: separate; width: 100%; background: #ffffff; border-radius: 0 0 8px 8px; margin-top: 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <tr>
                  <td class="wrapper" style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 25px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                      <tr>
                        <td style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top;">
                          <h2 style="color: #0ea5e9; font-family: Arial, sans-serif; font-weight: 600; margin: 0; margin-bottom: 20px; font-size: 20px; line-height: 1.2; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Personal Information</h2>
                          
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%; margin-bottom: 20px;">
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Full Name:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.firstName} ${userData.lastName}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Email:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.email}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Phone Number:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.mobileNumber}</td>
                            </tr>
                            ${userData.dateOfBirth ? `
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Date of Birth:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">
                              ${ (() => {
                                const dob = new Date(userData.dateOfBirth);
                                return !isNaN(dob.getTime()) ? dob.toLocaleDateString('en-AU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                }) : userData.dateOfBirth;
                              })()}
                            </td>
                            </tr>` : ''}
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Address:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.postalAddress}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Postal Code:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.postalCode}</td>
                            </tr>
                          </table>

                          <h2 style="color: #0ea5e9; font-family: Arial, sans-serif; font-weight: 600; margin: 0; margin-bottom: 20px; font-size: 20px; line-height: 1.2; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Tax Information</h2>
                          
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%; margin-bottom: 20px;">
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Tax File Number:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.taxFileNumber}</td>
                            </tr>
                            ${userData.ABN ? `
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">ABN:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.ABN}</td>
                            </tr>` : ''}
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Preferred Location:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${accountantLocation}</td>
                            </tr>
                          </table>

                          ${userData.otherDetails ? `
                          <h2 style="color: #0ea5e9; font-family: Arial, sans-serif; font-weight: 600; margin: 0; margin-bottom: 20px; font-size: 20px; line-height: 1.2; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Additional Information</h2>
                          
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%; margin-bottom: 20px;">
                            <tr>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">${userData.otherDetails}</td>
                            </tr>
                          </table>` : ''}

                          <h2 style="color: #0ea5e9; font-family: Arial, sans-serif; font-weight: 600; margin: 0; margin-bottom: 20px; font-size: 20px; line-height: 1.2; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Documents</h2>
                          
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%; margin-bottom: 20px;">
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">ID Documents:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">
                                ${files.idDocuments ? (Array.isArray(files.idDocuments) ?
                        `${files.idDocuments.length} file(s) attached` :
                        '1 file attached') : 'No files attached'}
                              </td>
                            </tr>
                            <tr>
                              <td width="40%" style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #64748b; font-weight: 500;">Other Documents:</td>
                              <td style="font-family: Arial, sans-serif; font-size: 15px; vertical-align: top; padding: 5px 0; color: #334155;">
                                ${files.otherDocuments ? (Array.isArray(files.otherDocuments) ?
                        `${files.otherDocuments.length} file(s) attached` :
                        '1 file attached') : 'No files attached'}
                              </td>
                            </tr>
                          </table>

                          <div style="background-color: #f1f5f9; border-radius: 6px; padding: 15px; margin-top: 20px;">
                            <p style="font-family: Arial, sans-serif; font-size: 15px; font-weight: normal; margin: 0; color: #334155;">
                              <strong>Declaration:</strong> Client has ${userData.declaration ? 'agreed' : 'not agreed'} to authorize Proven Associated Server Pty Ltd & Mr Aman Nagma T/A Proven Accountants to act as their tax agent and represent them in all dealings with the Australian Taxation Office.
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- FOOTER -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%; margin-top: 20px;">
                <tr>
                  <td class="content-block" style="font-family: Arial, sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #64748b; font-size: 13px; text-align: center;">
                    <p style="margin-bottom: 5px; margin-top: 0;">© 2023 Proven Accountants. All rights reserved.</p>
                    <p style="margin-bottom: 0; margin-top: 0;">This email contains confidential information. If you are not the intended recipient, please notify the sender immediately.</p>
                  </td>
                </tr>
              </table>
            </div>
          </td>
          <td style="font-family: Arial, sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
        </tr>
      </table>
    </body>
    </html>
    `;

    return htmlTemplate;
}

export default newClientRegistration