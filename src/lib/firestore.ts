import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc,
  deleteDoc, 
  doc, 
  getDoc,
  onSnapshot,
  Firestore,
  QueryConstraint
} from 'firebase/firestore';
import { Trade, AccountSettings } from '../types';

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
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Ensure the connection is healthy
export async function validateFirestoreConnection(db: Firestore) {
  try {
    const { getDocFromServer } = await import('firebase/firestore');
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Load trades from firestore
export async function getTradesFromFirestore(db: Firestore, auth: any, userId: string): Promise<Trade[]> {
  const path = 'trades';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const trades: Trade[] = [];
    snapshot.forEach((doc) => {
      trades.push({
        id: doc.id,
        ...doc.data()
      } as Trade);
    });
    return trades;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path, auth);
  }
}

// Add or edit trade in Firestore
export async function saveTradeToFirestore(db: Firestore, auth: any, trade: Trade): Promise<void> {
  const path = `trades/${trade.id}`;
  try {
    if (!trade.id) {
       throw new Error("Trade must have an id before saving to Firestore.");
    }
    await setDoc(doc(db, 'trades', trade.id), trade);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth);
  }
}

// Delete trade from Firestore
export async function deleteTradeFromFirestore(db: Firestore, auth: any, tradeId: string): Promise<void> {
  const path = `trades/${tradeId}`;
  try {
    await deleteDoc(doc(db, 'trades', tradeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path, auth);
  }
}

// Get account settings
export async function getAccountSettingsFromFirestore(db: Firestore, auth: any, userId: string): Promise<AccountSettings | null> {
  const path = `accounts/${userId}`;
  try {
    const docRef = doc(db, 'accounts', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AccountSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path, auth);
  }
}

// Save account settings
export async function saveAccountSettingsToFirestore(db: Firestore, auth: any, settings: AccountSettings): Promise<void> {
  const path = `accounts/${settings.userId}`;
  try {
    await setDoc(doc(db, 'accounts', settings.userId), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path, auth);
  }
}

// Set up Trade listener for realtime updates
export function subscribeToTrades(
  db: Firestore, 
  auth: any, 
  userId: string, 
  onUpdate: (trades: Trade[]) => void, 
  onError: (error: any) => void
) {
  const path = 'trades';
  const q = query(collection(db, path), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const trades: Trade[] = [];
    snapshot.forEach((doc) => {
      trades.push({
        id: doc.id,
        ...doc.data()
      } as Trade);
    });
    onUpdate(trades);
  }, (error) => {
    try {
      handleFirestoreError(error, OperationType.LIST, path, auth);
    } catch (err) {
      onError(err);
    }
  });
}
