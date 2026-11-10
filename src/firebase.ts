// Firebase SDK
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByRr_ZaIbyhXuuSg_i3MJX6CAmf4cEAGQ",
  authDomain: "crud-harvey.firebaseapp.com",
  projectId: "crud-harvey",
  storageBucket: "crud-harvey.firebasestorage.app",
  messagingSenderId: "767927798714",
  appId: "1:767927798714:web:d98e1074c8f1a83599ab83",
  measurementId: "G-6BH7LD8TQ2"
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const db = firestore;

export const analytics = isSupported().then((supported) => {
  return supported ? getAnalytics(app) : null;
});

export default app;
