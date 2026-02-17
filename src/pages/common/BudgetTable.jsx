// src/pages/common/BudgetTable.jsx
import React, { useState, useMemo } from 'react'; 
import { Wallet, Plus, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'; // アイコン追加

export default function BudgetTable({ budgets, onAddBudgetClick, onBudgetEdit }) {
  // 並び替え状態の管理
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });

  // 並び替えロジック
  const sortedBudgets = useMemo(() => {
    let sortableItems = [...budgets];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [budgets, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ソートアイコン表示用
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={12} className="ml-1 opacity-30" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} className="ml-1 text-green-600" /> 
      : <ChevronDown size={12} className="ml-1 text-green-600" />;
  };

  return (
    <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
      <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
        <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg"><Wallet size={24} className="text-green-600"/> 予算詳細・執行状況</h3>
        <button onClick={() => onAddBudgetClick()} 
          className="text-xs font-black bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
          <Plus size={18}/>予算項目を追加
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
            <tr>
              <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => requestSort('title')}>
                <div className="flex items-center">項目名 {getSortIcon('title')}</div>
              </th>
              <th className="px-8 py-5 cursor-pointer hover:text-gray-600 transition-colors" onClick={() => requestSort('category')}>
                <div className="flex items-center">カテゴリ {getSortIcon('category')}</div>
              </th>
              <th className="px-8 py-5 text-right cursor-pointer hover:text-gray-600 transition-colors" onClick={() => requestSort('planned')}>
                <div className="flex items-center justify-end">計画額 {getSortIcon('planned')}</div>
              </th>
              <th className="px-8 py-5 text-right cursor-pointer hover:text-gray-600 transition-colors" onClick={() => requestSort('actual')}>
                <div className="flex items-center justify-end">執行額 {getSortIcon('actual')}</div>
              </th>
              <th className="px-8 py-5 text-right">状態</th>
            </tr>
          </thead>
          <tbody>
            {/* sortedBudgets を map するように変更 */}
            {sortedBudgets.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-green-50/30 transition-colors cursor-pointer group" onClick={() => onBudgetEdit(b)}>
                <td className="px-8 py-6 font-bold text-gray-700 group-hover:text-green-700">{b.title}</td>
                <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">{b.category}</td>
                <td className="px-8 py-6 text-right font-bold text-gray-400 text-sm">¥{(b.planned || 0).toLocaleString()}</td>
                <td className="px-8 py-6 text-right font-black text-gray-800 text-sm">¥{(b.actual || 0).toLocaleString()}</td>
                <td className="px-8 py-6 text-right"><span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-lg">{b.status || '未設定'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}