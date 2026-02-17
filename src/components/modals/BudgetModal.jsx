// src/components/modals/BudgetModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react'; 
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { BUDGET_CATEGORIES } from '../../constants/appConfig';

const db = getFirestore();

export default function BudgetModal({ isOpen, onClose, editingItem, eventId }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        // 初期値が0の場合は空文字にすることで、直接入力をスムーズにします
        planned: editingItem.planned === 0 ? '' : (editingItem.planned || ''),
        actual: editingItem.actual === 0 ? '' : (editingItem.actual || ''),
        category: editingItem.category || BUDGET_CATEGORIES[0],
        id: editingItem.id || null,
        sortOrder: editingItem.sortOrder || null
      });
    }
  }, [editingItem]);

  if (!isOpen || !formData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const budgetData = { 
        ...formData, 
        eventId,
        // 保存時に文字列を数値に変換（未入力の場合は0）
        planned: Number(formData.planned) || 0,
        actual: Number(formData.actual) || 0,
        sortOrder: formData.sortOrder || Date.now() 
      };
      
      if (formData.id) {
        const { id, ...data } = budgetData;
        await updateDoc(doc(db, "budgets", id), data);
      } else {
        await addDoc(collection(db, "budgets"), budgetData);
      }
      onClose();
    } catch (err) { 
      console.error("Save Error:", err); 
      alert("保存に失敗しました。");
    }
  };

  const handleDelete = async () => {
    if (!formData.id) return;
    if (window.confirm("この予算項目を削除しますか？")) {
      try {
        await deleteDoc(doc(db, "budgets", formData.id));
        onClose();
      } catch (err) { 
        console.error("Delete Error:", err);
        alert("削除に失敗しました。");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden">
        <form onSubmit={handleSave}>
          <div className="p-8 border-b bg-gray-50/30 sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="font-black text-xl text-gray-800">予算項目の設定</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>
          <div className="p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">項目名</label>
              <input required className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="会場費など" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4">カテゴリ</label>
              <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">予算額（計画）</label>
                {/* type="number" で直接入力を容易に */}
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                  value={formData.planned} 
                  onChange={e=>setFormData({...formData, planned: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4">執行額</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                  value={formData.actual} 
                  onChange={e=>setFormData({...formData, actual: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="p-8 bg-gray-50 flex justify-between gap-4 border-t">
            <div className="flex gap-2">
              {formData.id && (
                <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">
                  <Trash2 size={16}/> 削除
                </button>
              )}
              <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">キャンセル</button>
            </div>
            <button type="submit" className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-green-700 transition-all active:scale-95">保存する</button>
          </div>
        </form>
      </div>
    </div>
  );
}