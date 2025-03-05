import { NextApiResponse, NextApiRequest } from "next";
import nodemailer from 'nodemailer';
import { serviceRequestEmail } from "@/utils/template/noticeAssesmentEmail";
import { submitTaxReturn } from "@/lib/taxReturnCopyService";

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
        const { taxReturnData } = req.body;

        if (!taxReturnData || !taxReturnData.userId) {
            return res.status(400).json({ success: false, message: 'Missing tax return data or user ID' });
        }

        // Submit to database
        const result = await submitTaxReturn(taxReturnData);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit tax return copy request' });
        }

        // Send email notification
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                secure: true,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });

            // Use the reusable email template with Tax Return Copy service type
            const emailHtml = serviceRequestEmail({
                ...taxReturnData,
                serviceType: 'Tax Return Copy'
            });

            await transporter.sendMail({
                from: `"Proven Accountant" <${process.env.EMAIL_FROM}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `New Tax Return Copy Request - ${taxReturnData.userName || 'User'}`,
                html: emailHtml,
            });

            // Also send confirmation to user if email is available
            if (taxReturnData.userEmail) {
                await transporter.sendMail({
                    from: `"Proven Accountant" <${process.env.EMAIL_FROM}>`,
                    to: taxReturnData.userEmail,
                    subject: 'Your Tax Return Copy Request Confirmation',
                    html: emailHtml,
                });
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with success response even if email fails
        }

        return res.status(200).json({ success: true, message: 'Tax return copy request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in tax-return-copy API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler; 