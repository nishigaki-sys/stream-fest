import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, ExternalLink, GitBranch, AlertCircle, Package } from 'lucide-react';
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { TASK_STATUS, CATEGORIES } from '../../constants/appConfig';
import { useFirestoreData } from '../../hooks/useFirestoreData';

const db = getFirestore();

export default function TaskModal({ isOpen, onClose, editingItem, users, eventId }) {
  const [formData, setFormData] = useState(null);
  const allTasks = useFirestoreData("tasks");

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        startDate: editingItem.startDate || '',
        dueDate: editingItem.dueDate || '',
        deliverableUrl: editingItem.deliverableUrl || '',
        parentId: editingItem.parentId || '',
      });
    }
  }, [editingItem]);

  const parentTaskOptions = useMemo(() => {
    return allTasks.filter(t => 
      t.eventId === eventId && 
      t.id !== editingItem?.id && 
      !t.parentId
    );
  }, [allTasks, eventId, editingItem]);

  const isDuplicate = useMemo(() => {
    if (!formData?.title) return false;
    return allTasks.some(t => 
      t.eventId === eventId && 
      t.title.trim() === formData.title.trim() && 
      t.id !== formData.id
    );
  }, [allTasks, eventId, formData?.title, formData?.id]);

  if (!isOpen || !formData) return null;

  const isChild = !!formData.parentId;

  const handleSave = async (e) => {
    e.preventDefault();
    if (isDuplicate) {
      alert(`「${formData.title}」は既に登録されています。`);
      return;
    }

    try {
      let finalCategory = formData.category || CATEGORIES[0];
      if (isChild) {
        const parentTask = allTasks.find(t => t.id === formData.parentId);
        if (parentTask) finalCategory = parentTask.category;
      }

      const taskData = { 
        ...formData, 
        eventId, 
        status: formData.status || TASK_STATUS.TODO,
        category: finalCategory
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

  const handleCopyToSupply = async () => {
    if (!window.confirm("このタスクを準備物リストにコピーしますか？")) return;
    try {
      const supplyData = {
        name: formData.title,
        category: "会場備品・消耗品",
        status: "TODO",
        method: "購入",
        quantity: "1",
        eventId: eventId,
        linkedTaskId: formData.id || '',
        description: `タスク「${formData.title}」からコピーされました。`
      };
      await addDoc(collection(db, "supplies"), supplyData);
      alert("準備物リストにコピーしました。");
    } catch (err) { console.error(err); }
  };

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
            <div className="space-y-2">
              <label className={`${labelBaseClass} text-blue-600 flex items-center gap-1`}>
                <GitBranch size={12}/> 関連付け（親タスク）
              </label>
              <select 
                className={`${inputBaseClass} bg-blue-50/30 text-blue-900`}
                value={formData.parentId}
                onChange={e => setFormData({...formData, parentId: e.target.value})}
              >
                <option value="">親タスクなし（大項目として登録）</option>
                {parentTaskOptions.map(t => (
                  <option key={t.id} value={t.id}>[{t.category}] {t.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className={labelBaseClass}>タスク名</label>
              <input 
                required 
                className={`${inputBaseClass} ${isDuplicate ? 'ring-2 ring-red-500 bg-red-50' : ''}`} 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="タスク名を入力" 
              />
              {isDuplicate && (
                <p className="text-[10px] text-red-500 font-bold ml-4 flex items-center gap-1 mt-1">
                  <AlertCircle size={12}/> 同じ名前のタスクが既に登録されています
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className={labelBaseClass}>成果物・共有フォルダURL</label>
              <div className="flex gap-2">
                <input className={`${inputBaseClass} bg-blue-50/50 flex-1`} value={formData.deliverableUrl} onChange={e => setFormData({...formData, deliverableUrl: e.target.value})} placeholder="URLを貼り付け" />
                {formData.deliverableUrl && (
                  <button type="button" onClick={handleOpenLink} className="px-4 bg-[#284db3] text-white rounded-2xl hover:bg-blue-700 shadow-md">
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {!isChild ? (
                <div className="space-y-2">
                  <label className={labelBaseClass}>工程カテゴリ</label>
                  <select required className={inputBaseClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className={labelBaseClass}>工程カテゴリ</label>
                  <div className="px-6 py-4 bg-gray-100 text-gray-400 rounded-2xl text-sm font-bold">親タスクに依存</div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className={labelBaseClass}>ステータス</label>
                <select className={inputBaseClass} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelBaseClass}>担当者</label>
                <select className={inputBaseClass} value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})}>
                  <option value="">未割り当て</option>
                  {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelBaseClass}>期限</label>
                <input type="date" className={inputBaseClass} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 flex justify-between gap-4 sticky bottom-0 border-t">
            <div className="flex gap-2">
              {formData.id && (
                <>
                  <button type="button" onClick={handleDelete} className="flex items-center gap-2 px-4 py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={14}/> 削除
                  </button>
                  <button type="button" onClick={handleCopyToSupply} className="flex items-center gap-2 px-4 py-4 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black hover:bg-orange-500 hover:text-white transition-all">
                    <Package size={14}/> 準備物へ
                  </button>
                </>
              )}
              <button type="button" onClick={onClose} className="px-6 py-4 font-bold text-gray-400 hover:text-gray-600 text-sm">閉じる</button>
            </div>
            <button 
              type="submit" 
              disabled={isDuplicate}
              className={`px-10 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 ${isDuplicate ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#284db3] text-white hover:bg-blue-700'}`}
            >
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}