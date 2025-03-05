import { NextApiResponse, NextApiRequest } from "next";
import nodemailer from 'nodemailer';
import noticeAssessmentEmail from "@/utils/template/noticeAssesmentEmail";
import { submitNoticeAssessment } from "@/lib/noticeAssesmentService";

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
        const { assessmentData } = req.body;

        if (!assessmentData || !assessmentData.userId) {
            return res.status(400).json({ success: false, message: 'Missing assessment data or user ID' });
        }

        // Submit assessment to Firestore
        const result = await submitNoticeAssessment(assessmentData);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit assessment' });
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
        const htmlContent = noticeAssessmentEmail(assessmentData);

        // Configure email options
        const mailOptions = {
            from: process.env.NEXT_PUBLIC_EMAIL_USER,
            replyTo: assessmentData.userEmail || 'no-reply@example.com',
            to: process.env.NEXT_PUBLIC_EMAIL_USER,
            subject: `New Notice of Assessment Request: ${assessmentData.userName || 'Client'}`,
            text: `New notice of assessment request from ${assessmentData.userName || 'Client'} for year ${assessmentData.year}. Please check the details.`,
            html: htmlContent
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Return success response
        return res.status(200).json({ 
            success: true, 
            message: 'Assessment submitted successfully and notification email sent',
            id: result.id
        });
    } catch (error) {
        console.error('Error processing assessment:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while processing your request' 
        });
    }
};

export default handler;