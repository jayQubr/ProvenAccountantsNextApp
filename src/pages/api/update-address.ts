import { NextApiResponse, NextApiRequest } from "next";
import { submitUpdateAddress } from "@/lib/updateAddressService";
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
        const { updateAddressData } = req.body;

        if (!updateAddressData || !updateAddressData.userId) {
            return res.status(400).json({ success: false, message: 'Missing address update data or user ID' });
        }

        // Prepare data for storage - only store essential information
        const dataToStore = {
            oldAddress: updateAddressData.oldAddress,
            newAddress: updateAddressData.newAddress,
            userId: updateAddressData.userId,
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitUpdateAddress(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit address update request' });
        }

        // Send email with the necessary information
        try {
            await sendServiceRequestEmails({
                ...updateAddressData,
                serviceType: 'Update Address'
            });
            console.log('Email sent successfully for Update Address service');
        } catch (emailError) {
            console.error('Failed to send email for Update Address:', emailError);
            // Don't fail the request if email sending fails
        }

        return res.status(200).json({ success: true, message: 'Address update request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in update-address API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;