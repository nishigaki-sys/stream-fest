import React, { useState } from 'react';
import { Plus, GripVertical, CalendarDays } from 'lucide-react';
import { TASK_STATUS, BRAND_COLORS } from '../../constants/appConfig';

export default function KanbanBoard({ tasks, currentUser, onTaskUpdate, onAddTaskClick }) {
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // ドラッグ開始
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  // ドロップ処理
  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    setDragOverStatus(null);
    onTaskUpdate(taskId, { status: targetStatus });
  };

  return (
    <div className="h-[calc(100vh-250px)] flex gap-6 overflow-x-auto pb-4 no-scrollbar">
      {Object.values(TASK_STATUS).map(status => (
        <div key={status} 
          onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
          onDragLeave={() => setDragOverStatus(null)}
          onDrop={(e) => onDrop(e, status)}
          className={`flex-1 min-w-[320px] rounded-[2rem] p-4 transition-all duration-300 ${
            dragOverStatus === status ? 'bg-blue-100/50 ring-2 ring-blue-400' : 'bg-gray-100/50'
          }`}
        >
          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="font-black text-xs uppercase tracking-widest text-gray-500">{status}</h4>
            <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-black text-gray-400 border shadow-sm">
              {tasks.filter(t => t.status === status).length}
            </span>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.status === status).map(task => (
              <div key={task.id} 
                draggable 
                onDragStart={(e) => onDragStart(e, task.id)}
                onClick={() => onTaskUpdate(task.id, null, task)} // 編集モーダルを開く想定
                className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" 
                    style={{ backgroundColor: `${BRAND_COLORS.BLUE}10`, color: BRAND_COLORS.BLUE }}>
                    {task.category}
                  </span>
                  <GripVertical size={14} className="text-gray-200 group-hover:text-gray-400"/>
                </div>
                <h5 className="font-bold text-sm text-gray-800 leading-snug mb-4 group-hover:text-blue-700">
                  {task.title}
                </h5>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 flex items-center justify-center text-white text-[8px]">
                      {task.assignee ? task.assignee[0] : '?'}
                    </div>
                    {task.assignee}
                  </div>
                  <div className="flex items-center gap-1"><CalendarDays size={12}/>{task.dueDate}</div>
                </div>
              </div>
            ))}

            <button 
              onClick={() => onAddTaskClick(status)}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-gray-400 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} /> <span className="text-xs font-bold">タスクを追加</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}