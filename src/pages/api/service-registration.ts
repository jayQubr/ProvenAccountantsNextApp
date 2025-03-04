import { submitATORegistration } from "@/lib/atoRegistrationService";
import { NextApiResponse, NextApiRequest } from "next";
import nodemailer from 'nodemailer';
import atoRegistrationEmail from "../../utils/template/atoRegistrationEmail";

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

        // Send email
        await transporter.sendMail(mailOptions);

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