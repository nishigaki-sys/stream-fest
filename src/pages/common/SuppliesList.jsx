// src/pages/common/SuppliesList.jsx
import React, { useState, useMemo } from 'react';
import { Package, Plus } from 'lucide-react';
import { ITEM_CATEGORIES, ITEM_STATUS } from '../../constants/appConfig';

export default function SuppliesList({ items, users, onAddItemClick, onEditItemClick }) {
  const [filter, setFilter] = useState({ category: '', status: '' });

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return (!filter.category || item.category === filter.category) &&
             (!filter.status || item.status === filter.status);
    });
  }, [items, filter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* フィルタ */}
      <div className="bg-white rounded-[1.5rem] border shadow-sm p-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[150px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">カテゴリ</label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold"
            value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})}>
            <option value="">すべて</option>
            {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase ml-2">ステータス</label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold"
            value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">すべて</option>
            {Object.values(ITEM_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={() => setFilter({category:'', status:''})} className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600">リセット</button>
      </div>

      {/* 一覧 */}
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
          <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg"><Package size={24} className="text-orange-500"/> 準備物リスト</h3>
          <button onClick={onAddItemClick} className="text-xs font-black bg-orange-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg">
            <Plus size={18}/> 準備物を追加
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-8 py-5">詳細名 / カテゴリ</th>
                <th className="px-8 py-5">手配方法 / 先</th>
                <th className="px-8 py-5">数量</th>
                <th className="px-8 py-5">担当者</th>
                <th className="px-8 py-5 text-right">状態</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50/50 cursor-pointer group" onClick={() => onEditItemClick(item)}>
                  {/* 詳細名 / カテゴリ */}
                  <td className="px-8 py-6">
                    <div className="font-bold text-gray-700 group-hover:text-orange-600">{item.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold">{item.category}</div>
                    {item.description && <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</div>}
                  </td>
                  {/* 手配方法 / 先 */}
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-600">{item.method || '-'}</div>
                    <div className="text-[10px] text-gray-400">{item.supplier || '-'}</div>
                  </td>
                  {/* 数量 */}
                  <td className="px-8 py-6 text-sm font-black text-gray-700">{item.quantity || '0'}</td>
                  {/* 担当者 */}
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{item.assignee || '未設定'}</td>
                  {/* 状態 */}
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${
                      item.status === ITEM_STATUS.DONE ? 'bg-green-50 text-green-600' : 
                      item.status === ITEM_STATUS.IN_PROGRESS ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-400'
                    }`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}