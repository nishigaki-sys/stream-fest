// src/components/modals/ProfileModal.jsx
import React, { useState, useRef } from 'react';
import { X, Camera, Save, Loader2, Upload } from 'lucide-react';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // 追加
import { storage } from "../../config/firebase"; // 追加

const db = getFirestore();

export default function ProfileModal({ isOpen, onClose, user }) {
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // 画像アップロード処理
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    try {
      // 保存先のパスを指定 (avatars/ユーザーID/ファイル名)
      const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
      
      // アップロード実行
      await uploadBytes(storageRef, file);
      
      // 公開URLを取得
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("画像のアップロードに失敗しました。Firebase Storageのルール設定を確認してください。");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "users", user.id), {
        name: name,
        avatarUrl: avatarUrl
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("更新に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
            <h3 className="font-black text-xl text-gray-800">プロフィール編集</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
          </div>

          <div className="p-10 space-y-8 text-center">
            {/* プレビュー表示 & クリックでアップロード */}
            <div className="relative inline-block mx-auto cursor-pointer group" onClick={() => fileInputRef.current.click()}>
              <div className="w-28 h-28 rounded-[2.5rem] bg-blue-100 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white shadow-xl relative">
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#284db3] text-4xl font-black">{name?.[0] || user?.name?.[0]}</span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <Upload className="text-white opacity-0 group-hover:opacity-100 transition-all" size={24} />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#284db3] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                <Camera size={16} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">表示名</label>
                <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={name} onChange={e => setName(e.target.value)} />
              </div>
              {/* 画像URL入力欄はバックアップとして残す、または非表示にする */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">アイコン画像URL (自動入力されます)</label>
                <input className="w-full bg-gray-50/50 border-none rounded-2xl px-6 py-4 font-medium text-gray-400 text-xs outline-none" value={avatarUrl} readOnly />
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex justify-end gap-4 border-t">
            <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400">キャンセル</button>
            <button type="submit" disabled={isSubmitting || isUploading} className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}