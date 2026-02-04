import React, { useMemo } from 'react';
import { ListTodo, CalendarDays } from 'lucide-react';
import { BRAND_COLORS, TASK_STATUS } from '../../constants/appConfig';

export default function GanttChart({ tasks, onTaskEdit }) {
  // チャートの表示範囲（月単位）を計算
  const dateRange = useMemo(() => {
    if (tasks.length === 0) return [];
    const dates = tasks.flatMap(t => [new Date(t.startDate), new Date(t.dueDate)]).filter(d => !isNaN(d));
    if (dates.length === 0) return [];
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // 表示期間を少し広げる（前後1ヶ月）
    minDate.setMonth(minDate.getMonth() - 1);
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

  // 日付から位置（%）を計算する関数
  const getPosition = (dateStr) => {
    if (!dateStr || dateRange.length < 2) return 0;
    const date = new Date(dateStr);
    const start = dateRange[0];
    const end = new Date(dateRange[dateRange.length - 1]);
    end.setMonth(end.getMonth() + 1);
    
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
    <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
        <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg">
          <CalendarDays size={24} className="text-[#284db3]"/> ガントチャート
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-6">
          {/* タイムラインヘッダー */}
          <div className="flex border-b pb-4 mb-4">
            <div className="w-1/4 shrink-0 font-black text-[10px] text-gray-400 uppercase">タスク名</div>
            <div className="flex-1 relative flex">
              {dateRange.map((month, i) => (
                <div key={i} className="flex-1 text-center text-[10px] font-black text-gray-400 border-l border-gray-100">
                  {month.getFullYear()}/{month.getMonth() + 1}
                </div>
              ))}
            </div>
          </div>

          {/* タスク行 */}
          <div className="space-y-4">
            {tasks.map((task) => {
              const left = getPosition(task.startDate);
              const right = getPosition(task.dueDate);
              const width = Math.max(right - left, 2); // 最低幅を確保

              return (
                <div key={task.id} className="flex items-center group cursor-pointer" onClick={() => onTaskEdit(task)}>
                  <div className="w-1/4 shrink-0 pr-4">
                    <div className="font-bold text-xs text-gray-700 truncate group-hover:text-[#284db3] transition-colors">
                      {task.title}
                    </div>
                    <div className="text-[8px] text-gray-400 font-bold uppercase">{task.assignee}</div>
                  </div>
                  
                  <div className="flex-1 h-8 relative bg-gray-50/50 rounded-lg overflow-hidden">
                    {/* 背景のグリッド線 */}
                    <div className="absolute inset-0 flex">
                      {dateRange.map((_, i) => (
                        <div key={i} className="flex-1 border-l border-white"></div>
                      ))}
                    </div>
                    
                    {/* ガントバー */}
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
      
      {/* 凡例 */}
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