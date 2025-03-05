import { checkExistingRegistration, getRegistrationById, getUserRegistrations, RegistrationStatus, submitRegistration, updateRegistrationStatus } from "./registrationService";

export const submitCompanyRegistration = async (data: any) => {
    return submitRegistration('companyRegistrations', data);
};

export const checkExistingCompanyRegistration = async (userId: string) => {
    return checkExistingRegistration('companyRegistrations', userId);
};

export const getCompanyRegistrationById = async (registrationId: string) => {
    return getRegistrationById('companyRegistrations', registrationId);
};

export const updateCompanyRegistrationStatus = async (registrationId: string, status: RegistrationStatus) => {
    return updateRegistrationStatus('companyRegistrations', registrationId, status);
};

export const getUserCompanyRegistrations = async (userId: string) => {
    return getUserRegistrations('companyRegistrations', userId);
};