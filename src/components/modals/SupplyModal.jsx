// src/components/modals/SupplyModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react'; // ExternalLink を追加
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ITEM_CATEGORIES, PROCUREMENT_METHODS, ITEM_STATUS } from '../../constants/appConfig';

const db = getFirestore();

export default function SupplyModal({ isOpen, onClose, editingItem, users, budgets = [], eventId }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        supplyUrl: editingItem.supplyUrl || '',
        budgetId: editingItem.budgetId || '',
        // 数量のデフォルト値を 1 に設定（前回の修正）
        quantity: editingItem.id ? (editingItem.quantity || '') : '1',
        // 【修正箇所】新規作成時にカテゴリの初期値をセットする
        category: editingItem.category || ITEM_CATEGORIES[0] 
      });
    }
  }, [editingItem]);

  if (!isOpen || !formData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const data = { 
        ...formData, 
        eventId,
        status: formData.status || ITEM_STATUS.TODO,
        method: formData.method || PROCUREMENT_METHODS[0]
      };
      if (formData.id) {
        const { id, ...updateData } = data;
        await updateDoc(doc(db, "supplies", id), updateData);
      } else {
        await addDoc(collection(db, "supplies"), data);
      }
      onClose();
    } catch (err) { console.error(err); }
  };

  // リンクを新しいタブで開く関数
  const handleOpenLink = () => {
    if (formData.supplyUrl) {
      window.open(formData.supplyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <div className="p-8 border-b bg-gray-50/30 sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="font-black text-xl text-gray-800">準備物の設定</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">詳細名</label>
              <input required className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="例: 運営マニュアル" />
            </div>

            {/* 追加：成果物・共有URL入力欄 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#284db3] uppercase ml-4 flex items-center gap-1">
                <ExternalLink size={12}/> 成果物・共有URL
              </label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-blue-50/50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" 
                  value={formData.supplyUrl} 
                  onChange={e => setFormData({...formData, supplyUrl: e.target.value})} 
                  placeholder="GoogleドライブのフォルダURLなどを入力" 
                />
                {formData.supplyUrl && (
                  <button
                    type="button"
                    onClick={handleOpenLink}
                    className="px-4 bg-[#284db3] text-white rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-md"
                    title="リンクを開く"
                  >
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">カテゴリ</label>
                <select required className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* 追加：費用カテゴリ（予算項目との紐付け） */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-green-600 uppercase ml-4">紐づく予算項目 (費用カテゴリ)</label>
                <select 
                  className="w-full bg-green-50/50 border-none rounded-2xl p-4 font-bold outline-none text-sm focus:ring-2 focus:ring-green-500" 
                  value={formData.budgetId} 
                  onChange={e => setFormData({...formData, budgetId: e.target.value})}
                >
                  <option value="">未設定 (予算外)</option>
                  {budgets && budgets.map(b => (
                    <option key={b.id} value={b.id}>{b.title} (残金: ¥{(b.planned - b.actual).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">ステータス</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {Object.values(ITEM_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">手配方法</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none text-sm" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  {PROCUREMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">数量</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: e.target.value})} placeholder="1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">手配先</label>
                <input className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none" value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="社内・業者名など" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">担当者</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none text-sm" value={formData.assignee || ''} onChange={e => setFormData({...formData, assignee: e.target.value})}>
                  <option value="">担当者を選択</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">詳細内容・備考</label>
              <textarea className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px] resize-none text-sm" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="備考や仕様など" />
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex justify-between gap-4 sticky bottom-0">
            <div className="flex gap-3">
              {formData.id && (
                <button type="button" onClick={async () => { if(window.confirm('削除しますか？')){ await deleteDoc(doc(db, "supplies", formData.id)); onClose(); } }} className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/> 削除</button>
              )}
              <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400">閉じる</button>
            </div>
            <button type="submit" className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black shadow-xl">保存する</button>
          </div>
        </form>
      </div>
    </div>
  );
}