// src/pages/common/GanttChart.jsx
import React, { useMemo } from 'react';
import { ListTodo, CalendarDays } from 'lucide-react';
import { BRAND_COLORS, TASK_STATUS } from '../../constants/appConfig';

export default function GanttChart({ tasks, onTaskEdit }) {
  const dateRange = useMemo(() => {
    const minDate = new Date();
    minDate.setDate(1); 
    let maxDate;
    if (tasks.length === 0) {
      maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 3);
    } else {
      const dates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.dueDate)]).filter(d => !isNaN(d));
      maxDate = dates.length === 0 ? new Date() : new Date(Math.max(...dates));
    }
    maxDate.setMonth(maxDate.getMonth() + 1);
    const months = [];
    let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    while (current <= maxDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }, [tasks]);

  const getStatusColor = (s) => {
    switch (s) {
      case TASK_STATUS.DONE: return BRAND_COLORS.GREEN;
      case TASK_STATUS.IN_PROGRESS: return BRAND_COLORS.ORANGE;
      case TASK_STATUS.PENDING: return BRAND_COLORS.YELLOW;
      default: return BRAND_COLORS.RED;
    }
  };

  const getPosition = (dateStr) => {
    if (!dateStr || dateRange.length < 2) return 0;
    const date = new Date(dateStr);
    const start = dateRange[0];
    const end = new Date(dateRange[dateRange.length - 1]);
    end.setMonth(end.getMonth() + 1);
    if (date < start) return 0;
    return ((date - start) / (end - start)) * 100;
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border shadow-sm p-10 text-center text-gray-400 font-bold">
        表示するタスクがありません。
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm animate-in fade-in">
      <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
        <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg">
          <CalendarDays size={24} className="text-[#284db3]"/> ガントチャート（本日開始）
        </h3>
      </div>
      
      {/* 【修正のポイント】
        縦スクロール時に見出しを固定するために、overflow-x-auto を内側の要素に持たせ、
        見出しと行のまとまりを独立させます。
      */}
      <div className="relative">
        
        {/* スケジュール見出し（年月）: 独立させて sticky top-20 を指定 */}
        <div className="sticky top-20 z-30 bg-white border-b">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[800px] px-6 py-4 flex bg-white/95 backdrop-blur-sm">
              <div className="w-1/4 shrink-0 font-black text-[10px] text-gray-400 uppercase">タスク名</div>
              <div className="flex-1 relative flex">
                {dateRange.map((month, i) => (
                  <div key={i} className="flex-1 text-center text-[10px] font-black text-gray-400 border-l border-gray-100">
                    {month.getFullYear()}/{month.getMonth() + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* タスク行エリア: 横スクロール可能にする */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-6 space-y-4">
            {tasks.map((task) => {
              const left = getPosition(task.startDate);
              const right = getPosition(task.dueDate);
              const width = Math.max(right - left, 0);

              if (new Date(task.dueDate) < dateRange[0]) return null;

              return (
                <div key={task.id} className="flex items-center group cursor-pointer" onClick={() => onTaskEdit(task)}>
                  <div className="w-1/4 shrink-0 pr-4">
                    <div className="font-bold text-xs text-gray-700 truncate group-hover:text-[#284db3] transition-colors">
                      {task.title}
                    </div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase">{task.assignee}</div>
                  </div>
                  
                  <div className="flex-1 h-8 relative bg-gray-50/50 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex">
                      {dateRange.map((_, i) => (
                        <div key={i} className="flex-1 border-l border-white"></div>
                      ))}
                    </div>
                    
                    <div 
                      className="absolute h-4 top-2 rounded-full shadow-sm transition-all group-hover:brightness-110"
                      style={{ 
                        left: `${left}%`, 
                        width: `${width}%`, 
                        backgroundColor: getStatusColor(task.status)
                      }}
                    >
                      <div className="absolute -top-6 left-0 text-[8px] font-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {task.startDate} 〜 {task.dueDate}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50/50 border-t flex gap-6">
        {Object.entries(TASK_STATUS).map(([key, status]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(status) }}></div>
            <span className="text-[10px] font-black text-gray-500">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}