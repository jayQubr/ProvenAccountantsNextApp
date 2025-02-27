import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    User
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebaseConfig';

// Authentication services
export const registerWithEmailAndPassword = async (
    email: string,
    password: string,
    displayName: string
) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email,
            displayName,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error };
    }
};

export const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Update last login timestamp
        const userRef = doc(db, "users", userCredential.user.uid);
        await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
        });

        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error };
    }
};

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
            // Create new user document if it doesn't exist
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                provider: "google"
            });
        } else {
            // Update last login
            await updateDoc(doc(db, "users", user.uid), {
                lastLogin: serverTimestamp(),
            });
        }

        return { success: true, user };
    } catch (error) {
        return { success: false, error };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};

// User profile services
export const getCurrentUser = async () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
        }, reject);
    });
};

export const getUserProfile = async (uid: string) => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: "User not found" };
        }
    } catch (error) {
        return { success: false, error };
    }
};

export const updateUserProfile = async (uid: string, data: any) => {
    try {
        await updateDoc(doc(db, "users", uid), {
            ...data,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
};