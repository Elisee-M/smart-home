import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, onValue, off } from 'firebase/database';

const firebaseConfig = {
  databaseURL: "https://dht11-af095-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Firebase utilities
export const firebaseUtils = {
  // Read data once
  async readOnce(path: string) {
    const snapshot = await get(ref(database, path));
    return snapshot.val();
  },

  // Write data
  async write(path: string, data: any) {
    await set(ref(database, path), data);
  },

  // Subscribe to real-time updates
  subscribe(path: string, callback: (data: any) => void) {
    const dataRef = ref(database, path);
    onValue(dataRef, (snapshot) => {
      callback(snapshot.val());
    });
    return dataRef;
  },

  // Unsubscribe from updates
  unsubscribe(dataRef: any) {
    off(dataRef);
  }
};

export default database;