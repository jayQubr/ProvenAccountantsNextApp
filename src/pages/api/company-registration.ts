import { NextApiResponse, NextApiRequest } from "next";
import { submitCompanyRegistration } from "@/lib/companyRegistratinoService";
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
        const { companyRegistrationData } = req.body;

        if (!companyRegistrationData || !companyRegistrationData.userId) {
            return res.status(400).json({ success: false, message: 'Missing company registration data or user ID' });
        }

        // Prepare data for storage
        const dataToStore = {
            companyName: companyRegistrationData.companyName,
            companyType: companyRegistrationData.companyType,
            address: companyRegistrationData.address,
            postalCode: companyRegistrationData.postalCode,
            taxFileNumber: companyRegistrationData.taxFileNumber,
            authorizedPersons: companyRegistrationData.authorizedPersons || [],
            agreeToDeclaration: companyRegistrationData.agreeToDeclaration,
            userId: companyRegistrationData.userId,
            userName: companyRegistrationData.userName,
            userEmail: companyRegistrationData.userEmail,
            status: companyRegistrationData.status || 'pending',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitCompanyRegistration(dataToStore as any);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit company registration request' });
        }

        // Format details for email
        const authorizedPersonsDetails = companyRegistrationData.authorizedPersons && companyRegistrationData.authorizedPersons.length > 0
            ? companyRegistrationData.authorizedPersons.map((person: any, index: number) => 
                `Person ${index + 1}: ${person.fullName || 'N/A'}, Position: ${person.position || 'N/A'}, Email: ${person.email || 'N/A'}`
              ).join('\n')
            : 'No authorized persons added';

        const details = `
Company Name: ${companyRegistrationData.companyName}
Company Type: ${companyRegistrationData.companyType}
Address: ${companyRegistrationData.address}
Postal Code: ${companyRegistrationData.postalCode}
Tax File Number: ${companyRegistrationData.taxFileNumber}

Authorized Persons:
${authorizedPersonsDetails}
        `;

        // Send email with the necessary information
        try {
            await sendServiceRequestEmails({
                userId: companyRegistrationData.userId,
                userEmail: companyRegistrationData.userEmail,
                userName: companyRegistrationData.userName,
                details: details,
                serviceType: 'Company Registration' as any
            });
            console.log('Email sent successfully for Company Registration service');
        } catch (emailError) {
            console.error('Failed to send email for Company Registration:', emailError);
            // Don't fail the request if email sending fails
        }

        return res.status(200).json({ success: true, message: 'Company registration request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in company-registration API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;