// src/components/modals/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { getFirestore, collection, addDoc, updateDoc, doc } from "firebase/firestore";

const db = getFirestore();

export default function EventModal({ isOpen, onClose, editingItem }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (editingItem) setFormData(editingItem);
  }, [editingItem]);

  if (!isOpen || !formData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const eventData = { ...formData, status: formData.status || '進行中', progress: formData.progress || 0 };
      if (formData.id) {
        const { id, ...data } = eventData;
        await updateDoc(doc(db, "events", id), data);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-8 border-b bg-gray-50/30 sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="font-black text-xl text-gray-800">{formData.id ? 'プロジェクト編集' : 'プロジェクト新規作成'}</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Project Name</label>
              <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 sm:py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="例: 2026 in 名古屋" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Location</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                <input required className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} placeholder="会場名" />
              </div>
            </div>
          </div>
          <div className="p-8 bg-gray-50 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400">キャンセル</button>
            <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}