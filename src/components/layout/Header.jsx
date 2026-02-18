// src/components/layout/Header.jsx
import React from 'react';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestoreData } from '../../hooks/useFirestoreData';

/**
 * ヘッダーコンポーネント
 * プロフィールアイコンを正円に変更し、未読通知バッジを追加
 */
export default function Header({ setIsSidebarOpen, onProfileClick, selectedEventId, searchQuery, setSearchQuery }) {
  const { currentUser } = useAuth();
  
  // 未読チェック用：全メッセージを取得
  const allMessages = useFirestoreData("chats");

  // 現在のプロジェクトに未読メッセージがあるか判定
  const hasUnreadChat = React.useMemo(() => {
    if (!selectedEventId || !currentUser) return false;
    return allMessages.some(msg => 
      msg.eventId === selectedEventId && 
      (!msg.readBy || !msg.readBy.includes(currentUser.uid))
    );
  }, [allMessages, selectedEventId, currentUser]);

  return (
    <header className="h-20 sm:h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-[30]">
      
      {/* 左側：メニューボタン（モバイル用）と検索バー */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={24} className="text-gray-600" />
        </button>
        
        <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl w-full max-w-md border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all group">
          <Search size={18} className="text-gray-400 group-focus-within:text-[#284db3]" />
          <input 
            type="text" 
            placeholder="タスクやメッセージを検索..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
        </div>
      </div>

      {/* 右側：通知とユーザープロフィール */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* 通知ボタン（未読ドット付き） */}
        <button className="relative p-2 sm:p-3 rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-[#284db3] transition-all group">
          <Bell size={22} className="group-hover:scale-110 transition-transform" />
          {hasUnreadChat && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>

        <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

        {/* プロフィール表示エリア */}
        <button 
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-gray-900 leading-none mb-1">
              {currentUser?.name || 'ゲストユーザー'}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {currentUser?.role === 'hq' ? '本部管理ユーザー' : 'プロジェクトメンバー'}
            </p>
          </div>

          {/* アイコン部分：rounded-full で正円に修正 */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm border-2 border-white overflow-hidden shrink-0">
            {currentUser?.avatarUrl ? (
              <img 
                src={currentUser.avatarUrl} 
                alt="User" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-[#284db3] font-black text-base sm:text-lg">
                {currentUser?.name?.[0] || '?'}
              </span>
            )}
          </div>
          
          <ChevronDown size={16} className="text-gray-400 mr-1 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}