import { submitCompanyRegistration } from "@/lib/companyService";
import { sendServiceRequestEmails } from "@/utils/emailService";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
    api: {
        bodyParser: true,
    },
};

interface AuthorizedPerson {
    fullName: string;
    email: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    postalCode: string;
    taxFileNumber: string;
    position: string;
    isDirector: boolean;
    isShareholder: boolean;
    shareholderPercentage: string;
}

interface CompanyRegistrationData {
    userId: string;
    userEmail?: string;
    userName?: string;
    companyName: string;
    companyType?: string;
    companyAddress: string;
    address: string;
    postalCode: string;
    taxFileNumber: string;
    isDirector?: boolean;
    isShareholder?: boolean;
    shareholderPercentage?: string;
    authorizedPersons: AuthorizedPerson[];
    agreeToDeclaration: boolean;
    status?: string;
    createdAt?: number;
    updatedAt?: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { taxFileNumber, ...companyRegistrationData } = req.body.companyRegistrationData as CompanyRegistrationData;

        if (!companyRegistrationData || !companyRegistrationData.userId) {
            return res.status(400).json({ success: false, message: 'Missing company registration data or user ID' });
        }

        // Create a copy of authorized persons without tax file numbers
        const sanitizedAuthorizedPersons = companyRegistrationData.authorizedPersons?.map(person => {
            const { taxFileNumber, ...sanitizedPerson } = person;
            return sanitizedPerson;
        }) || [];

        // Prepare data for storage (without tax file numbers)
        const dataToStore = {
            companyName: companyRegistrationData.companyName,
            companyType: companyRegistrationData.companyType || 'Proprietary Limited Company',
            companyAddress: companyRegistrationData.companyAddress,
            address: companyRegistrationData.address,
            postalCode: companyRegistrationData.postalCode,
            authorizedPersons: sanitizedAuthorizedPersons,
            agreeToDeclaration: companyRegistrationData.agreeToDeclaration,
            userId: companyRegistrationData.userId,
            userName: companyRegistrationData.userName,
            userEmail: companyRegistrationData.userEmail,
            isDirector: companyRegistrationData.isDirector || false,
            isShareholder: companyRegistrationData.isShareholder || false,
            shareholderPercentage: companyRegistrationData.isShareholder ? companyRegistrationData.shareholderPercentage : '',
            status: 'pending' as const,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // Submit to database
        const result = await submitCompanyRegistration(dataToStore);

        if (!result.success) {
            return res.status(500).json({ success: false, message: 'Failed to submit company registration request' });
        }

        // Send email with the necessary information (including tax file numbers for email only)
        await sendServiceRequestEmails({
            ...companyRegistrationData,
            taxFileNumber,
            serviceType: 'Company Registration',
            createdAt: dataToStore.createdAt?.toString(),
            updatedAt: dataToStore.updatedAt?.toString()
        });

        return res.status(200).json({ success: true, message: 'Company registration request submitted successfully', id: result.id });
    } catch (error) {
        console.error('Error in company-registration-service API:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export default handler;
