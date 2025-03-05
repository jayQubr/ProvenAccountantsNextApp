import {
    checkExistingRegistration,
    getRegistrationById,
    getUserRegistrations,
    submitRegistration,
    updateRegistrationStatus
} from './registrationService';

export interface BASLodgementData {
    quarter: string;
    details: string;
    userId?: string;
    userName?: string;
    status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
    createdAt?: number;
    updatedAt?: number;
}

const COLLECTION_NAME = 'basLodgementCopies';

/**
 * Submit a new BAS Lodgement Copy registration.
 */
export const submitBASLodgement = async (data: Omit<BASLodgementData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    if (!data.userId) throw new Error('User ID is required for submitting BAS lodgement');
    return submitRegistration<any>(COLLECTION_NAME, data);
};

/**
 * Check if the user has an existing BAS Lodgement Copy registration.
 */
export const checkExistingBASLodgement = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to check BAS lodgement');
    return checkExistingRegistration<any>(COLLECTION_NAME, userId);
};

/**
 * Get a specific BAS Lodgement Copy registration by ID.
 */
export const getBASLodgementById = async (id: string) => {
    if (!id) throw new Error('ID is required to fetch BAS lodgement data');
    return getRegistrationById<any>(COLLECTION_NAME, id);
};

/**
 * Update the status of an existing BAS Lodgement Copy registration.
 */
export const updateBASLodgementStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed' | 'rejected'
) => {
    if (!id) throw new Error('ID is required to update BAS lodgement status');
    return updateRegistrationStatus(COLLECTION_NAME, id, status);
};

/**
 * Get all BAS Lodgement Copy registrations for a specific user.
 */
export const getUserBASLodgements = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to fetch user BAS lodgements');
    return getUserRegistrations<any>(COLLECTION_NAME, userId);
};
