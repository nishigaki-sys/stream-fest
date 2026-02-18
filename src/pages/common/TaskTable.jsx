import React, { useState, useMemo } from 'react';
import { ListTodo, Plus, Filter, ExternalLink, CornerDownRight, GitMerge, ChevronRight, ChevronDown } from 'lucide-react';
import { BRAND_COLORS, TASK_STATUS, CATEGORIES, CATEGORY_COLORS } from '../../constants/appConfig';

export default function TaskTable({ tasks, users, onAddTaskClick, onTaskEdit }) {
  const [filter, setFilter] = useState({ assignee: '', status: '', category: '' });
  
  // --- 追加：開閉状態を管理するState（展開されている親タスクのIDを保存） ---
  const [expandedRows, setExpandedRows] = useState(new Set());

  const getStatusColor = (s) => {
    switch (s) {
      case TASK_STATUS.DONE: return BRAND_COLORS.GREEN;
      case TASK_STATUS.IN_PROGRESS: return BRAND_COLORS.ORANGE;
      case TASK_STATUS.PENDING: return BRAND_COLORS.YELLOW;
      default: return BRAND_COLORS.RED;
    }
  };

  // --- 追加：開閉を切り替えるハンドラー ---
  const toggleRow = (e, parentId) => {
    e.stopPropagation(); // 行のクリック（編集）イベントを阻止
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(parentId)) {
      newExpandedRows.delete(parentId);
    } else {
      newExpandedRows.add(parentId);
    }
    setExpandedRows(newExpandedRows);
  };

  const displayTasks = useMemo(() => {
    const filtered = tasks.filter(t => {
      const matchAssignee = !filter.assignee || t.assignee === filter.assignee;
      const matchStatus = !filter.status || t.status === filter.status;
      const matchCategory = !filter.category || t.category === filter.category;
      return matchAssignee && matchStatus && matchCategory;
    });

    const parents = filtered.filter(t => !t.parentId);
    const children = filtered.filter(t => t.parentId);
    const result = [];

    parents.forEach(parent => {
      // 親タスクに「子タスクを持っているか」の判定フラグを付与
      const hasChildren = children.some(child => child.parentId === parent.id);
      result.push({ ...parent, hasChildren });

      // 【アコーディオンロジック】親が展開されている場合のみ、紐づく子タスクを表示用リストに追加
      if (expandedRows.has(parent.id)) {
        const relatedChildren = children.filter(child => child.parentId === parent.id);
        result.push(...relatedChildren);
      }
    });

    // 孤立した子タスク（親がフィルタ等で見つからない場合）は常に表示
    const orphanChildren = children.filter(child => !parents.find(p => p.id === child.parentId));
    result.push(...orphanChildren);

    return result;
  }, [tasks, filter, expandedRows]); // expandedRows を依存配列に追加

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* 1. フィルタセクション */}
      <div className="bg-white rounded-[1.5rem] border shadow-sm p-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-2 text-left">
          <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-1"><Filter size={10}/> 担当者</label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={filter.assignee} onChange={(e) => setFilter({...filter, assignee: e.target.value})}>
            <option value="">全員</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-2 text-left">
          <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-1"><Filter size={10}/> ステータス</label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
            <option value="">すべて</option>
            {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[150px] space-y-2 text-left">
          <label className="text-[10px] font-black text-gray-400 ml-2 flex items-center gap-1"><Filter size={10}/> カテゴリ</label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={filter.category} onChange={(e) => setFilter({...filter, category: e.target.value})}>
            <option value="">すべて</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => setFilter({assignee: '', status: '', category: ''})} className="px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600">リセット</button>
      </div>

      {/* 2. テーブルセクション */}
      <div className="relative">
        <div className="bg-white border border-b-0 rounded-t-[2rem] p-5 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
          <h3 className="font-black flex items-center gap-3 text-gray-800 text-sm">
            <ListTodo size={18} className="text-[#284db3]"/> タスク一覧
          </h3>
          <button onClick={() => onAddTaskClick()} className="text-[10px] font-black bg-[#284db3] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all active:scale-95">
            <Plus size={14}/>タスクを追加
          </button>
        </div>

        <div className="bg-white border rounded-b-[2rem] shadow-sm overflow-visible">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b">
                <th className="sticky top-[73px] z-[90] bg-gray-50 px-6 py-3 w-[110px] text-[9px] font-black uppercase text-gray-400">カテゴリ</th>
                <th className="sticky top-[73px] z-[90] bg-gray-50 px-6 py-3 w-auto text-[9px] font-black uppercase text-gray-400 text-left">タスク名</th>
                <th className="sticky top-[73px] z-[90] bg-gray-50 px-6 py-3 w-[100px] text-[9px] font-black uppercase text-gray-400">担当者</th>
                <th className="sticky top-[73px] z-[90] bg-gray-50 px-6 py-3 w-[90px] text-[9px] font-black uppercase text-gray-400">期限</th>
                <th className="sticky top-[73px] z-[90] bg-gray-50 px-6 py-3 w-[130px] text-[9px] font-black uppercase text-gray-400 text-right">ステータス / 成果物</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayTasks.length > 0 ? displayTasks.map(t => {
                const isChild = !!t.parentId;
                const isExpanded = expandedRows.has(t.id);
                const today = new Date(); today.setHours(0,0,0,0);
                const dueDate = t.dueDate ? new Date(t.dueDate) : null;
                const sevenDaysLater = new Date(); sevenDaysLater.setDate(today.getDate() + 7);

                let rowBgClass = isChild ? "bg-gray-50/20" : "bg-white";
                if (t.status !== TASK_STATUS.DONE && dueDate) {
                  if (dueDate < today) rowBgClass = "bg-red-50/50 hover:bg-red-100/50";
                  else if (dueDate <= sevenDaysLater) rowBgClass = "bg-yellow-50/50 hover:bg-yellow-100/50";
                  else rowBgClass = "hover:bg-blue-50/20";
                } else { rowBgClass += " hover:bg-blue-50/20"; }

                return (
                  <tr key={t.id} className={`transition-all cursor-pointer group ${rowBgClass} ${isChild ? 'animate-in slide-in-from-top-1 duration-200' : ''}`} onClick={() => onTaskEdit(t)}>
                    <td className="px-6 py-2">
                      <span 
                        className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md"
                        style={{ 
                          backgroundColor: `${CATEGORY_COLORS[t.category] || '#eee'}15`, // 背景は透明度15%
                          color: CATEGORY_COLORS[t.category] || '#999'                // 文字はそのままの色
                        }}
                      >
                        {t.category}
                      </span>
                    </td>
                    
                    {/* タスク名セル：子タスクの pl-12 を pl-6 に調整して、アイコン幅で制御します */}
                    <td className={`px-6 py-2 font-bold ${isChild ? 'pl-6 text-gray-500 text-[12px]' : 'text-gray-700 text-sm'}`}>
                      <div className="flex items-center justify-between group/row">
                        <div className="flex items-center">
                          
                          {/* --- アイコンエリア：ここを固定幅にしてテキスト位置を揃える --- */}
                          <div className="w-8 flex shrink-0 items-center justify-center">
                            {!isChild && t.hasChildren ? (
                              <button 
                                onClick={(e) => toggleRow(e, t.id)}
                                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            ) : isChild ? (
                              <CornerDownRight size={12} className="text-gray-300 ml-2" />
                            ) : null}
                          </div>

                          {/* タスク名テキスト：ここが常に左揃えになります */}
                          <span className="truncate">{t.title}</span>
                        </div>

                        {/* 子タスク追加ボタン */}
                        {!isChild && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddTaskClick(t.status, t.id);
                            }}
                            className="opacity-0 group-hover/row:opacity-100 p-1 bg-blue-50 text-[#284db3] rounded-md hover:bg-[#284db3] hover:text-white transition-all ml-2 flex items-center gap-1 shrink-0"
                            title="子タスクを追加"
                          >
                            <GitMerge size={10} />
                            <span className="text-[8px] font-black">SUB</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-2 text-[11px] font-bold text-gray-500 truncate">{t.assignee || '-'}</td>
                    <td className="px-6 py-2 text-[11px] text-gray-400 font-medium">{t.dueDate || '-'}</td>
                    <td className="px-6 py-2 text-right">
                       <div className="flex items-center justify-end gap-2 text-right">
                        <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider" 
                          style={{ backgroundColor: `${getStatusColor(t.status)}15`, color: getStatusColor(t.status) }}>
                          {t.status}
                        </span>
                        {t.deliverableUrl && (
                          <a href={t.deliverableUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-blue-50 text-[#284db3] rounded-md inline-flex">
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 font-bold text-sm">該当するタスクが見つかりません</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-blue-50/50 rounded-[1.5rem] border border-blue-100">
        <h4 className="text-xs font-black text-[#284db3] mb-2 flex items-center gap-2"><ListTodo size={14}/> タスクの運用ルール</h4>
        <p className="text-[11px] text-blue-800/70 leading-relaxed font-bold">
          「考える・作る・調整する」といったプロセスを管理します。<br />
          作成物がある場合は、詳細画面の「成果物URL」にリンクを貼り付けることで、準備物リストとの重複を防ぎます。
        </p>
      </div>
    </div>
  );
}