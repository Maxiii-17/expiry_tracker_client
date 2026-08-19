import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB Multi-Tab Offline Persistence
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch (e) {
  console.warn('Persistent IndexedDB cache fallback:', e);
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreInstance;
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.warn('Firestore Notice: ', JSON.stringify(errInfo));
}

// Test Connection on boot with low-network timeout
export async function testConnection(): Promise<boolean> {
  if (!navigator.onLine) return false;
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 4000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise,
    ]);
    return true;
  } catch (error) {
    // If offline or slow 2G/3G, return false to let app work in offline/cached mode
    return false;
  }
}

// Auth operations
export async function loginWithGoogle(): Promise<User | null> {
  if (!navigator.onLine) {
    throw new Error('You are currently offline. Please reconnect to sign in.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

export function subscribeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Product collection operations with offline support
const PRODUCTS_COLLECTION = 'products';

export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        prods.push({
          id: d.id,
          name: data.name || 'Unnamed',
          expiryDate: data.expiryDate || '',
          category: data.category || 'medicine',
          quantity: typeof data.quantity === 'number' ? data.quantity : 1,
          barcode: data.barcode,
          uses: data.uses,
          dosage: data.dosage,
          imageUrl: data.imageUrl,
          genericName: data.genericName,
          composition: data.composition,
          packSize: data.packSize,
          batchNumber: data.batchNumber,
          price: data.price,
          manufacturer: data.manufacturer,
          verificationSource: data.verificationSource,
          verifiedAt: data.verifiedAt,
        });
      });
      if (prods.length > 0) {
        onSuccess(prods);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, PRODUCTS_COLLECTION);
      if (onError) onError(error);
    }
  );
}

export async function addOrUpdateProduct(product: Product): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const data: Record<string, any> = {
      name: product.name,
      expiryDate: product.expiryDate,
      category: product.category,
      quantity: product.quantity,
    };

    if (product.barcode) data.barcode = product.barcode;
    if (product.uses) data.uses = product.uses;
    if (product.dosage) data.dosage = product.dosage;
    if (product.imageUrl) data.imageUrl = product.imageUrl;
    if (product.genericName) data.genericName = product.genericName;
    if (product.composition) data.composition = product.composition;
    if (product.packSize) data.packSize = product.packSize;
    if (product.batchNumber) data.batchNumber = product.batchNumber;
    if (product.price !== undefined) data.price = product.price;
    if (product.manufacturer) data.manufacturer = product.manufacturer;
    if (product.verificationSource) data.verificationSource = product.verificationSource;
    if (product.verifiedAt) data.verifiedAt = product.verifiedAt;
    if (auth.currentUser?.uid) data.userId = auth.currentUser.uid;

    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    // Don't re-throw in low network so the app continues seamlessly
  }
}

export async function updateProductQuantity(productId: string, newQuantity: number): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, { quantity: Math.max(0, newQuantity) });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductDoc(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function checkAndSeedFirestore(initialList: Product[]): Promise<void> {
  if (!navigator.onLine) return;
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    if (snapshot.empty && initialList.length > 0) {
      console.log('Seeding initial medicine catalog to Firestore...');
      const batch = writeBatch(db);
      const itemsToSeed = initialList.slice(0, 50);
      for (const p of itemsToSeed) {
        const docRef = doc(db, PRODUCTS_COLLECTION, p.id);
        const data: Record<string, any> = {
          name: p.name,
          expiryDate: p.expiryDate,
          category: p.category,
          quantity: p.quantity,
        };
        if (p.barcode) data.barcode = p.barcode;
        if (p.uses) data.uses = p.uses;
        if (p.dosage) data.dosage = p.dosage;
        if (p.imageUrl) data.imageUrl = p.imageUrl;
        if (p.genericName) data.genericName = p.genericName;
        if (p.composition) data.composition = p.composition;
        if (p.packSize) data.packSize = p.packSize;
        if (p.batchNumber) data.batchNumber = p.batchNumber;
        if (p.price !== undefined) data.price = p.price;
        if (p.manufacturer) data.manufacturer = p.manufacturer;
        if (p.verificationSource) data.verificationSource = p.verificationSource;
        if (p.verifiedAt) data.verifiedAt = p.verifiedAt;

        batch.set(docRef, data);
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Seeding skipped in low-network mode:', err);
  }
}
