import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { auth } from '../config/firebase';
import { ROLES } from '../constants/appConfig';

const AuthContext = createContext();

// カスタムフック：他のコンポーネントから簡単に利用できるようにする
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbUsers, setDbUsers] = useState([]);
  const db = getFirestore();

  // 1. 全ユーザー情報を監視（プロファイル紐付け用）
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      setDbUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [db]);

  // 2. 認証状態を監視し、プロファイルと紐付ける
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // DB内のユーザー情報から一致するものを探す
        const profile = dbUsers.find(u => u.email === firebaseUser.email);
        
        setCurrentUser(profile ? {
          ...profile,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName
        } : {
          // DBにない場合のデフォルト（HQ権限など）
          name: firebaseUser.email.split('@')[0],
          role: ROLES.HQ,
          email: firebaseUser.email,
          uid: firebaseUser.uid
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [dbUsers]);

  const signOut = () => firebaseSignOut(auth);

  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    isLoading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};