// src/pages/common/BudgetTable.jsx
import React, { useMemo } from 'react';
import { Wallet, Plus } from 'lucide-react';

export default function BudgetTable({ budgets, onAddBudgetClick, onBudgetEdit }) {
  // データをカテゴリ順、その中でタイトル順に並び替える
  const sortedBudgets = useMemo(() => {
    return [...budgets].sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [budgets]);

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
        <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg">
          <Wallet size={24} className="text-green-600"/> 予算詳細・執行状況
        </h3>
        <button onClick={() => onAddBudgetClick()} 
          className="text-xs font-black bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
          <Plus size={18}/>予算項目を追加
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
            <tr>
              <th className="px-8 py-5">カテゴリ</th>
              <th className="px-8 py-5">項目名</th>
              <th className="px-8 py-5 text-right">予算額 (計画)</th>
              <th className="px-8 py-5 text-right">執行額</th>
              <th className="px-8 py-5 text-right">状態 (消化率)</th>
            </tr>
          </thead>
          <tbody>
            {sortedBudgets.map((b) => {
              // 消化率の計算
              const ratio = b.planned > 0 ? Math.round((b.actual / b.planned) * 100) : 0;
              
              return (
                <tr key={b.id} className="border-b last:border-0 hover:bg-green-50/30 transition-colors cursor-pointer group" onClick={() => onBudgetEdit(b)}>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-lg">
                      {b.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-700 group-hover:text-green-700">
                    {b.title}
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-gray-400 text-sm">
                    ¥{(b.planned || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right font-black text-gray-800 text-sm">
                    ¥{(b.actual || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-black ${ratio > 100 ? 'text-red-500' : 'text-green-600'}`}>
                        {ratio}%
                      </span>
                      {/* 簡易的な進捗バーの表示 */}
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${ratio > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}