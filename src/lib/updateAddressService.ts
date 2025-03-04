import {
    checkExistingRegistration,
    getRegistrationById,
    getUserRegistrations,
    submitRegistration,
    updateRegistrationStatus
} from './registrationService';

export interface UpdateAddressData {
    oldAddress: string;
    newAddress: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
    createdAt?: number;
    updatedAt?: number;
}

const COLLECTION_NAME = 'updateAddresses';

/**
 * Submit a new Update Address request.
 */
export const submitUpdateAddress = async (data: Omit<UpdateAddressData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    if (!data.userId) throw new Error('User ID is required for submitting Update Address request');
    return submitRegistration<any>(COLLECTION_NAME, data);
};

/**
 * Check if the user has an existing Update Address request.
 */
export const checkExistingUpdateAddress = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to check Update Address request');
    return checkExistingRegistration<any>(COLLECTION_NAME, userId);
};

/**
 * Get a specific Update Address request by ID.
 */
export const getUpdateAddressById = async (id: string) => {
    if (!id) throw new Error('ID is required to fetch Update Address data');
    return getRegistrationById<any>(COLLECTION_NAME, id);
};

/**
 * Update the status of an existing Update Address request.
 */
export const updateUpdateAddressStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed' | 'rejected'
) => {
    if (!id) throw new Error('ID is required to update Update Address status');
    return updateRegistrationStatus(COLLECTION_NAME, id, status);
};

/**
 * Get all Update Address requests for a specific user.
 */
export const getUserUpdateAddresses = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to fetch user Update Addresses');
    return getUserRegistrations<any>(COLLECTION_NAME, userId);
};
