// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // 追加

const firebaseConfig = {
  apiKey: "AIzaSyBpOqq4vJjyEPtTQYmoooOlaq8WSmLXk1o",
  authDomain: "stream-fest.firebaseapp.com",
  projectId: "stream-fest",
  storageBucket: "stream-fest.firebasestorage.app",
  messagingSenderId: "299514757351",
  appId: "1:299514757351:web:5223c7ba331734fd73a242"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);