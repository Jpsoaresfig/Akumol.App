// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDpuZYTTiz0qaq-cxTWosx8bvHWdnV36Eg",
  authDomain: "akumol-205ab.firebaseapp.com",
  projectId: "akumol-205ab",
  storageBucket: "akumol-205ab.firebasestorage.app",
  messagingSenderId: "46604058736",
  appId: "1:46604058736:web:3dc30e605e7e4a3c44f4b5",
  measurementId: "G-0364W2LMDZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);