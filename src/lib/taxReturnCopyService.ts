import { 
    checkExistingRegistration, 
    getRegistrationById, 
    getUserRegistrations, 
    submitRegistration, 
    updateRegistrationStatus 
  } from './registrationService';
  
  export interface TaxReturnData {
      year: string;
      details: string;
      userId?: any;
      userEmail?: string;
      userName?: string;
      status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
      createdAt?: number;
      updatedAt?: number;
  }
  
  const COLLECTION_NAME = 'taxReturnCopies';
  
  /**
   * Submit a new Tax Return Copy registration.
   */
  export const submitTaxReturn = async (data: Omit<TaxReturnData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
      if (!data.userId) throw new Error('User ID is required for submitting tax return');
      return submitRegistration<any>(COLLECTION_NAME, data);
  };
  
  /**
   * Check if the user has an existing Tax Return Copy registration.
   */
  export const checkExistingTaxReturn = async (userId: string) => {
      if (!userId) throw new Error('User ID is required to check tax return');
      return checkExistingRegistration<any>(COLLECTION_NAME, userId);
  };
  
  /**
   * Get a specific Tax Return Copy registration by ID.
   */
  export const getTaxReturnById = async (id: string) => {
      if (!id) throw new Error('ID is required to fetch tax return data');
      return getRegistrationById<any>(COLLECTION_NAME, id);
  };
  
  /**
   * Update the status of an existing Tax Return Copy registration.
   */
  export const updateTaxReturnStatus = async (
      id: string,
      status: 'pending' | 'in-progress' | 'completed' | 'rejected'
  ) => {
      if (!id) throw new Error('ID is required to update tax return status');
      return updateRegistrationStatus(COLLECTION_NAME, id, status);
  };
  
  /**
   * Get all Tax Return Copy registrations for a specific user.
   */
  export const getUserTaxReturns = async (userId: string) => {
      if (!userId) throw new Error('User ID is required to fetch user tax returns');
      return getUserRegistrations<any>(COLLECTION_NAME, userId);
  };
  