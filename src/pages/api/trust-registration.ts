import { NextApiResponse, NextApiRequest } from "next";
import { submitTrustRegistration } from "@/lib/trustRegistrationService";
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
        const { trustRegistrationData } = req.body;

        if (!trustRegistrationData || !trustRegistrationData.userId) {
            return res.status(400).json({ success: false, message: 'Missing trust registration data or user ID' });
        }

        // Prepare data for storage
        const dataToStore = {
            trustName: trustRegistrationData.trustName,
            trustType: trustRegistrationData.trustType,
            address: trustRegistrationData.address,
            postalCode: trustRegistrationData.postalCode,
            taxFileNumber: trustRegistrationData.taxFileNumber,
            position: trustRegistrationData.position,
            authorizedPersons: trustRegistrationData.authorizedPersons || [],
            agreeToDeclaration: trustRegistrationData.agreeToDeclaration,
            userId: trustRegistrationData.userId,
            status: trustRegistrationData.status || 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitTrustRegistration(dataToStore as any);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit trust registration request' });
        }

        // Format details for email
        const authorizedPersonsDetails = trustRegistrationData.authorizedPersons && trustRegistrationData.authorizedPersons.length > 0
            ? trustRegistrationData.authorizedPersons.map((person: any, index: number) => 
                `Person ${index + 1}: ${person.fullName || 'N/A'}, Position: ${person.position || 'N/A'}, Email: ${person.email || 'N/A'}`
              ).join('\n')
            : 'No authorized persons added';

        const details = `
Trust Name: ${trustRegistrationData.trustName}
Trust Type: ${trustRegistrationData.trustType}
Address: ${trustRegistrationData.address}
Postal Code: ${trustRegistrationData.postalCode}
Tax File Number: ${trustRegistrationData.taxFileNumber}
Position: ${trustRegistrationData.position}

Authorized Persons:
${authorizedPersonsDetails}
        `;

        // Send email with the necessary information
        try {
            await sendServiceRequestEmails({
                ...trustRegistrationData,
                details: details,
                serviceType: 'Trust Registration'
            });
            console.log('Email sent successfully for Trust Registration service');
        } catch (emailError) {
            console.error('Failed to send email for Trust Registration:', emailError);
            // Don't fail the request if email sending fails
        }

        return res.status(200).json({ success: true, message: 'Trust registration request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in trust-registration API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;