import React from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { BRAND_COLORS, TASK_STATUS } from '../../constants/appConfig';

export default function TaskTable({ tasks, onAddTaskClick, onTaskEdit }) {
  const getStatusColor = (s) => {
    switch (s) {
      case TASK_STATUS.DONE: return BRAND_COLORS.GREEN;
      case TASK_STATUS.IN_PROGRESS: return BRAND_COLORS.ORANGE;
      case TASK_STATUS.PENDING: return BRAND_COLORS.YELLOW;
      default: return BRAND_COLORS.RED;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
        <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg"><ListTodo size={24} className="text-blue-600"/> タスク & WBS 管理</h3>
        <button onClick={() => onAddTaskClick()} 
          className="text-xs font-black bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg">
          <Plus size={18}/>タスクを追加
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
            <tr><th className="px-8 py-5">タスク名</th><th className="px-8 py-5">カテゴリ</th><th className="px-8 py-5">担当者</th><th className="px-8 py-5">期限</th><th className="px-8 py-5 text-right">ステータス</th></tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => onTaskEdit(t)}>
                <td className="px-8 py-6 font-bold text-gray-700 group-hover:text-blue-700">{t.title}</td>
                <td className="px-8 py-6"><span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{t.category}</span></td>
                <td className="px-8 py-6 text-sm font-bold text-gray-500">{t.assignee}</td>
                <td className="px-8 py-6 text-sm text-gray-400">{t.dueDate}</td>
                <td className="px-8 py-6 text-right">
                  <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest" 
                    style={{ backgroundColor: `${getStatusColor(t.status)}15`, color: getStatusColor(t.status) }}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}