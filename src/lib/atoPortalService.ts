import {
    checkExistingRegistration,
    getRegistrationById,
    getUserRegistrations,
    submitRegistration,
    updateRegistrationStatus
} from './registrationService';

export interface ATOPortalData {
    period: string;
    details: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
    createdAt?: number;
    updatedAt?: number;
}

const COLLECTION_NAME = 'atoPortalCopies';

/**
 * Submit a new ATO Portal Copy registration.
 */
export const submitATOPortal = async (data: Omit<ATOPortalData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    if (!data.userId) throw new Error('User ID is required for submitting ATO Portal Copy');
    return submitRegistration<any>(COLLECTION_NAME, data);
};

/**
 * Check if the user has an existing ATO Portal Copy registration.
 */
export const checkExistingATOPortal = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to check ATO Portal Copy');
    return checkExistingRegistration<any>(COLLECTION_NAME, userId);
};

/**
 * Get a specific ATO Portal Copy registration by ID.
 */
export const getATOPortalById = async (id: string) => {
    if (!id) throw new Error('ID is required to fetch ATO Portal Copy data');
    return getRegistrationById<any>(COLLECTION_NAME, id);
};

/**
 * Update the status of an existing ATO Portal Copy registration.
 */
export const updateATOPortalStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed' | 'rejected'
) => {
    if (!id) throw new Error('ID is required to update ATO Portal Copy status');
    return updateRegistrationStatus(COLLECTION_NAME, id, status);
};

/**
 * Get all ATO Portal Copy registrations for a specific user.
 */
export const getUserATOPortals = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to fetch user ATO Portal Copies');
    return getUserRegistrations<any>(COLLECTION_NAME, userId);
};
