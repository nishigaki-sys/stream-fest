// src/components/layout/Header.jsx
import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

export default function Header({ title, user, onMenuClick, onProfileClick }) { // onProfileClickを追加
  return (
    <header className="bg-white/80 backdrop-blur-md border-b h-16 sm:h-20 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30 shrink-0">
      {/* ... 検索バー部分は既存のまま ... */}
      
      <div className="flex items-center gap-2 sm:gap-6 ml-2">
        <button className="relative p-2 sm:p-3 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all">
          <Bell size={20}/>
        </button>
        
        {/* アイコン部分をボタン化 */}
        <button 
          onClick={onProfileClick} 
          className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-all text-left"
        >
          <div className="text-right hidden md:block">
            <div className="text-xs font-black text-gray-800">{user?.name}</div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user?.role}</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
            {/* avatarUrl があれば画像を表示、なければイニシャルを表示 */}
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#284db3] font-black text-sm sm:text-lg">{user?.name?.[0]}</span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}