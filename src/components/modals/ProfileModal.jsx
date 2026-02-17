import React, { useState, useRef } from 'react';
import { X, Camera, Save, Loader2, Upload, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { getFirestore, doc, updateDoc, writeBatch, query, collection, where, getDocs } from "firebase/firestore"; // writeBatchなどを追加
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

  // 画像アップロード処理 (変更なし)
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

  /**
   * プロフィール保存およびデータ同期処理
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. プロフィールの名前が変更されているかチェック
      const nameChanged = name !== user.name;

      // 2. ユーザー自身のドキュメントを更新
      await updateDoc(doc(db, "users", user.id), {
        name: name,
        avatarUrl: avatarUrl
      });

      // 3. 名前が変わっていた場合、過去の全タスクと準備物の担当者名を同期
      if (nameChanged) {
        const batch = writeBatch(db);

        // タスク一覧から「古い名前」のものを検索
        const tasksQuery = query(collection(db, "tasks"), where("assignee", "==", user.name));
        const taskDocs = await getDocs(tasksQuery);
        taskDocs.forEach((d) => {
          batch.update(doc(db, "tasks", d.id), { assignee: name });
        });

        // 準備物一覧から「古い名前」のものを検索
        const suppliesQuery = query(collection(db, "supplies"), where("assignee", "==", user.name));
        const supplyDocs = await getDocs(suppliesQuery);
        supplyDocs.forEach((d) => {
          batch.update(doc(db, "supplies", d.id), { assignee: name });
        });

        // バッチ処理を一括実行
        await batch.commit();
      }

      // 4. パスワード変更処理へ続く（入力がある場合）
      if (!currentPassword && !newPassword) {
        onClose();
      } else {
        await handlePasswordUpdate();
      }
    } catch (err) {
      console.error("Profile update/sync error:", err);
      alert("プロフィールの更新、またはデータの同期に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // パスワード更新処理 (変更なし)
  const handlePasswordUpdate = async () => {
    if (!newPassword) return;
    setPwMessage({ type: '', text: '' });
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: '新しいパスワードが一致しません。' });
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setPwMessage({ type: 'success', text: 'パスワードも更新されました。' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error(err);
      let errorText = "パスワード更新に失敗しました。";
      if (err.code === 'auth/wrong-password') errorText = "現在のパスワードが正しくありません。";
      setPwMessage({ type: 'error', text: errorText });
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSaveProfile}>
          {/* ヘッダー */}
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/30 sticky top-0 bg-white z-10">
            <h3 className="font-black text-xl text-gray-800">プロフィール & セキュリティ</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>

          <div className="p-8 space-y-8">
            {/* アバターセクション */}
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
                    <span className="text-[#284db3] text-3xl font-black">{name?.[0] || user?.name?.[0]}</span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Upload className="text-white opacity-0 group-hover:opacity-100 transition-all" size={20} />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#284db3] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <Camera size={14} />
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            </div>

            {/* 基本情報 */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">基本設定</h4>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">表示名</label>
                <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* パスワード変更セクション */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-[#284db3] uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> パスワード変更
              </h4>
              
              {pwMessage.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2 ${
                  pwMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {pwMessage.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                  {pwMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">現在のパスワード</label>
                  <input 
                    type="password" 
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#284db3] outline-none transition-all" 
                    placeholder="再認証に必要です"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">新しいパスワード</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#284db3] outline-none transition-all" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">確認用入力</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#284db3] outline-none transition-all" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* フッターアクション */}
          <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t sticky bottom-0">
            <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">キャンセル</button>
            <button 
              type="submit" 
              disabled={isSubmitting || isUploading} 
              className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
              変更を保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}