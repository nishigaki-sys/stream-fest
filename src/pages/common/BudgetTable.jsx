import React from 'react';
import { Wallet, Plus } from 'lucide-react';
import { BUDGET_CATEGORIES } from '../../constants/appConfig';

export default function BudgetTable({ budgets, onAddBudgetClick, onBudgetEdit }) {
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
            <tr><th className="px-8 py-5">項目名</th><th className="px-8 py-5">カテゴリ</th><th className="px-8 py-5 text-right">計画額</th><th className="px-8 py-5 text-right">執行額</th><th className="px-8 py-5 text-right">状態</th></tr>
          </thead>
          <tbody>
            {budgets.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-green-50/30 transition-colors cursor-pointer group" onClick={() => onBudgetEdit(b)}>
                <td className="px-8 py-6 font-bold text-gray-700 group-hover:text-green-700">{b.title}</td>
                <td className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase">{b.category}</td>
                <td className="px-8 py-6 text-right font-bold text-gray-400 text-sm">¥{b.planned.toLocaleString()}</td>
                <td className="px-8 py-6 text-right font-black text-gray-800 text-sm">¥{b.actual.toLocaleString()}</td>
                <td className="px-8 py-6 text-right"><span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-lg">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}