import { NextApiResponse, NextApiRequest } from "next";
import { submitTaxReturn } from "@/lib/taxReturnCopyService";
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
        const { taxReturnData } = req.body;

        if (!taxReturnData || !taxReturnData.userId) {
            return res.status(400).json({ success: false, message: 'Missing tax return data or user ID' });
        }

        // Extract only the necessary data for storage
        const dataToStore = {
            year: taxReturnData.year,
            details: taxReturnData.details,
            userId: taxReturnData.userId,
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitTaxReturn(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit tax return copy request' });
        }

        // Send email notification using the reusable service
        await sendServiceRequestEmails({
            ...taxReturnData,
            serviceType: 'Tax Return Copy'
        });

        return res.status(200).json({ success: true, message: 'Tax return copy request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in tax-return-copy API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler; 