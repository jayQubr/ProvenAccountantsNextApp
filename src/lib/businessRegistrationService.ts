import { 
    submitRegistration, 
    checkExistingRegistration, 
    getRegistrationById, 
    updateRegistrationStatus, 
    getUserRegistrations,
    BaseRegistrationData,
    RegistrationStatus
} from './registrationService';

export type BusinessRegistrationStatus = RegistrationStatus;

export interface BusinessRegistrationData extends BaseRegistrationData {
    postalAddress: string;
    postalCode: string;
    abn: string;
    businessName: string;
    businessAddress: string;
}

const COLLECTION_NAME = 'businessRegistrations';

// Create or update Business registration request
export const submitBusinessRegistration = async (data: Omit<BusinessRegistrationData, 'createdAt' | 'updatedAt'>) => {
    return submitRegistration<BusinessRegistrationData>(COLLECTION_NAME, data);
};

// Check if user already has a Business registration request
export const checkExistingBusinessRegistration = async (userId: string) => {
    return checkExistingRegistration<BusinessRegistrationData>(COLLECTION_NAME, userId);
};

// Get Business registration by ID
export const getBusinessRegistrationById = async (registrationId: string) => {
    return getRegistrationById<BusinessRegistrationData>(COLLECTION_NAME, registrationId);
};

// Update Business registration status
export const updateBusinessRegistrationStatus = async (
    registrationId: string, 
    status: BusinessRegistrationStatus,
    notes?: string
) => {
    return updateRegistrationStatus(COLLECTION_NAME, registrationId, status, notes);
};

// Get all Business registrations for a user
export const getUserBusinessRegistrations = async (userId: string) => {
    return getUserRegistrations<BusinessRegistrationData>(COLLECTION_NAME, userId);
};