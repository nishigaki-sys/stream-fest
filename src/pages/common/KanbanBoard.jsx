import React, { useState } from 'react';
import { Plus, GripVertical, CalendarDays } from 'lucide-react';
import { TASK_STATUS, BRAND_COLORS } from '../../constants/appConfig';

export default function KanbanBoard({ tasks, currentUser, onTaskUpdate, onAddTaskClick }) {
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const onDragLeave = () => {
    setDragOverStatus(null);
  };

  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDragOverStatus(null);

    if (taskId) {
      onTaskUpdate(taskId, { status: targetStatus });
    }
  };

  return (
    /* 修正ポイント:
      1. h-[calc(100vh-250px)] を削除し、高さがコンテンツに応じて伸びるように変更。
      2. overflow-x-auto を削除し、横スクロールもブラウザ側に任せる。
      3. flex-col sm:flex-row を維持しつつ、items-start を追加してカラムが不必要に縦に伸びないように調整。
    */
    <div className="flex flex-col sm:flex-row gap-6 pb-8 pt-2 px-2 items-start">
      {Object.values(TASK_STATUS).map(status => (
        <div key={status} 
          onDragOver={(e) => onDragOver(e, status)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, status)}
          /* 各カラムの高さも auto にし、中身に応じて伸びるように設定 */
          className={`flex-1 min-w-full sm:min-w-[320px] sm:max-w-[320px] rounded-[2rem] p-4 transition-all duration-300 ${
            dragOverStatus === status 
              ? 'bg-blue-100/50 ring-4 ring-[#284db3] ring-inset' 
              : 'bg-gray-100/50'
          }`}
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">{status}</h4>
            <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-black text-gray-400 border shadow-sm">
              {tasks.filter(t => t.status === status).length}
            </span>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} 
                draggable 
                onDragStart={(e) => onDragStart(e, task.id)}
                onClick={() => onTaskUpdate(task.id, null, task)}
                className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full" 
                    style={{ backgroundColor: `${BRAND_COLORS.BLUE}10`, color: BRAND_COLORS.BLUE }}>
                    {task.category}
                  </span>
                  <GripVertical size={14} className="text-gray-200 group-hover:text-gray-400"/>
                </div>
                <h5 className="font-bold text-xs sm:text-sm text-gray-800 leading-snug mb-4 group-hover:text-[#284db3]">
                  {task.title}
                </h5>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[9px] sm:text-[10px] font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#284db3] flex items-center justify-center text-white text-[8px]">
                      {task.assignee ? task.assignee[0] : '?'}
                    </div>
                    <span className="truncate max-w-[80px] sm:max-w-none">{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0"><CalendarDays size={12}/>{task.dueDate}</div>
                </div>
              </div>
            ))}

            <button 
              onClick={() => onAddTaskClick(status)}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-gray-400 hover:bg-white hover:border-[#284db3] hover:text-[#284db3] transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> <span className="text-xs font-bold">タスクを追加</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}