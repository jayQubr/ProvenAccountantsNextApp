import { NextApiResponse, NextApiRequest } from "next";
import { submitBASLodgement } from "@/lib/basLodgementCopy";
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
        const { basLodgementData } = req.body;

        if (!basLodgementData || !basLodgementData.userId) {
            return res.status(400).json({ success: false, message: 'Missing BAS lodgement data or user ID' });
        }

        // Prepare data for storage - only store essential information
        const dataToStore = {
            quarter: basLodgementData.quarter,
            details: basLodgementData.details,
            agreeToDeclaration: basLodgementData.agreeToDeclaration,
            userId: basLodgementData.userId,
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitBASLodgement(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit BAS lodgement copy request' });
        }

        // Send email with the necessary information
        await sendServiceRequestEmails({
            ...basLodgementData,
            serviceType: 'BAS Lodgement Copy'
        });

        return res.status(200).json({ success: true, message: 'BAS lodgement copy request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in bas-lodgement-copy API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;