import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, ListTodo, Bell, Search, Plus, CheckCircle2,
  Menu, X, ChevronRight, TrendingUp, Layers, CalendarDays,
  Wallet, Kanban as KanbanIcon, Lock, Mail, LogIn,
  MapPin, Pencil, Trash2, Save, Users, Shield, AlertTriangle, Settings, MessageSquare
} from 'lucide-react';

// Firebase SDK & Config
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDocs, writeBatch
} from "firebase/firestore"; 
import { auth } from './config/firebase';

// Constants & Initial Data
import { 
  BRAND_COLORS, ROLES, TASK_STATUS, BUDGET_CATEGORIES, CATEGORIES 
} from './constants/appConfig';

// Page Components
import LoginPage from './pages/auth/LoginPage';
import HQOverview from './pages/hq/HQOverview';
import HQMemberManagement from './pages/hq/HQMemberManagement';
import KanbanBoard from './pages/common/KanbanBoard';
import GanttChart from './pages/common/GanttChart'; 
import BudgetTable from './pages/common/BudgetTable';
import ChatView from './pages/common/ChatView';
import TaskTable from './pages/common/TaskTable';

const db = getFirestore();

/**
 * 共通コンポーネント: 統計カード (KPI用)
 */
const StatCard = ({ title, value, subValue, icon: Icon, color, isCurrency = false }) => (
  <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md">
    <div className="min-w-0">
      <span className="text-gray-500 text-[10px] sm:text-sm font-medium block truncate">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-lg sm:text-2xl font-black" style={{ color }}>
          {isCurrency ? `¥${Number(value).toLocaleString()}` : value}
        </span>
        {subValue && <span className="text-[8px] sm:text-xs text-gray-400 whitespace-nowrap">{subValue}</span>}
      </div>
    </div>
    <div className="p-1.5 sm:p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
      <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
    </div>
  </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('hq-overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [users, setUsers] = useState([]);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventDeleteConfirmOpen, setIsEventDeleteConfirmOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskDeleteConfirmOpen, setIsTaskDeleteConfirmOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isNewTaskMode, setIsNewTaskMode] = useState(false);

  const fontStyle = { fontFamily: '"LINE Seed JP", sans-serif' };

  // リアルタイムデータ同期
  useEffect(() => {
    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBudgets = onSnapshot(collection(db, "budgets"), (snapshot) => {
      setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubEvents(); unsubTasks(); unsubBudgets(); unsubUsers(); };
  }, []);

  // 認証 & 権限による初期表示制御
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const profile = users.find(u => u.email === user.email) || 
                        { name: user.email.split('@')[0], role: ROLES.HQ, email: user.email };
        setCurrentUser(profile);
        setIsLoggedIn(true);

        if (profile.role === ROLES.HOST && profile.eventId) {
          setSelectedEventId(profile.eventId);
          setActiveTab('event-dashboard');
        } else if (profile.role === ROLES.HQ && !selectedEventId) {
          setActiveTab('hq-overview');
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [users]);

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

  const dashboardData = useMemo(() => {
    if (!selectedEventId || !currentUser) return null;
    const eventTasks = tasks.filter(t => t.eventId === selectedEventId);
    const eventBudgets = budgets.filter(b => b.eventId === selectedEventId);
    
    const completedTasks = eventTasks.filter(t => t.status === TASK_STATUS.DONE).length;
    const totalPlanned = eventBudgets.reduce((a, c) => a + c.planned, 0);
    const totalActual = eventBudgets.reduce((a, c) => a + c.actual, 0);
    const budgetProgress = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

    const myUnfinishedTasks = eventTasks.filter(t => 
      t.assignee === currentUser.name && t.status !== TASK_STATUS.DONE
    );

    return {
      progress: selectedEvent?.progress || 0,
      taskStats: `${completedTasks} / ${eventTasks.length}`,
      budgetSpend: totalActual,
      budgetProgress: `${budgetProgress}%`,
      myTasks: myUnfinishedTasks
    };
  }, [selectedEventId, tasks, budgets, selectedEvent, currentUser]);

  const handleLogout = () => signOut(auth);

  const handleEventSelect = (id) => {
    setSelectedEventId(id);
    setActiveTab('event-dashboard');
    setIsSidebarOpen(false);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = { ...editingItem, status: editingItem.status || '進行中', progress: editingItem.progress || 0 };
      if (editingItem.id) {
        const { id, ...data } = eventData;
        await updateDoc(doc(db, "events", id), data);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }
      setIsEventModalOpen(false);
      setEditingItem(null);
      if (activeTab === 'event-settings') setActiveTab('event-dashboard');
    } catch (err) { console.error(err); }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "events", eventToDelete.id));
      const taskSnap = await getDocs(query(collection(db, "tasks"), where("eventId", "==", eventToDelete.id)));
      taskSnap.forEach(d => batch.delete(d.ref));
      const budgetSnap = await getDocs(query(collection(db, "budgets"), where("eventId", "==", eventToDelete.id)));
      budgetSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      
      setSelectedEventId(null);
      setActiveTab('hq-overview');
      setIsEventDeleteConfirmOpen(false);
      setEventToDelete(null);
    } catch (err) { console.error(err); }
  };

  const handleTaskUpdate = async (taskId, updates, fullTask) => {
    if (fullTask) {
      setIsNewTaskMode(false);
      setEditingItem(fullTask);
      setIsTaskModalOpen(true);
    } else if (updates) {
      try { await updateDoc(doc(db, "tasks", taskId.toString()), updates); }
      catch (err) { console.error(err); }
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { ...editingItem, eventId: selectedEventId, status: editingItem.status || TASK_STATUS.TODO };
      if (editingItem.id) {
        const { id, ...data } = taskData;
        await updateDoc(doc(db, "tasks", id), data);
      } else {
        await addDoc(collection(db, "tasks"), taskData);
      }
      setIsTaskModalOpen(false);
      setEditingItem(null);
    } catch (err) { console.error(err); }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await deleteDoc(doc(db, "tasks", taskToDelete.id));
      setIsTaskDeleteConfirmOpen(false);
      setIsTaskModalOpen(false);
      setTaskToDelete(null);
      setEditingItem(null);
    } catch (err) { console.error(err); }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    try {
      const budgetData = { ...editingItem, eventId: selectedEventId };
      if (editingItem.id) {
        const { id, ...data } = budgetData;
        await updateDoc(doc(db, "budgets", id), data);
      } else {
        await addDoc(collection(db, "budgets"), budgetData);
      }
      setIsBudgetModalOpen(false);
      setEditingItem(null);
    } catch (err) { console.error(err); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" style={fontStyle}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#284db3]"></div>
    </div>
  );

  if (!isLoggedIn) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 relative overflow-hidden" style={fontStyle}>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* サイドバー */}
      <aside className={`fixed inset-y-0 left-0 z-[50] w-72 bg-[#284db3] transition-transform duration-300 transform lg:relative lg:translate-x-0 flex flex-col text-white ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center overflow-hidden p-1">
              <img src="/STREAM_FESTアイコン.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">STREAM FEST.</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
          {isHQ && (
            <>
              <button onClick={() => { setActiveTab('hq-overview'); setSelectedEventId(null); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === 'hq-overview' ? 'bg-white text-[#284db3] font-bold shadow-xl' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <LayoutDashboard size={20}/><span>プロジェクト全体</span>
              </button>

              <div className="py-2">
                <select className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-white text-white appearance-none cursor-pointer" 
                  value={selectedEventId || ''} onChange={e => handleEventSelect(e.target.value)}>
                  <option value="" disabled className="text-gray-800">地域を選択...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id} className="text-gray-800">{ev.name}</option>)}
                </select>
              </div>

              <button onClick={() => { setActiveTab('hq-members'); setSelectedEventId(null); setIsSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === 'hq-members' ? 'bg-white text-[#284db3] font-bold shadow-xl' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Users size={20}/><span>メンバー管理</span>
              </button>
            </>
          )}

          <div className="pt-8 pb-3 px-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Project Menu</div>

          {[
            { id: 'event-dashboard', icon: TrendingUp, label: 'ダッシュボード' },
            { id: 'task-list', icon: ListTodo, label: 'タスク' }, // ← 追加
            { id: 'kanban', icon: KanbanIcon, label: 'カンバンボード' },
            { id: 'tasks', icon: CalendarDays, label: 'ガントチャート' },
            { id: 'budget', icon: Wallet, label: '予算管理' },
            { id: 'chat', icon: MessageSquare, label: 'チャット' },
            { id: 'event-settings', icon: Settings, label: 'プロジェクト設定' },
          ].map(item => {
            const canSee = isHQ ? !!selectedEventId : (currentUser?.eventId === selectedEventId && !!selectedEventId);
            return canSee && (
              <button key={item.id} onClick={() => { 
                  setActiveTab(item.id); 
                  if(item.id === 'event-settings') setEditingItem(selectedEvent);
                  setIsSidebarOpen(false); 
                }} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === item.id ? 'bg-white text-[#284db3] font-bold shadow-xl' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <item.icon size={20}/><span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 bg-[#284db3]/50 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-white/70 font-bold hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <LogIn className="rotate-180" size={20}/><span>ログアウト</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 bg-gray-50">
        <header className="bg-white/80 backdrop-blur-md border-b h-16 sm:h-20 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"><Menu size={24} /></button>
            <div className="relative max-w-xs sm:max-w-md w-full">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="検索..." className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-100 border-none rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-[#284db3] outline-none font-medium transition-all" 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 ml-2">
            <button className="relative p-2 sm:p-3 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all"><Bell size={20}/></button>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden md:block">
                <div className="text-xs font-black text-gray-800">{currentUser?.name}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{currentUser?.role}</div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-md border-2 border-white overflow-hidden">
                <span className="text-[#284db3] font-black text-sm sm:text-lg">{currentUser?.name?.[0]}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar relative">
          <div className="p-4 sm:p-10 max-w-7xl mx-auto w-full pb-32">
            <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 sm:mb-3">
                  <span>{isHQ ? 'HQ Access' : 'Host Portal'}</span>
                  <ChevronRight size={14}/>
                  <span className="text-[#284db3] truncate max-w-[150px]">{activeTab.replace('-', ' ')}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-900 leading-tight">{selectedEvent?.name || 'プロジェクト全体'}</h2>
              </div>
            </div>

            {activeTab === 'event-dashboard' && dashboardData && (
              <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard title="プロジェクト進捗" value={`${dashboardData.progress}%`} icon={TrendingUp} color={BRAND_COLORS.BLUE} />
                  <StatCard title="タスク完了数" value={dashboardData.taskStats} subValue="完了/全タスク" icon={ListTodo} color={BRAND_COLORS.ORANGE} />
                  <StatCard title="予算執行額" value={dashboardData.budgetSpend} icon={Wallet} color={BRAND_COLORS.GREEN} isCurrency />
                  <StatCard title="予算消化率" value={dashboardData.budgetProgress} icon={CheckCircle2} color={BRAND_COLORS.RED} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                  <div className="lg:col-span-2 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm p-6 sm:p-8">
                    <h3 className="font-black text-base sm:text-lg flex items-center gap-3 text-gray-800 mb-6 sm:mb-8">
                      <ListTodo size={22} className="text-[#284db3]"/> あなたのタスク
                    </h3>
                    {dashboardData.myTasks.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {dashboardData.myTasks.map(task => (
                          <div key={task.id} 
                            onClick={() => { handleTaskUpdate(task.id, null, task); }}
                            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-[#284db3] transition-all cursor-pointer group bg-gray-50/30">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-1.5 h-8 sm:h-10 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS.BLUE }}></div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm sm:text-base text-gray-800 truncate group-hover:text-[#284db3] transition-colors">{task.title}</h4>
                                <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  <span className="truncate max-w-[80px]">{task.category}</span>
                                  <span className="flex items-center gap-1 whitespace-nowrap"><CalendarDays size={10}/> {task.dueDate}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[8px] sm:text-[10px] font-black px-2 py-0.5 sm:py-1 rounded-lg bg-orange-50 text-orange-500 uppercase shrink-0 ml-2">{task.status}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-gray-400 font-bold text-sm">対応が必要なタスクはありません。</div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-[#284db3] to-blue-500 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl shadow-blue-100">
                    <h4 className="font-black text-lg mb-2">Project Message</h4>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-6 font-medium">ステータスの更新を忘れずに行ってください。</p>
                    <button onClick={() => setActiveTab('kanban')} className="w-full bg-white text-[#284db3] py-3 sm:py-4 rounded-2xl font-black text-xs sm:text-sm hover:shadow-lg transition-all active:scale-95">カンバンを開く</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hq-overview' && <HQOverview events={events} tasks={tasks} budgets={budgets} onEventSelect={handleEventSelect} onAddEvent={() => { setEditingItem({ name: '', location: '', hostName: currentUser?.name || '' }); setIsEventModalOpen(true); }} />}
            {activeTab === 'hq-members' && <HQMemberManagement users={users} events={events} />}
            {activeTab === 'kanban' && <KanbanBoard tasks={filteredTasks} currentUser={currentUser} onTaskUpdate={handleTaskUpdate} onAddTaskClick={(status) => { setIsNewTaskMode(false); setEditingItem({ title: '', status, category: CATEGORIES[0], assignee: currentUser?.name || '', startDate: '', dueDate: '', eventId: selectedEventId }); setIsTaskModalOpen(true); }} />}
            {activeTab === 'tasks' && <GanttChart tasks={filteredTasks} onTaskEdit={(task) => { handleTaskUpdate(task.id, null, task); }} />}
            {activeTab === 'budget' && <BudgetTable budgets={filteredBudgets} onAddBudgetClick={() => { setEditingItem({ title: '', category: BUDGET_CATEGORIES[0], planned: 0, actual: 0, status: '進行中', eventId: selectedEventId }); setIsBudgetModalOpen(true); }} onBudgetEdit={(budget) => { setEditingItem(budget); setIsBudgetModalOpen(true); }} />}
            
            {activeTab === 'chat' && (
              <ChatView 
                currentUser={currentUser} 
                users={users} 
                selectedEventId={selectedEventId} 
              />
            )}

              {activeTab === 'task-list' && (
                <TaskTable 
                  tasks={filteredTasks} 
                  users={users} 
                  onAddTaskClick={() => { 
                    setIsNewTaskMode(false); 
                    setEditingItem({ title: '', status: TASK_STATUS.TODO, category: CATEGORIES[0], assignee: '', startDate: '', dueDate: '', eventId: selectedEventId }); 
                    setIsTaskModalOpen(true); 
                  }} 
                  onTaskEdit={(task) => handleTaskUpdate(task.id, null, task)} 
                />
              )}


            {activeTab === 'event-settings' && selectedEvent && (
              <div className="max-w-2xl bg-white rounded-[2.5rem] border shadow-sm p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                  <Settings className="text-[#284db3]" /> プロジェクトの基本設定
                </h3>
                <form onSubmit={handleSaveEvent} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">プロジェクト名</label>
                    <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.name || ''} onChange={e=>setEditingItem({...editingItem, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">開催場所</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                      <input required className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                        value={editingItem?.location || ''} onChange={e=>setEditingItem({...editingItem, location: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-4">開催日 (開始予定)</label>
                      <input type="date" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                        value={editingItem?.startDate || ''} onChange={e=>setEditingItem({...editingItem, startDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-4">主催者名</label>
                      <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                        value={editingItem?.hostName || ''} onChange={e=>setEditingItem({...editingItem, hostName: e.target.value})} />
                    </div>
                  </div>
                  <div className="pt-6 border-t flex flex-col sm:flex-row justify-between gap-4">
                    <button type="button" onClick={() => { setEventToDelete(selectedEvent); setIsEventDeleteConfirmOpen(true); }}
                      className="flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={16}/> プロジェクトを完全に削除
                    </button>
                    <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:shadow-blue-100 transition-all">
                      設定を保存する
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* モーダル群 */}
      {isEventDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 sm:p-10 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 mb-2">プロジェクトの削除</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-8">
              <span className="font-bold text-gray-900">{eventToDelete?.name}</span> を削除しますか？<br/>
              紐づく全てのタスク・予算データも削除されます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setIsEventDeleteConfirmOpen(false)} className="order-2 sm:order-1 flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50">キャンセル</button>
              <button onClick={confirmDeleteEvent} className="order-1 sm:order-2 flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 shadow-lg">完全に削除</button>
            </div>
          </div>
        </div>
      )}

      {isTaskDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 sm:p-10 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 mb-2">タスクの削除</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-8">
              タスク「<span className="font-bold text-gray-900">{taskToDelete?.title}</span>」を削除しますか？
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setIsTaskDeleteConfirmOpen(false)} className="order-2 sm:order-1 flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50">キャンセル</button>
              <button onClick={confirmDeleteTask} className="order-1 sm:order-2 flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 shadow-lg">削除する</button>
            </div>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveEvent}>
              <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/30 sticky top-0 bg-white z-10">
                <h3 className="font-black text-lg sm:text-xl text-gray-800">プロジェクトの新規作成</h3>
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Project Name</label>
                  <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 sm:py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                    value={editingItem?.name || ''} onChange={e=>setEditingItem({...editingItem, name: e.target.value})} placeholder="例: 2026 in 名古屋" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                    <input required className="w-full bg-gray-50 border-none rounded-2xl py-4 sm:py-5 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.location || ''} onChange={e=>setEditingItem({...editingItem, location: e.target.value})} placeholder="会場名" />
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button type="button" onClick={()=>setIsEventModalOpen(false)} className="px-8 py-4 font-bold text-gray-400">キャンセル</button>
                <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl">作成する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveTask}>
              <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/30 sticky top-0 bg-white z-10">
                <h3 className="font-black text-lg sm:text-xl text-gray-800">タスクの設定</h3>
                <button type="button" onClick={() => { setIsTaskModalOpen(false); setIsNewTaskMode(false); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-6 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Task Name</label>
                  {!editingItem?.id && (
                    <button type="button" onClick={() => setIsNewTaskMode(!isNewTaskMode)} className="text-[9px] sm:text-[10px] font-black text-[#284db3] flex items-center gap-1 hover:underline">
                      {isNewTaskMode ? <ListTodo size={12}/> : <Plus size={12}/>}
                      {isNewTaskMode ? "既存リストから選択" : "新しくタスク名を入力"}
                    </button>
                  )}
                </div>

                {!isNewTaskMode && !editingItem?.id ? (
                  <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 sm:py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm"
                    onChange={(e) => {
                      const template = INITIAL_TASKS.find(t => t.title === e.target.value);
                      if(template) setEditingItem({ ...editingItem, title: template.title, category: template.category });
                    }} value={editingItem?.title || ''}>
                    <option value="" disabled>タスクを選択...</option>
                    {INITIAL_TASKS.map((t, idx) => <option key={idx} value={t.title}>{t.title}</option>)}
                  </select>
                ) : (
                  <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 sm:py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                    value={editingItem?.title || ''} onChange={e=>setEditingItem({...editingItem, title: e.target.value})} placeholder="タスク名を入力" />
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">タスクカテゴリ</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" 
                    value={editingItem?.category || ''} 
                    onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                  >
                    <option value="" disabled>カテゴリを選択...</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">担当者</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" 
                      value={editingItem?.assignee || ''} onChange={e=>setEditingItem({...editingItem, assignee: e.target.value})}>
                      <option value="">未割り当て</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">ステータス</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" 
                      value={editingItem?.status || ''} onChange={e=>setEditingItem({...editingItem, status: e.target.value})}>
                      {Object.values(TASK_STATUS).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">開始日</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" 
                      value={editingItem?.startDate || ''} onChange={e=>setEditingItem({...editingItem, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">期日</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3] text-sm" 
                      value={editingItem?.dueDate || ''} onChange={e=>setEditingItem({...editingItem, dueDate: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 sticky bottom-0">
                <div className="flex gap-3">
                  {editingItem?.id && (
                    <button 
                      type="button" 
                      onClick={() => { setTaskToDelete(editingItem); setIsTaskDeleteConfirmOpen(true); }}
                      className="flex items-center gap-2 px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16}/> 削除
                    </button>
                  )}
                  <button type="button" onClick={()=>{setIsTaskModalOpen(false); setIsNewTaskMode(false);}} className="px-8 py-4 font-bold text-gray-400">閉じる</button>
                </div>
                <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl">保存する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveBudget}>
              <div className="p-6 sm:p-8 border-b flex justify-between items-center bg-gray-50/30 sticky top-0 bg-white z-10">
                <h3 className="font-black text-lg sm:text-xl text-gray-800">予算項目の設定</h3>
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-6 sm:p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">項目名</label>
                  <input required className="w-full bg-gray-50 border-none rounded-2xl p-4 sm:p-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={editingItem?.title || ''} onChange={e=>setEditingItem({...editingItem, title: e.target.value})} placeholder="会場費など" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">計画額 (¥)</label>
                    <input type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 sm:p-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={editingItem?.planned || 0} onChange={e=>setEditingItem({...editingItem, planned: parseInt(e.target.value)})}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">執行額 (¥)</label>
                    <input type="number" className="w-full bg-gray-50 border-none rounded-2xl p-4 sm:p-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={editingItem?.actual || 0} onChange={e=>setEditingItem({...editingItem, actual: parseInt(e.target.value)})}/>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                <button type="button" onClick={()=>setIsBudgetModalOpen(false)} className="px-8 py-4 font-bold text-gray-400">キャンセル</button>
                <button type="submit" className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl">決定</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}