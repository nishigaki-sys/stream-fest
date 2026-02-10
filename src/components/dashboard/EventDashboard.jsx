// src/components/dashboard/EventDashboard.jsx
import React, { useMemo } from 'react';
import { TrendingUp, ListTodo, Wallet, CheckCircle2, CalendarDays } from 'lucide-react';
import StatCard from '../ui/StatCard';
import { BRAND_COLORS, TASK_STATUS } from '../../constants/appConfig';

export default function EventDashboard({ selectedEvent, tasks, budgets, currentUser, onTaskClick, onKanbanLink }) {
  // 統計データの計算
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
    const totalActual = budgets.reduce((a, c) => a + c.actual, 0);
    const totalPlanned = budgets.reduce((a, c) => a + c.planned, 0);
    const budgetProgress = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
    
    const myUnfinishedTasks = tasks.filter(t => 
      t.assignee === currentUser?.name && t.status !== TASK_STATUS.DONE
    );

    return {
      taskStats: `${completedTasks} / ${tasks.length}`,
      budgetSpend: totalActual,
      budgetProgress: `${budgetProgress}%`,
      myTasks: myUnfinishedTasks
    };
  }, [tasks, budgets, currentUser]);

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      {/* 統計カード一覧 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="プロジェクト進捗" value={`${selectedEvent?.progress || 0}%`} icon={TrendingUp} color={BRAND_COLORS.BLUE} />
        <StatCard title="タスク完了数" value={stats.taskStats} subValue="完了/全タスク" icon={ListTodo} color={BRAND_COLORS.ORANGE} />
        <StatCard title="予算執行額" value={stats.budgetSpend} icon={Wallet} color={BRAND_COLORS.GREEN} isCurrency />
        <StatCard title="予算消化率" value={stats.budgetProgress} icon={CheckCircle2} color={BRAND_COLORS.RED} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* マイタスク一覧 */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm p-6 sm:p-8">
          <h3 className="font-black text-base sm:text-lg flex items-center gap-3 text-gray-800 mb-6 sm:mb-8">
            <ListTodo size={22} className="text-[#284db3]"/> あなたのタスク
          </h3>
          {stats.myTasks.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {stats.myTasks.map(task => (
                <div key={task.id} onClick={() => onTaskClick(task)} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-[#284db3] transition-all cursor-pointer group bg-gray-50/30">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-1.5 h-8 sm:h-10 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS.BLUE }}></div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-gray-800 truncate group-hover:text-[#284db3]">{task.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400">
                        <span>{task.category}</span>
                        <span className="flex items-center gap-1"><CalendarDays size={10}/> {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg bg-orange-50 text-orange-500">{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400 font-bold text-sm">対応が必要なタスクはありません。</div>
          )}
        </div>

        {/* アクションパネル */}
        <div className="bg-gradient-to-br from-[#284db3] to-blue-500 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl shadow-blue-100">
          <h4 className="font-black text-lg mb-2">Project Message</h4>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 font-medium">ステータスの更新を忘れずに行ってください。</p>
          <button onClick={onKanbanLink} className="w-full bg-white text-[#284db3] py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm hover:shadow-lg transition-all active:scale-95">カンバンを開く</button>
        </div>
      </div>
    </div>
  );
}