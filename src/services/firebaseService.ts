import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where, 
  serverTimestamp, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Summary, News, UserProfile } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logout = () => auth.signOut();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null): never {
  const user = auth.currentUser;
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType,
    path,
    authInfo: {
      userId: user?.uid || 'anonymous',
      email: user?.email || '',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || false,
      providerInfo: user?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || '',
      })) || [],
    }
  };
  
  if (error.code === 'permission-denied') {
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

// --- Summary Sync ---

export const getSummaries = async () => {
  try {
    const q = query(collection(db, 'summaries'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Summary));
  } catch (error) {
    return handleFirestoreError(error, 'list', 'summaries');
  }
};

export const createSummary = async (summary: Omit<Summary, 'id'>) => {
  try {
    const newDocRef = doc(collection(db, 'summaries'));
    const data = {
      ...summary,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data } as Summary;
  } catch (error) {
    return handleFirestoreError(error, 'create', 'summaries');
  }
};

// --- News Sync ---

export const getNewsForSummary = async (sinteseId: string) => {
  try {
    const q = query(collection(db, 'news'), where('sinteseId', '==', sinteseId), orderBy('ordem', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as News));
  } catch (error) {
    return handleFirestoreError(error, 'list', 'news');
  }
};

export const createNews = async (news: Omit<News, 'id'>) => {
  try {
    const newDocRef = doc(collection(db, 'news'));
    const data = {
      ...news,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(newDocRef, data);
    return { id: newDocRef.id, ...data } as News;
  } catch (error) {
    return handleFirestoreError(error, 'create', 'news');
  }
};

// --- User Profile ---

export const syncUserProfile = async (user: User) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const profile: UserProfile = {
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'reader', // Default, admin role handled via rules or manual DB edit initially
      };
      await setDoc(userDocRef, profile);
      return profile;
    }
    return userDoc.data() as UserProfile;
  } catch (error) {
    return handleFirestoreError(error, 'write', `users/${user.uid}`);
  }
};

// Initial connection test as per instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if(error.message?.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
