import { NextApiResponse, NextApiRequest } from "next";
import { submitATOPortal } from "@/lib/atoPortalService";
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
        const { atoPortalData } = req.body;

        if (!atoPortalData || !atoPortalData.userId) {
            return res.status(400).json({ success: false, message: 'Missing ATO portal data or user ID' });
        }

        // Prepare data for storage - only store essential information
        const dataToStore = {
            period: atoPortalData.period,
            details: atoPortalData.details,
            userId: atoPortalData.userId,
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitATOPortal(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit ATO portal copy request' });
        }

        // Send email with the necessary information
        await sendServiceRequestEmails({
            ...atoPortalData,
            serviceType: 'ATO Portal Copy'
        });

        return res.status(200).json({ success: true, message: 'ATO portal copy request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in ato-portal-copy API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;