// src/components/layout/Header.jsx
import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

export default function Header({ title, user, onMenuClick }) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b h-16 sm:h-20 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <Menu size={24} />
        </button>
        <div className="relative max-w-xs sm:max-w-md w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" placeholder="検索..." 
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-100 border-none rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#284db3] outline-none font-medium transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-6 ml-2">
        <button className="relative p-2 sm:p-3 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all">
          <Bell size={20}/>
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs font-black text-gray-800">{user?.name}</div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user?.role}</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
            <span className="text-[#284db3] font-black text-sm sm:text-lg">{user?.name?.[0]}</span>
          </div>
        </div>
      </div>
    </header>
  );
}