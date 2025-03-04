import {
    collection,
    doc,
    setDoc,
    getDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export type RegistrationStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';

export interface BaseRegistrationData {
    userId: string;
    userEmail: string;
    userName: string;
    status: RegistrationStatus;
    createdAt: any;
    updatedAt: any;
    notes?: string;
}

// Generic function to submit a registration
export const submitRegistration = async <T extends BaseRegistrationData>(
    collectionName: string,
    data: Omit<T, 'createdAt' | 'updatedAt'>
) => {
    try {
        const registrationRef = doc(collection(db, collectionName));
        
        await setDoc(registrationRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true, id: registrationRef.id };
    } catch (error) {
        console.error(`Error submitting ${collectionName}:`, error);
        return { success: false, error };
    }
};

// Generic function to check if user already has a registration
export const checkExistingRegistration = async <T extends BaseRegistrationData>(
    collectionName: string,
    userId: string
) => {
    try {
        const registrationsRef = collection(db, collectionName);
        const q = query(registrationsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Return the first registration found
            const doc = querySnapshot.docs[0];
            return { 
                exists: true, 
                data: { id: doc.id, ...doc.data() } as T & { id: string }
            };
        }
        
        return { exists: false };
    } catch (error) {
        console.error(`Error checking existing ${collectionName}:`, error);
        return { exists: false, error };
    }
};

// Generic function to get registration by ID
export const getRegistrationById = async <T extends BaseRegistrationData>(
    collectionName: string,
    registrationId: string
) => {
    try {
        const docRef = doc(db, collectionName, registrationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { 
                success: true, 
                data: { id: docSnap.id, ...docSnap.data() } as T & { id: string }
            };
        } else {
            return { success: false, error: "Registration not found" };
        }
    } catch (error) {
        console.error(`Error getting ${collectionName}:`, error);
        return { success: false, error };
    }
};

// Generic function to update registration status
export const updateRegistrationStatus = async (
    collectionName: string,
    registrationId: string, 
    status: RegistrationStatus,
    notes?: string
) => {
    try {
        const docRef = doc(db, collectionName, registrationId);
        
        await updateDoc(docRef, {
            status,
            notes: notes || "",
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error(`Error updating ${collectionName} status:`, error);
        return { success: false, error };
    }
};

// Generic function to get all registrations for a user
export const getUserRegistrations = async <T extends BaseRegistrationData>(
    collectionName: string,
    userId: string
) => {
    try {
        const registrationsRef = collection(db, collectionName);
        const q = query(registrationsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        const registrations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as (T & { id: string })[];
        
        return { success: true, data: registrations };
    } catch (error) {
        console.error(`Error getting user ${collectionName}:`, error);
        return { success: false, error };
    }
};