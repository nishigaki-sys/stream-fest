// src/components/layout/Sidebar.jsx
import React from 'react';
import { 
  X, LayoutDashboard, Users, TrendingUp, ListTodo, 
  CalendarDays, Package, Wallet, MessageSquare, LogIn, Kanban, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext'; // 認証Contextを使用
import { ROLES } from '../../constants/appConfig'; // 権限定義を使用
import SidebarItem from '../ui/SidebarItem'; // 共通UIパーツを使用

/**
 * サイドバーコンポーネント
 * デスクトップ: 画面左側に粘着固定 (sticky)
 * モバイル: ハンバーガーメニューからスライドイン
 */
export default function Sidebar({ 
  isOpen, setIsOpen, activeTab, setActiveTab, events, selectedEventId, setSelectedEventId 
}) {
  const { signOut, currentUser } = useAuth(); // ログアウト関数とユーザー情報を取得

  // プロジェクト（地域）変更時の処理
  const handleEventChange = (id) => {
    setSelectedEventId(id);
    setActiveTab('event-dashboard'); // プロジェクト選択時はダッシュボードへ遷移
    setIsOpen(false); // モバイル表示ならメニューを閉じる
  };

  return (
    <>
      {/* モバイル用背景オーバーレイ (メニューが開いている時のみ表示) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* サイドバー本体: sticky top-0 h-screen によりスクロールに追従 */}
      <aside className={`fixed inset-y-0 left-0 z-[50] w-72 bg-[#284db3] transition-transform duration-300 lg:relative lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen flex flex-col text-white ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* ロゴ・ヘッダーエリア */}
        <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center overflow-hidden p-1">
              <img src="/STREAM_FESTアイコン.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">STREAM FEST.</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* ナビゲーションメニューエリア */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
          {/* 本部 (HQ) 権限専用メニュー */}
          {currentUser?.role === ROLES.HQ && (
            <>
              <SidebarItem 
                icon={LayoutDashboard} label="プロジェクト全体" 
                active={activeTab === 'hq-overview'} 
                onClick={() => { setActiveTab('hq-overview'); setSelectedEventId(null); setIsOpen(false); }} 
              />
              <div className="py-2">
                <select 
                  className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm font-bold text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-white" 
                  value={selectedEventId || ''} 
                  onChange={e => handleEventChange(e.target.value)}
                >
                  <option value="" disabled className="text-gray-800">地域を選択...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id} className="text-gray-800">{ev.name}</option>)}
                </select>
              </div>
              <SidebarItem 
                icon={Users} label="メンバー管理" 
                active={activeTab === 'hq-members'} 
                onClick={() => { setActiveTab('hq-members'); setSelectedEventId(null); setIsOpen(false); }} 
              />
            </>
          )}

          {/* プロジェクト固有メニュー (イベント選択時のみ表示) */}
          {selectedEventId && (
            <div className="pt-8 space-y-2 animate-in slide-in-from-top-2">
              <div className="px-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Project Menu</div>
              <SidebarItem icon={TrendingUp} label="ダッシュボード" active={activeTab === 'event-dashboard'} onClick={() => { setActiveTab('event-dashboard'); setIsOpen(false); }} />
              <SidebarItem icon={ListTodo} label="タスク一覧" active={activeTab === 'task-list'} onClick={() => { setActiveTab('task-list'); setIsOpen(false); }} />
              <SidebarItem icon={Kanban} label="カンバンボード" active={activeTab === 'kanban'} onClick={() => { setActiveTab('kanban'); setIsOpen(false); }} />
              <SidebarItem icon={CalendarDays} label="ガントチャート" active={activeTab === 'tasks'} onClick={() => { setActiveTab('tasks'); setIsOpen(false); }} />
              <SidebarItem icon={Package} label="準備物リスト" active={activeTab === 'supplies'} onClick={() => { setActiveTab('supplies'); setIsOpen(false); }} />
              <SidebarItem icon={Wallet} label="予算管理" active={activeTab === 'budget'} onClick={() => { setActiveTab('budget'); setIsOpen(false); }} />
              <SidebarItem icon={MessageSquare} label="チャット" active={activeTab === 'chat'} onClick={() => { setActiveTab('chat'); setIsOpen(false); }} />
              {/* プロジェクト設定 (コピー機能等) へのリンク */}
              <SidebarItem icon={Settings} label="プロジェクト設定" active={activeTab === 'event-settings'} onClick={() => { setActiveTab('event-settings'); setIsOpen(false); }} />
            </div>
          )}
        </nav>

        {/* ログアウトボタン (サイドバー最下部に固定) */}
        <div className="p-6 border-t border-white/10 bg-[#284db3]/50 shrink-0">
          <button 
            onClick={signOut} 
            className="w-full flex items-center gap-3 px-5 py-4 text-white/70 font-bold hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <LogIn className="rotate-180" size={20}/>
            <span>ログアウト</span>
          </button>
        </div>
      </aside>
    </>
  );
}