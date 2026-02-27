import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"; 

const firebaseConfig = {
  apiKey: "AIzaSyDpuZYTTiz0qaq-cxTWosx8bvHWdnV36Eg",
  authDomain: "akumol-205ab.firebaseapp.com",
  projectId: "akumol-205ab",
  storageBucket: "akumol-205ab.firebasestorage.app",
  messagingSenderId: "46604058736",
  appId: "1:46604058736:web:3dc30e605e7e4a3c44f4b5",
  measurementId: "G-0364W2LMDZ"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const functions = getFunctions(app);
connectFunctionsEmulator(functions, "localhost", 5001); 