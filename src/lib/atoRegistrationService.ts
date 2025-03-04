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
import { db } from '@/lib/firebaseConfig';
export type ATORegistrationStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';

export interface ATORegistrationData {
    userId: string;
    postalAddress: string;
    postalCode: string;
    abn: boolean;
    gst: boolean;
    fuelTaxCredit: boolean;
    status: ATORegistrationStatus;
    createdAt: any;
    updatedAt: any;
    notes?: string;
}

// Create or update ATO registration request
export const submitATORegistration = async (data: Omit<ATORegistrationData, 'createdAt' | 'updatedAt'>) => {
    try {
        const registrationRef = doc(collection(db, "atoRegistrations"));
        
        await setDoc(registrationRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        return { success: true, id: registrationRef.id };
    } catch (error) {
        console.error("Error submitting ATO registration:", error);
        return { success: false, error };
    }
};

// Check if user already has an ATO registration request
export const checkExistingATORegistration = async (userId: string) => {
    try {
        const atoRegistrationsRef = collection(db, "atoRegistrations");
        const q = query(atoRegistrationsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            // Return the first registration found
            const doc = querySnapshot.docs[0];
            return { 
                exists: true, 
                data: { id: doc.id, ...doc.data() } as ATORegistrationData & { id: string }
            };
        }
        
        return { exists: false };
    } catch (error) {
        console.error("Error checking existing ATO registration:", error);
        return { exists: false, error };
    }
};

// Get ATO registration by ID
export const getATORegistrationById = async (registrationId: string) => {
    try {
        const docRef = doc(db, "atoRegistrations", registrationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { 
                success: true, 
                data: { id: docSnap.id, ...docSnap.data() } as ATORegistrationData & { id: string }
            };
        } else {
            return { success: false, error: "Registration not found" };
        }
    } catch (error) {
        console.error("Error getting ATO registration:", error);
        return { success: false, error };
    }
};

// Update ATO registration status
export const updateATORegistrationStatus = async (
    registrationId: string, 
    status: ATORegistrationStatus,
    notes?: string
) => {
    try {
        const docRef = doc(db, "atoRegistrations", registrationId);
        
        await updateDoc(docRef, {
            status,
            notes: notes || "",
            updatedAt: serverTimestamp()
        });
        
        return { success: true };
    } catch (error) {
        console.error("Error updating ATO registration status:", error);
        return { success: false, error };
    }
};

// Get all ATO registrations for a user
export const getUserATORegistrations = async (userId: string) => {
    try {
        const atoRegistrationsRef = collection(db, "atoRegistrations");
        const q = query(atoRegistrationsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        const registrations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as (ATORegistrationData & { id: string })[];
        
        return { success: true, data: registrations };
    } catch (error) {
        console.error("Error getting user ATO registrations:", error);
        return { success: false, error };
    }
};