import React, { useState, useMemo } from 'react';
import { ListTodo, Plus, Search, Filter, Trash2 } from 'lucide-react';
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

  // フィルタリングロジック
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchAssignee = !filter.assignee || t.assignee === filter.assignee;
      const matchStatus = !filter.status || t.status === filter.status;
      const matchCategory = !filter.category || t.category === filter.category;
      return matchAssignee && matchStatus && matchCategory;
    });
  }, [tasks, filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* フィルタセクション */}
      <div className="bg-white rounded-[1.5rem] border shadow-sm p-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
            <Filter size={10}/> 担当者
          </label>
          <select 
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]"
            value={filter.assignee}
            onChange={(e) => setFilter({...filter, assignee: e.target.value})}
          >
            <option value="">全員</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
            <Filter size={10}/> ステータス
          </label>
          <select 
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="">すべて</option>
            {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
            <Filter size={10}/> カテゴリ
          </label>
          <select 
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]"
            value={filter.category}
            onChange={(e) => setFilter({...filter, category: e.target.value})}
          >
            <option value="">すべて</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <button 
          onClick={() => setFilter({assignee: '', status: '', category: ''})}
          className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          リセット
        </button>
      </div>

      {/* テーブルセクション */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
          <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg">
            <ListTodo size={24} className="text-[#284db3]"/> タスク一覧
          </h3>
          <button onClick={() => onAddTaskClick()} 
            className="text-xs font-black bg-[#284db3] text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            <Plus size={18}/>タスクを追加
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-8 py-5">タスク名</th>
                <th className="px-8 py-5">カテゴリ</th>
                <th className="px-8 py-5">担当者</th>
                <th className="px-8 py-5">期限</th>
                <th className="px-8 py-5 text-right">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? filteredTasks.map(t => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => onTaskEdit(t)}>
                  <td className="px-8 py-6 font-bold text-gray-700 group-hover:text-[#284db3]">{t.title}</td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[#284db3] text-[10px] font-black">
                        {t.assignee?.[0] || '?'}
                      </div>
                      <span className="text-sm font-bold text-gray-500">{t.assignee || '未設定'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400 font-medium">{t.dueDate || '-'}</td>
                  <td className="px-8 py-6 text-right">
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest" 
                      style={{ backgroundColor: `${getStatusColor(t.status)}15`, color: getStatusColor(t.status) }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 font-bold">
                    該当するタスクが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}