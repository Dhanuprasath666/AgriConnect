// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ Analytics removed to avoid warning
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAqTkKx9eAhMpVaPdFEZTpbfz-8yFLTeVs",
  authDomain: "agri-connect-4548e.firebaseapp.com",
  projectId: "agri-connect-4548e",
  storageBucket: "agri-connect-4548e.firebasestorage.app",
  messagingSenderId: "661335821051",
  appId: "1:661335821051:web:4ec786d000f28a674b7e5e",
  measurementId: "G-G7GVD2T1DZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔥 EXPORT FIRESTORE
export const db = getFirestore(app);
