import {
    checkExistingRegistration,
    getRegistrationById,
    getUserRegistrations,
    submitRegistration,
    updateRegistrationStatus
} from './registrationService';

export interface PaymentPlanData {
    planType: string;
    amount: number;
    userId?: any;
    userEmail?: string;
    userName?: string;
    status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
    createdAt?: number;
    updatedAt?: number;
    notes?: string;
}

const COLLECTION_NAME = 'paymentPlans';

/**
 * Submit a new Payment Plan registration.
 */
export const submitPaymentPlan = async (data: Omit<PaymentPlanData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    if (!data.userId) throw new Error('User ID is required for submitting Payment Plan');
    return submitRegistration<any>(COLLECTION_NAME, data);
};

/**
 * Check if the user has an existing Payment Plan registration.
 */
export const checkExistingPaymentPlan = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to check Payment Plan');
    return checkExistingRegistration<any>(COLLECTION_NAME, userId);
};

/**
 * Get a specific Payment Plan registration by ID.
 */
export const getPaymentPlanById = async (id: string) => {
    if (!id) throw new Error('ID is required to fetch Payment Plan data');
    return getRegistrationById<any>(COLLECTION_NAME, id);
};

/**
 * Update the status of an existing Payment Plan registration.
 */
export const updatePaymentPlanStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed' | 'rejected'
) => {
    if (!id) throw new Error('ID is required to update Payment Plan status');
    return updateRegistrationStatus(COLLECTION_NAME, id, status);
};

/**
 * Get all Payment Plan registrations for a specific user.
 */
export const getUserPaymentPlans = async (userId: string) => {
    if (!userId) throw new Error('User ID is required to fetch user Payment Plans');
    return getUserRegistrations<any>(COLLECTION_NAME, userId);
};
