import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, Search, Menu, X, ChevronRight, LayoutDashboard, 
  TrendingUp, Kanban as KanbanIcon, ListTodo, Wallet, LogIn 
} from 'lucide-react';
import { onAuthStateChanged, signOut } from "firebase/auth";

// 外部設定・コンポーネントのインポート
import { auth } from './config/firebase';
import { 
  BRAND_COLORS, ROLES, TASK_STATUS, CATEGORIES, BUDGET_CATEGORIES,
  INITIAL_EVENTS, INITIAL_USERS, INITIAL_TASKS, INITIAL_BUDGETS 
} from './constants/appConfig';

// ページ・コンポーネントのインポート
import LoginPage from './pages/auth/LoginPage';
import HQOverview from './pages/hq/HQOverview';
import KanbanBoard from './pages/common/KanbanBoard';
import TaskTable from './pages/common/TaskTable';
import BudgetTable from './pages/common/BudgetTable';

// 共通UIパーツ
const ProgressBar = ({ progress, height = "h-2", color = BRAND_COLORS.BLUE }) => (
  <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
    <div className="h-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}></div>
  </div>
);

export default function App() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('hq-overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // データ管理
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);

  // モーダル管理
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --- Auth logic ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const profile = INITIAL_USERS.find(u => u.email === user.email) || 
                        { name: user.email.split('@')[0], role: ROLES.HQ, email: user.email };
        setCurrentUser(profile);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Memos ---
  const isHQ = currentUser?.role === ROLES.HQ;
  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedEventId) result = result.filter(t => t.eventId === selectedEventId);
    if (searchQuery) result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [tasks, selectedEventId, searchQuery]);

  const filteredBudgets = useMemo(() => {
    return selectedEventId ? budgets.filter(b => b.eventId === selectedEventId) : budgets;
  }, [budgets, selectedEventId]);

  // --- Handlers ---
  const handleLogout = () => signOut(auth);

  const handleEventSelect = (id) => {
    setSelectedEventId(id);
    setActiveTab('event-dashboard');
  };

  const handleTaskUpdate = (taskId, updates, fullTask = null) => {
    if (fullTask) {
      setEditingItem(fullTask);
      setIsTaskModalOpen(true);
    } else if (updates) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
    }
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (editingItem.id) {
      setTasks(tasks.map(t => t.id === editingItem.id ? editingItem : t));
    } else {
      setTasks([...tasks, { ...editingItem, id: Date.now(), eventId: selectedEventId }]);
    }
    setIsTaskModalOpen(false);
  };

  // --- Render Helpers ---
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
    </div>
  );

  if (!isLoggedIn) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r hidden lg:flex flex-col">
        <div className="p-8 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <LayoutDashboard size={22} />
          </div>
          <h1 className="text-xl font-black text-blue-900 uppercase">STREAM FEST.</h1>
        </div>
        <nav className="flex-1 p-6 space-y-1">
          {isHQ && (
            <button onClick={() => { setActiveTab('hq-overview'); setSelectedEventId(null); }} 
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all ${activeTab === 'hq-overview' ? 'bg-blue-600 text-white font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
              <LayoutDashboard size={20}/><span>プロジェクト全体</span>
            </button>
          )}
          <div className="pt-8 pb-3 px-5 text-[10px] font-black text-gray-300 uppercase tracking-widest">Project Admin</div>
          {isHQ && (
            <select className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold mb-4 outline-none" 
              value={selectedEventId || ''} onChange={e => handleEventSelect(e.target.value)}>
              <option value="" disabled>地域を選択...</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          )}
          {[
            { id: 'event-dashboard', icon: TrendingUp, label: 'ダッシュボード', hide: !selectedEventId },
            { id: 'kanban', icon: KanbanIcon, label: 'カンバンボード', hide: !selectedEventId },
            { id: 'tasks', icon: ListTodo, label: 'タスク & WBS', hide: !selectedEventId },
            { id: 'budget', icon: Wallet, label: '予算管理', hide: !selectedEventId },
          ].map(item => !item.hide && (
            <button key={item.id} onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-600 text-white font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
              <item.icon size={20}/><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-gray-400 font-bold hover:text-red-500 rounded-xl transition-all">
            <LogIn className="rotate-180" size={20}/><span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b h-20 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="検索..." className="w-full pl-14 pr-6 py-3 bg-gray-100 rounded-2xl text-sm outline-none" 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 text-gray-400 hover:bg-gray-100 rounded-2xl">
              <Bell size={22}/>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs font-black text-gray-800">{currentUser?.name}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{currentUser?.role}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white">
                {currentUser?.name[0]}
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <span>{isHQ ? 'HQ ACCESS' : 'HOST PORTAL'}</span>
              <ChevronRight size={14}/>
              <span className="text-blue-600">{activeTab.toUpperCase()}</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">{selectedEvent?.name || 'プロジェクト全体'}</h2>
          </div>

          {/* 各ページコンポーネントの切り替え */}
          {activeTab === 'hq-overview' && (
            <HQOverview 
              events={events} tasks={tasks} budgets={budgets} 
              onEventSelect={handleEventSelect} 
              onAddEvent={() => setIsEventModalOpen(true)} 
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard 
              tasks={filteredTasks} currentUser={currentUser} 
              onTaskUpdate={handleTaskUpdate}
              onAddTaskClick={(status) => { 
                setEditingItem({ title: '', status, category: CATEGORIES[0], assignee: currentUser.name, dueDate: '' }); 
                setIsTaskModalOpen(true); 
              }} 
            />
          )}

          {activeTab === 'tasks' && (
            <TaskTable 
              tasks={filteredTasks} 
              onAddTaskClick={() => { 
                setEditingItem({ title: '', status: TASK_STATUS.TODO, category: CATEGORIES[0], assignee: currentUser.name, dueDate: '' }); 
                setIsTaskModalOpen(true); 
              }}
              onTaskEdit={(task) => { setEditingItem(task); setIsTaskModalOpen(true); }}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTable 
              budgets={filteredBudgets} 
              onAddBudgetClick={() => {
                setEditingItem({ title: '', category: BUDGET_CATEGORIES[0], planned: 0, actual: 0, status: '進行中' });
                setIsBudgetModalOpen(true);
              }}
              onBudgetEdit={(budget) => { setEditingItem(budget); setIsBudgetModalOpen(true); }}
            />
          )}
        </div>
      </main>

      {/* --- Task Edit Modal (簡易版) --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">タスクの編集</h3>
              <button onClick={() => setIsTaskModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <input className="w-full p-4 bg-gray-100 rounded-xl outline-none font-bold" 
                placeholder="タスク名" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-4 bg-gray-100 rounded-xl font-bold outline-none" 
                  value={editingItem.status} onChange={e => setEditingItem({...editingItem, status: e.target.value})}>
                  {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" className="p-4 bg-gray-100 rounded-xl font-bold outline-none" 
                  value={editingItem.dueDate} onChange={e => setEditingItem({...editingItem, dueDate: e.target.value})} />
              </div>
              <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-black mt-4">保存する</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}