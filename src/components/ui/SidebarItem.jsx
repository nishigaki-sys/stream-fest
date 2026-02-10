// src/components/ui/SidebarItem.jsx
import React from 'react';

/**
 * サイドバーの各ボタン
 * @param {LucideIcon} icon - 表示するアイコン
 * @param {string} label - 表示名
 * @param {boolean} active - 現在選択中かどうか
 * @param {function} onClick - クリック時の処理
 */
export default function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${
        active 
          ? 'bg-white text-[#284db3] font-bold shadow-xl' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon size={20}/>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}