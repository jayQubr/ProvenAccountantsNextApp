import { checkExistingRegistration, getRegistrationById, getUserRegistrations, submitRegistration, updateRegistrationStatus } from './registrationService';

export interface NoticeAssessmentData {
    year: string;
    details: string;
    agreeToDeclaration?: boolean;
    userId?: string;
    userEmail?: string;
    userName?: string;
    status?: 'pending' | 'in-progress' | 'completed' | 'rejected';
    createdAt?: number;
    updatedAt?: number;
    user?: {
        phone?: string;
        address?: string;
        [key: string]: any;
    };
}

const COLLECTION_NAME = 'noticeAssessments';

export const submitNoticeAssessment = async (data: Omit<NoticeAssessmentData, 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
    return submitRegistration<any>(COLLECTION_NAME, data);
};

export const checkExistingNoticeAssessment = async (userId: string) => {
    return checkExistingRegistration<any>(COLLECTION_NAME, userId);
};

export const getNoticeAssessmentById = async (id: string) => {
    return getRegistrationById<any>(COLLECTION_NAME, id);
};

export const updateNoticeAssessmentStatus = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed' | 'rejected'
) => {
    return updateRegistrationStatus(COLLECTION_NAME, id, status);
};

export const getUserNoticeAssessments = async (userId: string) => {
    return getUserRegistrations<any>(COLLECTION_NAME, userId);
};