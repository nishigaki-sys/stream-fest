// src/pages/common/TaskTable.jsx
import React, { useState, useMemo } from 'react';
import { ListTodo, Plus, Filter, ExternalLink, CornerDownRight } from 'lucide-react'; // CornerDownRightを追加
import { BRAND_COLORS, TASK_STATUS, CATEGORIES } from '../../constants/appConfig';

export default function TaskTable({ tasks, users, onAddTaskClick, onTaskEdit }) {
  const [filter, setFilter] = useState({
    assignee: '',
    status: '',
    category: ''
  });

  const getStatusColor = (s) => {
    switch (s) {
      case TASK_STATUS.DONE: return BRAND_COLORS.GREEN;
      case TASK_STATUS.IN_PROGRESS: return BRAND_COLORS.ORANGE;
      case TASK_STATUS.PENDING: return BRAND_COLORS.YELLOW;
      default: return BRAND_COLORS.RED;
    }
  };

  // 親子関係を考慮したフィルタリングと並び替え
  const displayTasks = useMemo(() => {
    // 1. まず通常のフィルタリング
    const filtered = tasks.filter(t => {
      const matchAssignee = !filter.assignee || t.assignee === filter.assignee;
      const matchStatus = !filter.status || t.status === filter.status;
      const matchCategory = !filter.category || t.category === filter.category;
      return matchAssignee && matchStatus && matchCategory;
    });

    // 2. 親タスクと子タスクをグルーピングして並び替える
    const parents = filtered.filter(t => !t.parentId);
    const children = filtered.filter(t => t.parentId);

    const result = [];
    parents.forEach(parent => {
      result.push(parent); // 親を追加
      const relatedChildren = children.filter(child => child.parentId === parent.id);
      result.push(...relatedChildren); // その親に紐づく子をすぐ下に追加
    });

    // 親が見つからない孤立した子タスクも最後に追加（念のため）
    const orphanChildren = children.filter(child => !parents.find(p => p.id === child.parentId));
    result.push(...orphanChildren);

    return result;
  }, [tasks, filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* フィルタセクション */}
      <div className="bg-white rounded-[1.5rem] border shadow-sm p-6 flex flex-wrap gap-4 items-end">
        {/* ... フィルタの中身 ... */}
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
            <Filter size={10}/> 担当者
          </label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={filter.assignee} onChange={(e) => setFilter({...filter, assignee: e.target.value})}>
            <option value="">全員</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
            <Filter size={10}/> ステータス
          </label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="">すべて</option>
            {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
            <Filter size={10}/> カテゴリ
          </label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={filter.category} onChange={(e) => setFilter({...filter, category: e.target.value})}>
            <option value="">すべて</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => setFilter({assignee: '', status: '', category: ''})} className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600">リセット</button>
      </div>

      {/* テーブルセクション */}
      <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50/30">
          <h3 className="font-black flex items-center gap-3 text-gray-800 text-base">
            <ListTodo size={20} className="text-[#284db3]"/> タスク一覧
          </h3>
          <button onClick={() => onAddTaskClick()} className="text-[10px] font-black bg-[#284db3] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all">
            <Plus size={16}/>タスクを追加
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[9px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-6 py-3 w-[120px]">カテゴリ</th>
                <th className="px-6 py-3">タスク名</th>
                <th className="px-6 py-3">担当者</th>
                <th className="px-6 py-3">期限</th>
                <th className="px-6 py-3 text-right">ステータス / 成果物</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTasks.length > 0 ? displayTasks.map(t => {
                const isChild = !!t.parentId;
                const today = new Date(); today.setHours(0,0,0,0);
                const dueDate = t.dueDate ? new Date(t.dueDate) : null;
                const sevenDaysLater = new Date(); sevenDaysLater.setDate(today.getDate() + 7);

                let rowBgClass = isChild ? "bg-gray-50/20" : "bg-white";
                if (t.status !== TASK_STATUS.DONE && dueDate) {
                  if (dueDate < today) rowBgClass = "bg-red-50/50 hover:bg-red-100/50";
                  else if (dueDate <= sevenDaysLater) rowBgClass = "bg-yellow-50/50 hover:bg-yellow-100/50";
                  else rowBgClass = "hover:bg-blue-50/20";
                } else { rowBgClass += " hover:bg-blue-50/20"; }

                return (
                  <tr key={t.id} className={`transition-colors cursor-pointer group ${rowBgClass}`} onClick={() => onTaskEdit(t)}>
                    {/* 1. カテゴリ (余白を py-3 に縮小) */}
                    <td className="px-6 py-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${isChild ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#284db3]'}`}>
                        {t.category}
                      </span>
                    </td>
                    {/* 2. タスク名 (フォントサイズを text-sm に、余白を縮小) */}
                    <td className={`px-6 py-3 font-bold ${isChild ? 'pl-12 text-gray-500 text-[13px]' : 'text-gray-700 text-sm'}`}>
                      <div className="flex items-center gap-2">
                        {isChild && <CornerDownRight size={12} className="text-gray-300" />}
                        <span>{t.title}</span>
                      </div>
                    </td>
                    {/* 3. 担当者 */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${isChild ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-[#284db3]'}`}>
                          {t.assignee?.[0] || '?'}
                        </div>
                        <span className="text-xs font-bold text-gray-500">{t.assignee || '-'}</span>
                      </div>
                    </td>
                    {/* 4. 期限 */}
                    <td className="px-6 py-3 text-xs text-gray-400 font-medium">{t.dueDate || '-'}</td>
                    {/* 5. ステータス / 成果物 */}
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider" 
                          style={{ backgroundColor: `${getStatusColor(t.status)}15`, color: getStatusColor(t.status) }}>
                          {t.status}
                        </span>
                        {t.deliverableUrl && (
                          <a href={t.deliverableUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-blue-50 text-[#284db3] rounded-md hover:bg-[#284db3] hover:text-white transition-all shadow-sm">
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-bold text-sm">該当するタスクが見つかりません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 運用ルールの明記 (親divの内側に入れます) */}
      <div className="mt-8 p-6 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
        <h4 className="text-xs font-black text-[#284db3] mb-2 flex items-center gap-2">
          <ListTodo size={14}/> タスクの運用ルール
        </h4>
        <p className="text-[11px] text-blue-800/70 leading-relaxed font-bold">
          「考える・作る・調整する」といった<span className="text-[#284db3]">プロセス（行動）</span>を管理します。<br />
          作成物がある場合は、詳細画面の「成果物URL」にリンクを貼り付けることで、準備物リストとの重複を防ぎます。
        </p>
      </div>
    </div>
  );
}