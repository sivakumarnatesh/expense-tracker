// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMH23YJ1kA1WLltJVFab8lP3zxZqxjCww",
  authDomain: "expense-tracker-c9b03.firebaseapp.com",
  projectId: "expense-tracker-c9b03",
  storageBucket: "expense-tracker-c9b03.firebasestorage.app",
  messagingSenderId: "303453457690",
  appId: "1:303453457690:web:f4049a141abdaf8ca370a3",
  measurementId: "G-VVBPSLPG99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);