// src/components/modals/TaskModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { TASK_STATUS, CATEGORIES } from '../../constants/appConfig';

const db = getFirestore();

export default function TaskModal({ isOpen, onClose, editingItem, users, eventId }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        startDate: editingItem.startDate || '',
        dueDate: editingItem.dueDate || '',
        deliverableUrl: editingItem.deliverableUrl || ''
      });
    }
  }, [editingItem]);

  if (!isOpen || !formData) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const taskData = { 
        ...formData, 
        eventId, 
        status: formData.status || TASK_STATUS.TODO,
        category: formData.category || CATEGORIES[0]
      };
      if (formData.id) {
        const { id, ...data } = taskData;
        await updateDoc(doc(db, "tasks", id), data);
      } else {
        await addDoc(collection(db, "tasks"), taskData);
      }
      onClose();
    } catch (err) { console.error("Save Error:", err); }
  };

  const handleDelete = async () => {
    if (window.confirm("このタスクを削除しますか？")) {
      try {
        await deleteDoc(doc(db, "tasks", formData.id));
        onClose();
      } catch (err) { console.error("Delete Error:", err); }
    }
  };

  // リンクを開く関数
  const handleOpenLink = () => {
    if (formData.deliverableUrl) {
      window.open(formData.deliverableUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const inputBaseClass = "w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm transition-all";
  const labelBaseClass = "text-[10px] font-black text-gray-400 uppercase ml-4 block mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave}>
          <div className="p-8 border-b bg-gray-50/30 sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="font-black text-xl text-gray-800">タスクの設定</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>

          <div className="p-10 space-y-6">
            {/* タスク名 */}
            <div className="space-y-2">
              <label className={labelBaseClass}>Task Name</label>
              <input 
                required 
                className={inputBaseClass} 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="タスク名を入力" 
              />
            </div>

            {/* 成果物URL：リンク遷移ボタン付き */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#284db3] uppercase ml-4 flex items-center gap-1">
                <ExternalLink size={12}/> 成果物・共有フォルダURL
              </label>
              <div className="flex gap-2">
                <input 
                  className={`${inputBaseClass} bg-blue-50/50 flex-1`} 
                  value={formData.deliverableUrl} 
                  onChange={e => setFormData({...formData, deliverableUrl: e.target.value})} 
                  placeholder="GoogleドライブのURLなどを貼り付け" 
                />
                {formData.deliverableUrl && (
                  <button
                    type="button"
                    onClick={handleOpenLink}
                    className="px-4 bg-[#284db3] text-white rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-md active:scale-95"
                    title="リンクを開く"
                  >
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
              <p className="text-[9px] text-gray-400 ml-4 font-bold">URLを入力すると右側のボタンから移動できます</p>
            </div>

            {/* カテゴリ */}
            <div className="space-y-2">
              <label className={labelBaseClass}>タスクカテゴリ</label>
              <select 
                required 
                className={inputBaseClass} 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* 担当者 */}
              <div className="space-y-2">
                <label className={labelBaseClass}>担当者</label>
                <select 
                  className={inputBaseClass} 
                  value={formData.assignee} 
                  onChange={e => setFormData({...formData, assignee: e.target.value})}
                >
                  <option value="">未割り当て</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              {/* ステータス */}
              <div className="space-y-2">
                <label className={labelBaseClass}>ステータス</label>
                <select 
                  className={inputBaseClass} 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* 日付設定 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelBaseClass}>開始日</label>
                <input 
                  type="date" 
                  className={inputBaseClass} 
                  value={formData.startDate} 
                  onChange={e => setFormData({...formData, startDate: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className={labelBaseClass}>期日 (終了日)</label>
                <input 
                  type="date" 
                  className={inputBaseClass} 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex justify-between gap-4 sticky bottom-0 border-t">
            <div className="flex gap-3">
              {formData.id && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16}/> 削除
                </button>
              )}
              <button type="button" onClick={onClose} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600">閉じる</button>
            </div>
            <button type="submit" className="bg-[#284db3] text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95">
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}