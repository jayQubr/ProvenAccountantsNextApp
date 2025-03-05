import { submitATORegistration } from "@/lib/atoRegistrationService";
import { NextApiResponse, NextApiRequest } from "next";
import nodemailer from 'nodemailer';
import atoRegistrationEmail from "../../utils/template/atoRegistrationEmail";
import { sendServiceRequestEmails } from "@/utils/emailService";

export const config = {
    api: {
        bodyParser: true,
    },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    try {
        const { registrationData } = req.body;

        if (!registrationData || !registrationData.userId) {
            return res.status(400).json({ success: false, message: 'Missing registration data or user ID' });
        }

        // Submit registration to Firestore
        const result = await submitATORegistration(registrationData);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit registration' });
        }

        // Create email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NEXT_PUBLIC_EMAIL_USER,
                pass: process.env.NEXT_PUBLIC_EMAIL_PASS
            }
        });

        // Get HTML content for email
        const htmlContent = atoRegistrationEmail(registrationData);

        // Configure email options
        const mailOptions = {
            from: process.env.NEXT_PUBLIC_EMAIL_USER,
            replyTo: registrationData.userEmail || 'no-reply@example.com',
            to: process.env.NEXT_PUBLIC_EMAIL_USER,
            subject: `New ATO Registration Request: ${registrationData.userName || 'Client'}`,
            text: `New ATO registration request from ${registrationData.userName || 'Client'}. Please check the details.`,
            html: htmlContent
        };

        // Send email using the email service
        try {
            // Prepare data for email service
            const serviceRequestData = {
                userId: registrationData.userId,
                userEmail: registrationData.userEmail,
                userName: registrationData.userName,
                serviceType: 'ATO Registration' as any,
                status: registrationData.status,
                // Include all ATO registration details with the new structure
                postalAddress: registrationData.postalAddress,
                postalCode: registrationData.postalCode,
                abn: registrationData.abn,
                gst: registrationData.gst,
                fuelTaxCredit: registrationData.fuelTaxCredit
            };

            // Use the email service if available, otherwise fall back to direct email
            if (typeof sendServiceRequestEmails === 'function') {
                await sendServiceRequestEmails(serviceRequestData);
            } else {
                // Fall back to direct email
                await transporter.sendMail(mailOptions);
            }
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Continue with the registration process even if email fails
            // Just log the error but don't return an error response
        }

        // Return success response
        return res.status(200).json({ 
            success: true, 
            message: 'Registration submitted successfully and notification email sent',
            id: result.id
        });
    } catch (error) {
        console.error('Error processing registration:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while processing your request' 
        });
    }
};

export default handler;