// src/components/dashboard/EventDashboard.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ListTodo, 
  Wallet, 
  CheckCircle2, 
  CalendarDays, 
  Package, 
  Save, 
  Megaphone, 
  Edit3 
} from 'lucide-react';
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import StatCard from '../ui/StatCard';
import { BRAND_COLORS, TASK_STATUS, ITEM_STATUS } from '../../constants/appConfig';

const db = getFirestore();

export default function EventDashboard({ 
  selectedEvent, 
  tasks, 
  budgets, 
  supplies, 
  currentUser, 
  onTaskClick, 
  onEditSupplyClick, 
  onKanbanLink 
}) {
  // お知らせ編集用の状態管理
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeText, setNoticeText] = useState(selectedEvent?.announcement || '');

  // イベントが切り替わった際にお知らせ内容を同期
  useEffect(() => {
    setNoticeText(selectedEvent?.announcement || '');
  }, [selectedEvent]);

  // お知らせを保存する関数
  const handleSaveNotice = async () => {
    if (!selectedEvent?.id) return;
    try {
      await updateDoc(doc(db, "events", selectedEvent.id), {
        announcement: noticeText
      });
      setIsEditingNotice(false);
    } catch (err) {
      console.error("Notice Update Error:", err);
      alert("お知らせの保存に失敗しました。");
    }
  };

  // 統計データの計算
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === TASK_STATUS.DONE).length;
    const totalActual = budgets.reduce((a, c) => a + (c.actual || 0), 0);
    const totalPlanned = budgets.reduce((a, c) => a + (c.planned || 0), 0);
    const budgetProgress = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;
    
    // 自分が担当の未完了タスク
    const myUnfinishedTasks = tasks.filter(t => 
      t.assignee === currentUser?.name && t.status !== TASK_STATUS.DONE
    );

    // 自分が担当の未完了準備物
    const myUnfinishedSupplies = (supplies || []).filter(s => 
      s.assignee === currentUser?.name && s.status !== ITEM_STATUS.DONE
    );

    return {
      taskStats: `${completedTasks} / ${tasks.length}`,
      budgetSpend: totalActual,
      budgetProgress: `${budgetProgress}%`,
      myTasks: myUnfinishedTasks,
      mySupplies: myUnfinishedSupplies
    };
  }, [tasks, budgets, supplies, currentUser]);

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
        <div className="lg:col-span-2 space-y-6">
          
          {/* あなたのタスク */}
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm p-6 sm:p-8">
            <h3 className="font-black text-base sm:text-lg flex items-center gap-3 text-gray-800 mb-6 sm:mb-8">
              <ListTodo size={22} className="text-[#284db3]"/> あなたのタスク
            </h3>
            {stats.myTasks.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {stats.myTasks.map(task => {
                  // --- 期限アラートカラー判定ロジック ---
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const sevenDaysLater = new Date();
                  sevenDaysLater.setDate(today.getDate() + 7);

                  let bgColorClass = "bg-gray-50/30"; // デフォルト
                  if (dueDate) {
                    if (dueDate < today) {
                      bgColorClass = "bg-red-50"; // 期限切れ
                    } else if (dueDate <= sevenDaysLater) {
                      bgColorClass = "bg-yellow-50"; // 7日以内
                    }
                  }

                  return (
                    <div 
                      key={task.id} 
                      onClick={() => onTaskClick(task)} 
                      className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-[#284db3] transition-all cursor-pointer group ${bgColorClass}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-1.5 h-8 sm:h-10 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS.BLUE }}></div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm sm:text-base text-gray-800 truncate group-hover:text-[#284db3]">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400">
                            <span>{task.category}</span>
                            <span className="flex items-center gap-1"><CalendarDays size={10}/> {task.dueDate || '期限未設定'}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg bg-blue-50 text-[#284db3]">{task.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 font-bold text-sm">対応が必要なタスクはありません。</div>
            )}
          </div>

          {/* あなたの準備物 */}
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm p-6 sm:p-8">
            <h3 className="font-black text-base sm:text-lg flex items-center gap-3 text-gray-800 mb-6 sm:mb-8">
              <Package size={22} className="text-[#fe9a33]"/> あなたの準備物
            </h3>
            {stats.mySupplies.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {stats.mySupplies.map(item => (
                  <div key={item.id} onClick={() => onEditSupplyClick(item)} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-[#fe9a33] transition-all cursor-pointer group bg-gray-50/30">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-1.5 h-8 sm:h-10 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS.ORANGE }}></div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-gray-800 truncate group-hover:text-[#fe9a33]">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400">
                          <span>{item.category}</span>
                          <span>数量: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-black px-2 py-1 rounded-lg bg-orange-50 text-[#fe9a33]">{item.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 font-bold text-sm">担当している未完了の準備物はありません。</div>
            )}
          </div>
        </div>

        {/* お知らせ・アクションパネル */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[#284db3] to-blue-500 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl shadow-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-lg flex items-center gap-2">
                <Megaphone size={20} /> お知らせ
              </h4>
              {!isEditingNotice ? (
                <button 
                  onClick={() => setIsEditingNotice(true)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all"
                  title="お知らせを編集"
                >
                  <Edit3 size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSaveNotice}
                  className="bg-green-400 hover:bg-green-500 p-2 rounded-full transition-all flex items-center justify-center shadow-lg"
                  title="保存"
                >
                  <Save size={16} />
                </button>
              )}
            </div>

            {isEditingNotice ? (
              <textarea
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/50 min-h-[150px] resize-none font-medium mb-4"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="プロジェクト全体へのメッセージを入力..."
                autoFocus
              />
            ) : (
              <div className="min-h-[150px] mb-4">
                <p className="text-white/90 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedEvent?.announcement || "現在、新しいお知らせはありません。右上のボタンから追加できます。"}
                </p>
              </div>
            )}
            
            <div className="pt-6 border-t border-white/10">
              <button 
                onClick={onKanbanLink} 
                className="w-full bg-white text-[#284db3] py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm hover:shadow-lg transition-all active:scale-95"
              >
                カンバンを開く
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}