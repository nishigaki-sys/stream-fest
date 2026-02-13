// src/components/modals/EventModal.jsx
import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock, Building, Users, ExternalLink } from 'lucide-react';
import { getFirestore, collection, addDoc, updateDoc, doc } from "firebase/firestore";

const db = getFirestore();

export default function EventModal({ isOpen, onClose, editingItem }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (editingItem) {
      // 既存の項目に加え、ご要望の項目とGoogleドライブURLを初期化
      setFormData({
        ...editingItem,
        address: editingItem.address || '',
        period: editingItem.period || '',
        startTime: editingItem.startTime || '',
        endTime: editingItem.endTime || '',
        organizer: editingItem.organizer || '',
        coOrganizer: editingItem.coOrganizer || '',
        supporter: editingItem.supporter || '',
        sponsor: editingItem.sponsor || '',
        googleDriveUrl: editingItem.googleDriveUrl || ''
      });
    }
  }, [editingItem]);

  if (!isOpen || !formData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const eventData = { 
        ...formData, 
        status: formData.status || '進行中', 
        progress: formData.progress || 0 
      };
      if (formData.id) {
        const { id, ...data } = eventData;
        await updateDoc(doc(db, "events", id), data);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }
      onClose();
    } catch (err) { 
      console.error("Event Save Error:", err); 
      alert("保存に失敗しました。");
    }
  };

  const inputClass = "w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] transition-all text-sm";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase ml-4 block mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <div className="p-8 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="font-black text-xl text-gray-800">
              {formData.id ? 'プロジェクト情報の編集' : 'プロジェクト新規作成'}
            </h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>

          <div className="p-10 space-y-8">
            {/* 基本情報 */}
            <section className="space-y-4">
              <h4 className="text-xs font-black text-blue-600 border-l-4 border-blue-600 pl-3 uppercase tracking-widest">基本情報</h4>
              <div className="space-y-2">
                <label className={labelClass}>プロジェクト名</label>
                <input required className={inputClass} value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="例: STREAM FEST 2026 名古屋" />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Googleドライブ共有URL (成果物・クリエイティブ保存用)</label>
                <div className="relative">
                  <ExternalLink className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input className={`${inputClass} pl-14`} value={formData.googleDriveUrl} onChange={e=>setFormData({...formData, googleDriveUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                </div>
              </div>
            </section>

            {/* 会場・日時 */}
            <section className="space-y-4">
              <h4 className="text-xs font-black text-blue-600 border-l-4 border-blue-600 pl-3 uppercase tracking-widest">会場・スケジュール</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>会場名</label>
                  <input required className={inputClass} value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} placeholder="会場・施設名" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>住所</label>
                  <input className={inputClass} value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} placeholder="都道府県・市区町村・番地" />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>開催期間</label>
                <input className={inputClass} value={formData.period} onChange={e=>setFormData({...formData, period: e.target.value})} placeholder="例: 2026年10月1日(木)〜10月3日(土)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>開始時間</label>
                  <input type="time" className={inputClass} value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>終了時間</label>
                  <input type="time" className={inputClass} value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
            </section>

            {/* 関係組織 */}
            <section className="space-y-4">
              <h4 className="text-xs font-black text-blue-600 border-l-4 border-blue-600 pl-3 uppercase tracking-widest">関係組織・パートナー</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>主催者</label>
                  <input className={inputClass} value={formData.organizer} onChange={e=>setFormData({...formData, organizer: e.target.value})} placeholder="主催団体・企業名" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>共催</label>
                  <input className={inputClass} value={formData.coOrganizer} onChange={e=>setFormData({...formData, coOrganizer: e.target.value})} placeholder="共催団体名" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>後援</label>
                  <input className={inputClass} value={formData.supporter} onChange={e=>setFormData({...formData, supporter: e.target.value})} placeholder="行政・メディアなど" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>協賛</label>
                  <input className={inputClass} value={formData.sponsor} onChange={e=>setFormData({...formData, sponsor: e.target.value})} placeholder="スポンサー企業名" />
                </div>
              </div>
            </section>
          </div>

          <div className="p-8 bg-gray-50 flex justify-end gap-4 sticky bottom-0 border-t">
            <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">キャンセル</button>
            <button type="submit" className="bg-[#284db3] text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95">
              プロジェクトを保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}