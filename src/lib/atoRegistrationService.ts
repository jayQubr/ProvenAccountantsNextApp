import {
    BaseRegistrationData,
    RegistrationStatus,
    submitRegistration,
    checkExistingRegistration,
    getRegistrationById,
    updateRegistrationStatus,
    getUserRegistrations
} from './registrationService';

export type ATORegistrationStatus = RegistrationStatus;

export interface ATORegistrationData extends BaseRegistrationData {
    postalAddress: string;
    postalCode: string;
    abn: {
        selected: boolean;
        businessActivity?: string;
        registrationDate?: string;
        businessAddress?: string;
    };
    gst: {
        selected: boolean;
        annualIncome?: string;
        registrationDate?: string;
        accountingMethod?: string;
    };
    fuelTaxCredit: {
        selected: boolean;
        hasTrucks?: boolean;
        hasMachinery?: boolean;
        hasAgriculture?: boolean;
    };
}

// Collection name for ATO registrations
const COLLECTION_NAME = 'atoRegistrations';

// Create or update ATO registration request
export const submitATORegistration = async (data: Omit<ATORegistrationData, 'createdAt' | 'updatedAt'>) => {
    return submitRegistration<ATORegistrationData>(COLLECTION_NAME, data);
};

// Check if user already has an ATO registration request
export const checkExistingATORegistration = async (userId: string) => {
    return checkExistingRegistration<ATORegistrationData>(COLLECTION_NAME, userId);
};

// Get ATO registration by ID
export const getATORegistrationById = async (registrationId: string) => {
    return getRegistrationById<ATORegistrationData>(COLLECTION_NAME, registrationId);
};

// Update ATO registration status
export const updateATORegistrationStatus = async (
    registrationId: string, 
    status: ATORegistrationStatus,
    notes?: string
) => {
    return updateRegistrationStatus(COLLECTION_NAME, registrationId, status, notes);
};

// Get all ATO registrations for a user
export const getUserATORegistrations = async (userId: string) => {
    return getUserRegistrations<ATORegistrationData>(COLLECTION_NAME, userId);
}; 