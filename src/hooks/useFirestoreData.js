// src/hooks/useFirestoreData.js
import { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

// 'export' を追加して名前付きエクスポートにする
export function useFirestoreData(collectionName) {
  const [data, setData] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [collectionName, db]); // dbも依存関係に含めるのが一般的です

  return data;
}