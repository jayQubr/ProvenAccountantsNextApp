import { NextApiResponse, NextApiRequest } from "next";
import { submitPaymentPlan } from "@/lib/paymentPlanService";
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
        const { paymentPlanData } = req.body;

        if (!paymentPlanData || !paymentPlanData.userId) {
            return res.status(400).json({ success: false, message: 'Missing payment plan data or user ID' });
        }

        const dataToStore = {
            planType: paymentPlanData.planType,
            amount: paymentPlanData.amount,
            details: paymentPlanData.details,
            userId: paymentPlanData.userId,
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitPaymentPlan(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit payment plan request' });
        }

        // Send email with the necessary information
        await sendServiceRequestEmails({
            ...paymentPlanData,
            serviceType: 'Payment Plan'
        });

        return res.status(200).json({ success: true, message: 'Payment plan request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in payment-plan API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;