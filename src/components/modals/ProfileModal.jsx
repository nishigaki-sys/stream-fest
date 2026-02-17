import React, { useState, useRef } from 'react';
import { X, Camera, Save, Loader2, Upload, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
// 必要な Firestore 関数を明示的にインポート
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  writeBatch, 
  query, 
  collection, 
  where, 
  getDocs 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { storage } from "../../config/firebase";

const db = getFirestore();

export default function ProfileModal({ isOpen, onClose, user }) {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("画像のアップロードに失敗しました。");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("名前を入力してください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const nameChanged = name !== user.name;
      
      // 1. ユーザー自身のプロフィール更新
      console.log("Updating profile...");
      await updateDoc(doc(db, "users", user.id), {
        name: name.trim(),
        avatarUrl: avatarUrl
      });

      // 2. 名前が変更された場合のみ同期処理を実行
      if (nameChanged) {
        console.log("Syncing names across tasks and supplies...");
        const batch = writeBatch(db);
        let hasChanges = false;

        // タスクの同期
        const tasksQuery = query(collection(db, "tasks"), where("assignee", "==", user.name));
        const taskDocs = await getDocs(tasksQuery);
        taskDocs.forEach((d) => {
          batch.update(doc(db, "tasks", d.id), { assignee: name.trim() });
          hasChanges = true;
        });

        // 準備物の同期
        const suppliesQuery = query(collection(db, "supplies"), where("assignee", "==", user.name));
        const supplyDocs = await getDocs(suppliesQuery);
        supplyDocs.forEach((d) => {
          batch.update(doc(db, "supplies", d.id), { assignee: name.trim() });
          hasChanges = true;
        });

        if (hasChanges) {
          await batch.commit();
          console.log("Sync completed successfully.");
        }
      }

      // 3. パスワード更新チェック
      if (currentPassword && newPassword) {
        await handlePasswordUpdate();
      } else {
        alert("プロフィールを更新しました。");
        onClose();
      }
    } catch (err) {
      console.error("Critical Error during save:", err);
      alert("更新中にエラーが発生しました。詳細はブラウザのコンソールを確認してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: '新しいパスワードが一致しません。' });
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setPwMessage({ type: 'success', text: 'パスワードも更新されました。' });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Password update error:", err);
      setPwMessage({ type: 'error', text: "パスワード更新失敗：現在のパスワードが違います。" });
      throw err; // handleSaveProfile 側で catch させる
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSaveProfile}>
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/30 sticky top-0 bg-white z-10">
            <h3 className="font-black text-xl text-gray-800">プロフィール & セキュリティ</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="text-center">
              <div className="relative inline-block mx-auto cursor-pointer group" onClick={() => fileInputRef.current.click()}>
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white shadow-xl relative">
                  {isUploading ? (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" />
                    </div>
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#284db3] text-3xl font-black">{name?.[0] || 'U'}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#284db3] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <Camera size={14} />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">基本設定</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">表示名</label>
                <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#284db3] uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> パスワード変更（任意）
              </h4>
              {pwMessage.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
                  pwMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  <AlertCircle size={16} /> {pwMessage.text}
                </div>
              )}
              <div className="space-y-4 opacity-80 focus-within:opacity-100 transition-opacity">
                <input 
                  type="password" 
                  className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#284db3] outline-none" 
                  placeholder="現在のパスワード"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input type="password" placeholder="新しいパスワード" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#284db3] outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <input type="password" placeholder="確認用" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#284db3] outline-none" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t sticky bottom-0">
            <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400">キャンセル</button>
            <button 
              type="submit" 
              disabled={isSubmitting || isUploading} 
              className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}