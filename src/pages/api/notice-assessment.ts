import { NextApiResponse, NextApiRequest } from "next";
import { submitNoticeAssessment } from "@/lib/noticeAssesmentService";
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
        const { assessmentData } = req.body;

        if (!assessmentData || !assessmentData.userId) {
            return res.status(400).json({ success: false, message: 'Missing assessment data or user ID' });
        }

        // Extract only the necessary data for storage
        const dataToStore = {
            year: assessmentData.year,
            details: assessmentData.details,
            agreeToDeclaration: assessmentData.agreeToDeclaration,
            userId: assessmentData.userId,
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitNoticeAssessment(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit notice assessment' });
        }

        // Send email notification using the reusable service
        await sendServiceRequestEmails({
            ...assessmentData,
            serviceType: 'Notice of Assessment'
        });

        return res.status(200).json({ success: true, message: 'Notice assessment submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in notice-assessment API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;