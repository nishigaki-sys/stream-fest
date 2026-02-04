import React from 'react';
import { Plus, Building2, Wallet, AlertCircle, Layers, MapPin } from 'lucide-react';
import { BRAND_COLORS } from '../../constants/appConfig';

// 小規模な共通部品
const StatCard = ({ title, value, subValue, icon: Icon, color, isCurrency = false }) => (
  <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md">
    <div className="min-w-0">
      <span className="text-gray-500 text-xs sm:text-sm font-medium block truncate">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl sm:text-2xl font-black" style={{ color }}>{isCurrency ? `¥${value.toLocaleString()}` : value}</span>
        {subValue && <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{subValue}</span>}
      </div>
    </div>
    <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}15`, color: color }}><Icon size={18} /></div>
  </div>
);

const ProgressBar = ({ progress, height = "h-2", color = BRAND_COLORS.BLUE }) => (
  <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
    <div className="h-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}></div>
  </div>
);

export default function HQOverview({ events, tasks, budgets, onEventSelect, onAddEvent }) {
  // 集計ロジック
  const totalPlannedBudget = budgets.reduce((a, c) => a + c.planned, 0);
  const alertTaskCount = tasks.filter(t => t.status !== '完了').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 統計カードセクション */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="開催予定数" value={events.length} subValue="2026年度" icon={Building2} color={BRAND_COLORS.BLUE} />
        <StatCard title="全体予算規模" value={totalPlannedBudget} icon={Wallet} color={BRAND_COLORS.GREEN} isCurrency />
        <StatCard title="要対応アラート" value={alertTaskCount} subValue="未完了タスク" icon={AlertCircle} color={BRAND_COLORS.RED} />
      </div>

      {/* プロジェクト一覧テーブル */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/30">
          <h3 className="font-black flex items-center gap-2 text-gray-700">
            <Layers size={20} className="text-blue-600" /> プロジェクト一覧
          </h3>
          <button 
            type="button"
            onClick={onAddEvent}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={16}/>新規作成
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-6 py-4">プロジェクト</th>
                <th className="px-6 py-4">会場</th>
                <th className="px-6 py-4">進捗</th>
                <th className="px-6 py-4 text-right">予算消化</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => {
                const eventBudgets = budgets.filter(b => b.eventId === ev.id);
                const actualSpend = eventBudgets.reduce((a, c) => a + c.actual, 0);
                
                return (
                  <tr key={ev.id} onClick={() => onEventSelect(ev.id)} className="hover:bg-blue-50/30 border-b last:border-0 cursor-pointer transition-colors group">
                    <td className="px-6 py-5 font-black text-gray-700 group-hover:text-blue-700">{ev.name}</td>
                    <td className="px-6 py-5 text-sm text-gray-500">
                      <div className="flex items-center gap-1"><MapPin size={14}/>{ev.location}</div>
                    </td>
                    <td className="px-6 py-5 w-64"><ProgressBar progress={ev.progress} /></td>
                    <td className="px-6 py-5 text-right font-bold text-sm text-gray-600">¥{actualSpend.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}