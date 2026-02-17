// src/pages/common/KanbanBoard.jsx
import React, { useState } from 'react';
import { Plus, GripVertical, CalendarDays, ExternalLink, GitMerge } from 'lucide-react';
import { TASK_STATUS, BRAND_COLORS } from '../../constants/appConfig';

export default function KanbanBoard({ tasks, currentUser, onTaskUpdate, onAddTaskClick, onTaskEdit }) {
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // ドラッグ開始
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグ中（枠の上に来た時）
  const onDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  // 枠から外れた時
  const onDragLeave = () => {
    setDragOverStatus(null);
  };

  // ドロップした時
  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    setDragOverStatus(null);

    if (taskId && onTaskUpdate) {
      onTaskUpdate(taskId, { status: targetStatus });
    }
  };

  // 親タスク名をIDから取得
  const getParentTitle = (parentId) => {
    const parent = tasks.find(t => t.id === parentId);
    return parent ? parent.title : '不明な親タスク';
  };

  return (
    /* w-full と items-stretch により、全カラムの高さを揃え、
      横幅を画面内に収めます。
    */
    <div className="flex flex-row gap-4 pb-10 pt-2 px-1 w-full items-stretch overflow-x-auto lg:overflow-x-visible">
      {Object.values(TASK_STATUS).map(status => (
        <div key={status} 
          onDragOver={(e) => onDragOver(e, status)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, status)}
          /* min-h-[70vh] を設定することで、タスクが空のカラムでも
            常にドロップ可能な領域が画面下部まで確保されます。
          */
          className={`flex-1 min-w-[280px] md:min-w-0 min-h-[75vh] rounded-[1.5rem] p-3 transition-all duration-300 flex flex-col ${
            dragOverStatus === status 
              ? 'bg-blue-100/60 ring-4 ring-[#284db3] ring-inset' 
              : 'bg-gray-100/50'
          }`}
        >
          {/* カラムヘッダー（常に上部に表示） */}
          <div className="flex justify-between items-center mb-4 px-2 shrink-0">
            <h4 className="font-black text-[10px] uppercase tracking-widest text-gray-500">{status}</h4>
            <span className="bg-white px-2 py-0.5 rounded-lg text-[9px] font-black text-gray-400 border shadow-sm">
              {tasks.filter(t => t.status === status).length}
            </span>
          </div>

          {/* タスクカードエリア：flex-grow で下まで領域を広げます */}
          <div className="space-y-3 flex-grow">
            {tasks.filter(t => t.status === status).map(task => {
              const isChild = !!task.parentId;
              const today = new Date(); today.setHours(0,0,0,0);
              const dueDate = task.dueDate ? new Date(task.dueDate) : null;
              const sevenDaysLater = new Date(); sevenDaysLater.setDate(today.getDate() + 7);

              let bgColorClass = "bg-white border-gray-100";
              if (task.status !== TASK_STATUS.DONE && dueDate) {
                if (dueDate < today) bgColorClass = "bg-red-50 border-red-200";
                else if (dueDate <= sevenDaysLater) bgColorClass = "bg-yellow-50 border-yellow-200";
              }

              return (
                <div key={task.id} 
                  draggable 
                  onDragStart={(e) => onDragStart(e, task.id)}
                  onClick={() => onTaskEdit(task)}
                  className={`p-3 rounded-[1.2rem] shadow-sm border transition-all cursor-grab active:cursor-grabbing group ${bgColorClass} hover:shadow-md relative overflow-hidden`}
                >
                  {/* 子タスクインジケーター */}
                  {isChild && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200"></div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-1 max-w-[85%]">
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full" 
                        style={{ backgroundColor: `${BRAND_COLORS.BLUE}10`, color: BRAND_COLORS.BLUE }}>
                        {task.category}
                      </span>
                      {isChild && (
                        <span className="text-[8px] font-black flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 truncate max-w-[120px]">
                          <GitMerge size={8}/> {getParentTitle(task.parentId)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {task.deliverableUrl && (
                        <a href={task.deliverableUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 text-[#284db3] hover:bg-blue-50 rounded-md">
                          <ExternalLink size={12} />
                        </a>
                      )}
                      <GripVertical size={12} className="text-gray-200 group-hover:text-gray-400"/>
                    </div>
                  </div>

                  <h5 className={`font-bold text-[13px] leading-snug mb-3 group-hover:text-[#284db3] line-clamp-2 ${isChild ? 'text-gray-600' : 'text-gray-800'}`}>
                    {task.title}
                  </h5>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-[9px] font-bold text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] ${isChild ? 'bg-gray-400' : 'bg-[#284db3]'}`}>
                        {task.assignee ? task.assignee[0] : '?'}
                      </div>
                      <span className="truncate max-w-[60px]">{task.assignee || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CalendarDays size={10}/>
                      <span className={task.status !== TASK_STATUS.DONE && dueDate && dueDate <= sevenDaysLater ? "text-red-500 font-black" : ""}>
                        {task.dueDate || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* カラム内追加ボタン */}
            <button 
              onClick={() => onAddTaskClick(status)} 
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-[1.2rem] text-gray-400 hover:bg-white hover:border-[#284db3] hover:text-[#284db3] transition-all flex items-center justify-center gap-2 shrink-0 mt-2"
            >
              <Plus size={16} /> <span className="text-[10px] font-bold">追加</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}