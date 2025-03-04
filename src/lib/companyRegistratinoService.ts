import { 
    submitRegistration, 
    checkExistingRegistration, 
    getRegistrationById, 
    updateRegistrationStatus, 
    getUserRegistrations,
    BaseRegistrationData,
    RegistrationStatus
} from './registrationService';

export type CompanyRegistrationStatus = RegistrationStatus;

export interface AuthorizedPerson {
    fullName: string;
    email: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    postalCode: string;
    taxFileNumber: string;
    position: string;
}

export interface CompanyRegistrationData extends BaseRegistrationData {
    address: string;
    postalCode: string;
    taxFileNumber: string;
    authorizedPersons: AuthorizedPerson[];
    agreeToDeclaration: boolean;
    position: string;
}

const COLLECTION_NAME = 'companyRegistrations';

// Create or update Company registration request
export const submitCompanyRegistration = async (data: Omit<CompanyRegistrationData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    return submitRegistration<CompanyRegistrationData>(COLLECTION_NAME, data);
};

// Check if user already has a Company registration request
export const checkExistingCompanyRegistration = async (userId: string) => {
    return checkExistingRegistration<CompanyRegistrationData>(COLLECTION_NAME, userId);
};

// Get Company registration by ID
export const getCompanyRegistrationById = async (registrationId: string) => {
    return getRegistrationById<CompanyRegistrationData>(COLLECTION_NAME, registrationId);
};

// Update Company registration status
export const updateCompanyRegistrationStatus = async (
    registrationId: string, 
    status: CompanyRegistrationStatus,
    notes?: string
) => {
    return updateRegistrationStatus(COLLECTION_NAME, registrationId, status, notes);
};

// Get all Company registrations for a user
export const getUserCompanyRegistrations = async (userId: string) => {
    return getUserRegistrations<CompanyRegistrationData>(COLLECTION_NAME, userId);
};