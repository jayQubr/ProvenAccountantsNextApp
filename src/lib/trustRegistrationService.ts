import { 
    submitRegistration, 
    checkExistingRegistration, 
    getRegistrationById, 
    updateRegistrationStatus, 
    getUserRegistrations,
    BaseRegistrationData,
    RegistrationStatus
} from './registrationService';

export type TrustRegistrationStatus = RegistrationStatus;

export interface TrustAuthorizedPerson {
    fullName: string;
    email: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    postalCode: string;
    taxFileNumber: string;
    position: string;
}

export interface TrustRegistrationData extends BaseRegistrationData {
    address: string;
    postalCode: string;
    taxFileNumber: string;
    authorizedPersons: TrustAuthorizedPerson[];
    agreeToDeclaration: boolean;
    position: string;
    trustName: string;
    trustType: string;
}

const COLLECTION_NAME = 'trustRegistrations';

// Create or update Trust registration request
export const submitTrustRegistration = async (data: Omit<TrustRegistrationData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    return submitRegistration<TrustRegistrationData>(COLLECTION_NAME, data);
};

// Check if user already has a Trust registration request
export const checkExistingTrustRegistration = async (userId: string) => {
    return checkExistingRegistration<TrustRegistrationData>(COLLECTION_NAME, userId);
};

// Get Trust registration by ID
export const getTrustRegistrationById = async (registrationId: string) => {
    return getRegistrationById<TrustRegistrationData>(COLLECTION_NAME, registrationId);
};

// Update Trust registration status
export const updateTrustRegistrationStatus = async (
    registrationId: string, 
    status: TrustRegistrationStatus,
    notes?: string
) => {
    return updateRegistrationStatus(COLLECTION_NAME, registrationId, status, notes);
};

// Get all Trust registrations for a user
export const getUserTrustRegistrations = async (userId: string) => {
    return getUserRegistrations<TrustRegistrationData>(COLLECTION_NAME, userId);
};