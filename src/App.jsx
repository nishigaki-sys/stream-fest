import './index.css'
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, ListTodo, Bell, Search, Plus, CheckCircle2, AlertCircle,
  Menu, X, ChevronRight, TrendingUp, Layers, Settings2, CalendarDays,
  Wallet, Kanban as KanbanIcon, GripVertical, Lock, Mail, LogIn,
  ArrowLeft, Send, Clock, MapPin, Building2, Pencil, Trash2, Save
} from 'lucide-react';

// Firebase SDK
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail 
} from "firebase/auth";

// --- Firebase Configuration (自身の値に差し替えてください) ---
const firebaseConfig = {
  apiKey: "AIzaSyBpOqq4vJjyEPtTQYmoooOlaq8WSmLXk1o",
  authDomain: "stream-fest.firebaseapp.com",
  projectId: "stream-fest",
  storageBucket: "stream-fest.firebasestorage.app",
  messagingSenderId: "299514757351",
  appId: "1:299514757351:web:5223c7ba331734fd73a242"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Constants ---
const BRAND_COLORS = { BLUE: '#284db3', LIGHT_GREEN: '#c2e086', PINK: '#ffc1bc', GREEN: '#34cc99', YELLOW: '#fef667', RED: '#fd594e', ORANGE: '#fe9a33' };
const ROLES = { HQ: '本部', HOST: '主催', PARTNER: '提供', SUPPORT: '後援・共催' };
const TASK_STATUS = { TODO: '未着手', IN_PROGRESS: '進行中', PENDING: '確認待ち', DONE: '完了' };
const BUDGET_CATEGORIES = ['会場費', '広報広告費', '制作物費', '運営人件費', '機材備品費', 'その他'];
const CATEGORIES = ['①設計', '②準備', '③運営', '④事後'];

// --- Mock Data ---
const INITIAL_EVENTS = [
  { id: 'ev_osaka', name: 'STREAM FEST. 2026 in 大阪', location: 'マイドームおおさか', hostName: '石垣', status: '進行中', progress: 68, startDate: '2026-05-05' },
  { id: 'ev_tokyo', name: 'STREAM FEST. 2026 in 東京', location: '東京ビッグサイト', hostName: '大津', status: '設計中', progress: 32, startDate: '2026-07-20' },
];

const INITIAL_USERS = [
  { id: 1, name: '重見', role: ROLES.HQ, email: 'shigemi@stream-fest.org', eventId: null },
  { id: 2, name: '石垣', role: ROLES.HOST, email: 'ishigaki@edion.com', eventId: 'ev_osaka' },
  { id: 3, name: '大津', role: ROLES.HOST, email: 'otsu@yumemiru.jp', eventId: 'ev_tokyo' },
];

const INITIAL_TASKS = [
  { id: 101, eventId: 'ev_osaka', title: '全体スケジュール設定', category: '①設計', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.DONE, startDate: '2026-01-05', dueDate: '2026-01-20', progress: 100 },
  { id: 104, eventId: 'ev_osaka', title: '制作物一覧作成', category: '①設計', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.IN_PROGRESS, startDate: '2026-01-20', dueDate: '2026-02-15', progress: 70 },
  { id: 201, eventId: 'ev_osaka', title: '公式Webサイト作成', category: '②準備', role: ROLES.HQ, assignee: '池田', status: TASK_STATUS.IN_PROGRESS, startDate: '2026-02-01', dueDate: '2026-03-01', progress: 45 },
];

const INITIAL_BUDGETS = [
  { id: 1, eventId: 'ev_osaka', title: '会場レンタル代', category: '会場費', planned: 500000, actual: 500000, status: '完了' },
  { id: 2, eventId: 'ev_osaka', title: '広告費', category: '広報広告費', planned: 200000, actual: 50000, status: '進行中' },
];

// --- Components ---
const StatCard = ({ title, value, subValue, icon: Icon, color, isCurrency = false }) => (
  <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md">
    <div className="min-w-0">
      <span className="text-gray-500 text-xs sm:text-sm font-medium block truncate">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl sm:text-2xl font-black" style={{ color }}>{isCurrency ? `¥${value.toLocaleString()}` : value}</span>
        {subValue && <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{subValue}</span>}
      </div>
    </div>
    <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}15`, color: color }}><Icon size={18} /></div>
  </div>
);

const ProgressBar = ({ progress, height = "h-2", color = BRAND_COLORS.BLUE }) => (
  <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
    <div className="h-full transition-all duration-700 ease-out" style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}></div>
  </div>
);

export default function App() {
  // Auth & User States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  // App Navigation States
  const [activeTab, setActiveTab] = useState('hq-overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentTask, setCurrentTask] = useState({ id: null, title: '', category: CATEGORIES[0], role: ROLES.HQ, assignee: '', startDate: '', dueDate: '', progress: 0, status: TASK_STATUS.TODO });
  const [currentBudget, setCurrentBudget] = useState({ id: null, title: '', category: BUDGET_CATEGORIES[0], planned: 0, actual: 0, status: '未着手' });

  // Drag & Drop State
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // Authentication logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const profile = INITIAL_USERS.find(u => u.email === user.email) || { name: user.email.split('@')[0], role: ROLES.HQ, email: user.email };
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

  // Memos
  const isHQ = currentUser?.role === ROLES.HQ;
  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedEventId) result = result.filter(t => t.eventId === selectedEventId);
    if (searchQuery) result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return [...result].sort((a, b) => a.category.localeCompare(b.category) || a.startDate.localeCompare(b.startDate));
  }, [tasks, selectedEventId, searchQuery]);

  const filteredBudgets = useMemo(() => {
    return selectedEventId ? budgets.filter(b => b.eventId === selectedEventId) : budgets;
  }, [budgets, selectedEventId]);

  const todayTasks = useMemo(() => {
    if (!currentUser) return [];
    return tasks.filter(t => t.assignee === currentUser.name && t.status !== TASK_STATUS.DONE);
  }, [tasks, currentUser]);

  // Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); }
    catch (err) { setLoginError('認証に失敗しました。'); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try { await sendPasswordResetEmail(auth, resetEmail); setResetMessage('メールを送信しました。'); }
    catch (err) { setLoginError('送信に失敗しました。'); }
  };

  const handleLogout = () => signOut(auth);

  const handleEventSelect = (id) => {
    setSelectedEventId(id);
    setActiveTab('event-dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (currentTask.id) {
      setTasks(tasks.map(t => t.id === currentTask.id ? currentTask : t));
    } else {
      setTasks([...tasks, { ...currentTask, id: Date.now(), eventId: selectedEventId }]);
    }
    setIsTaskModalOpen(false);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (events.find(ev => ev.id === editingEvent.id)) {
      setEvents(events.map(ev => ev.id === editingEvent.id ? editingEvent : ev));
    } else {
      setEvents([...events, editingEvent]);
    }
    setIsEventModalOpen(false);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (currentBudget.id) {
      setBudgets(budgets.map(b => b.id === currentBudget.id ? currentBudget : b));
    } else {
      setBudgets([...budgets, { ...currentBudget, id: Date.now(), eventId: selectedEventId }]);
    }
    setIsBudgetModalOpen(false);
  };

  // Kanban Handlers
  const onDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: targetStatus, progress: targetStatus === TASK_STATUS.DONE ? 100 : t.progress } : t));
    setDragOverStatus(null);
  };

  // UI Helpers
  const getStatusColor = (s) => {
    switch (s) {
      case TASK_STATUS.DONE: return BRAND_COLORS.GREEN;
      case TASK_STATUS.IN_PROGRESS: return BRAND_COLORS.ORANGE;
      case TASK_STATUS.PENDING: return BRAND_COLORS.YELLOW;
      default: return BRAND_COLORS.RED;
    }
  };

  // Views
  const renderHQOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="開催予定数" value={events.length} subValue="2026年度" icon={Building2} color={BRAND_COLORS.BLUE} />
        <StatCard title="全体予算規模" value={budgets.reduce((a,c)=>a+c.planned,0)} icon={Wallet} color={BRAND_COLORS.GREEN} isCurrency />
        <StatCard title="要対応アラート" value={todayTasks.length} subValue="未完了タスク" icon={AlertCircle} color={BRAND_COLORS.RED} />
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/30">
          <h3 className="font-black flex items-center gap-2 text-gray-700"><Layers size={20} className="text-blue-600" /> プロジェクト一覧</h3>
          <button onClick={() => { setEditingEvent({ id: `ev_${Date.now()}`, name: '', location: '', hostName: '', status: '未着手', progress: 0, startDate: '' }); setIsEventModalOpen(true); }} 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            <Plus size={16}/>新規作成
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr><th className="px-6 py-4">プロジェクト</th><th className="px-6 py-4">会場</th><th className="px-6 py-4">進捗</th><th className="px-6 py-4 text-right">予算消化</th></tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} onClick={() => handleEventSelect(ev.id)} className="hover:bg-blue-50/30 border-b last:border-0 cursor-pointer transition-colors group">
                  <td className="px-6 py-5 font-black text-gray-700 group-hover:text-blue-700">{ev.name}</td>
                  <td className="px-6 py-5 text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/>{ev.location}</td>
                  <td className="px-6 py-5 w-64"><ProgressBar progress={ev.progress} /></td>
                  <td className="px-6 py-5 text-right font-bold text-sm text-gray-600">¥{budgets.filter(b=>b.eventId===ev.id).reduce((a,c)=>a+c.actual,0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderKanban = () => (
    <div className="h-[calc(100vh-250px)] flex gap-6 overflow-x-auto pb-4 no-scrollbar">
      {Object.values(TASK_STATUS).map(status => (
        <div key={status} 
          onDragOver={(e) => { e.preventDefault(); setDragOverStatus(status); }}
          onDragLeave={() => setDragOverStatus(null)}
          onDrop={(e) => onDrop(e, status)}
          className={`flex-1 min-w-[320px] rounded-[2rem] p-4 transition-all duration-300 ${dragOverStatus === status ? 'bg-blue-100/50 ring-2 ring-blue-400' : 'bg-gray-100/50'}`}>
          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="font-black text-xs uppercase tracking-widest text-gray-500">{status}</h4>
            <span className="bg-white px-2 py-1 rounded-lg text-[10px] font-black text-gray-400 border shadow-sm">
              {filteredTasks.filter(t => t.status === status).length}
            </span>
          </div>
          <div className="space-y-4">
            {filteredTasks.filter(t => t.status === status).map(task => (
              <div key={task.id} draggable onDragStart={(e) => onDragStart(e, task.id)}
                onClick={() => { setCurrentTask(task); setIsTaskModalOpen(true); }}
                className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" 
                    style={{ backgroundColor: `${BRAND_COLORS.BLUE}10`, color: BRAND_COLORS.BLUE }}>{task.category}</span>
                  <GripVertical size={14} className="text-gray-200 group-hover:text-gray-400"/>
                </div>
                <h5 className="font-bold text-sm text-gray-800 leading-snug mb-4 group-hover:text-blue-700">{task.title}</h5>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-[10px] font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-blue-300 flex items-center justify-center text-white text-[8px]">{task.assignee[0]}</div>
                    {task.assignee}
                  </div>
                  <div className="flex items-center gap-1"><CalendarDays size={12}/>{task.dueDate}</div>
                </div>
              </div>
            ))}
            <button onClick={() => { setCurrentTask({ id: null, title: '', category: CATEGORIES[0], role: ROLES.HQ, assignee: currentUser.name, status: status, dueDate: '', eventId: selectedEventId }); setIsTaskModalOpen(true); }}
              className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-gray-400 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
              <Plus size={18} /> <span className="text-xs font-bold">タスクを追加</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-r-4 border-r-transparent"></div>
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading System...</span>
      </div>
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] rounded-full bg-pink-100/40 blur-3xl" />
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-8 sm:p-12 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex p-5 bg-blue-600 rounded-[2rem] mb-6 text-white shadow-xl shadow-blue-200"><Layers size={32} strokeWidth={2.5}/></div>
            <h1 className="text-3xl font-black tracking-tighter text-blue-900 uppercase">STREAM FEST.</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Project Management Portal</p>
          </div>
          {!isForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input required type="email" placeholder="name@company.com" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-bold transition-all" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}/>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                  <input required type="password" placeholder="••••••••" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-bold transition-all" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}/>
                </div>
              </div>
              <button type="button" onClick={()=>setIsForgotPassword(true)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest block ml-auto transition-colors">パスワードを忘れた方はこちら</button>
              {loginError && <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2"><AlertCircle size={16}/>{loginError}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white rounded-[1.5rem] py-5 font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">ログイン <LogIn size={20}/></button>
            </form>
          ) : (
            <div className="animate-in slide-in-from-right-8 duration-500">
              <button onClick={()=>setIsForgotPassword(false)} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 text-xs font-black uppercase mb-8 transition-colors"><ArrowLeft size={16}/> 戻る</button>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Reset Password</h2>
              <p className="text-gray-400 text-sm mb-8">登録済みのメールアドレスへ再設定リンクを送信します。</p>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <input required type="email" placeholder="Enter your email" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-5 outline-none font-bold" value={resetEmail} onChange={e => setResetEmail(e.target.value)}/>
                {resetMessage && <div className="p-4 bg-green-50 text-green-600 text-xs font-bold rounded-2xl flex items-center gap-2"><CheckCircle2 size={16}/>{resetMessage}</div>}
                <button type="submit" className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black shadow-lg">再設定メールを送信</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans relative overflow-hidden">
      <aside className="w-72 bg-white border-r hidden lg:flex flex-col relative z-20">
        <div className="p-8 border-b flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100"><Layers size={22} strokeWidth={2.5}/></div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-blue-900">STREAM FEST.</h1>
        </div>
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto no-scrollbar">
          {isHQ && <button onClick={() => { setActiveTab('hq-overview'); setSelectedEventId(null); }} 
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === 'hq-overview' ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
            <LayoutDashboard size={20}/><span>プロジェクト全体</span>
          </button>}
          <div className="pt-8 pb-3 px-5 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Project Admin</div>
          {isHQ && <select className="w-full bg-gray-100 border-none rounded-xl px-4 py-3 text-sm font-bold mb-4 outline-none focus:ring-2 focus:ring-blue-500" value={selectedEventId || ''} onChange={e => handleEventSelect(e.target.value)}>
            <option value="" disabled>地域を選択...</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>}
          {[
            { id: 'event-dashboard', icon: TrendingUp, label: 'ダッシュボード', hide: !selectedEventId },
            { id: 'kanban', icon: KanbanIcon, label: 'カンバンボード', hide: !selectedEventId },
            { id: 'tasks', icon: ListTodo, label: 'タスク & WBS', hide: !selectedEventId },
            { id: 'budget', icon: Wallet, label: '予算管理', hide: !selectedEventId },
          ].map(item => !item.hide && <button key={item.id} onClick={() => setActiveTab(item.id)} 
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === item.id ? 'bg-blue-600 text-white font-bold shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
            <item.icon size={20}/><span>{item.label}</span>
          </button>)}
        </nav>
        <div className="p-6 border-t bg-gray-50/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-gray-400 font-bold hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogIn className="rotate-180" size={20}/><span>ログアウト</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar relative z-10">
        <header className="bg-white/80 backdrop-blur-md border-b h-20 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="タスク、予算、イベントを検索..." className="w-full pl-14 pr-6 py-3 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`relative p-3 rounded-2xl transition-all ${isNotificationOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}>
              <Bell size={22}/>
              {todayTasks.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 border-2 border-white rounded-full bg-red-500"></span>}
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-gray-800">{currentUser.name}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{currentUser.role}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center font-black text-white shadow-lg shadow-blue-100 border-2 border-white">{currentUser.name[0]}</div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full pb-32">
          <div className="mb-10">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
              <span>{isHQ ? 'HQ Access' : 'Host Portal'}</span>
              <ChevronRight size={14}/>
              <span className="text-blue-600">{activeTab.replace('-', ' ')}</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900">{selectedEvent?.name || 'プロジェクト全体'}</h2>
          </div>

          {activeTab === 'hq-overview' && renderHQOverview()}
          {activeTab === 'kanban' && renderKanban()}
          
          {activeTab === 'tasks' && (
             <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
               <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                 <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg"><ListTodo size={24} className="text-blue-600"/> タスク & WBS 管理</h3>
                 <button onClick={()=>{setCurrentTask({id:null, title:'', category:CATEGORIES[0], role:ROLES.HQ, assignee:currentUser.name, startDate:'', dueDate:'', progress:0, status:TASK_STATUS.TODO, eventId:selectedEventId}); setIsTaskModalOpen(true);}} 
                   className="text-xs font-black bg-gray-900 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg">
                   <Plus size={18}/>タスクを追加
                 </button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
                     <tr><th className="px-8 py-5">タスク名</th><th className="px-8 py-5">カテゴリ</th><th className="px-8 py-5">担当者</th><th className="px-8 py-5">期限</th><th className="px-8 py-5 text-right">ステータス</th></tr>
                   </thead>
                   <tbody>
                     {filteredTasks.map(t => (
                       <tr key={t.id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={()=>{setCurrentTask(t); setIsTaskModalOpen(true);}}>
                         <td className="px-8 py-6 font-bold text-gray-700 group-hover:text-blue-700">{t.title}</td>
                         <td className="px-8 py-6"><span className="text-[10px] font-black uppercase text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{t.category}</span></td>
                         <td className="px-8 py-6 text-sm font-bold text-gray-500">{t.assignee}</td>
                         <td className="px-8 py-6 text-sm text-gray-400">{t.dueDate}</td>
                         <td className="px-8 py-6 text-right">
                           <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest" 
                             style={{ backgroundColor: `${getStatusColor(t.status)}15`, color: getStatusColor(t.status) }}>{t.status}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {activeTab === 'budget' && (
             <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
               <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                 <h3 className="font-black flex items-center gap-3 text-gray-800 text-lg"><Wallet size={24} className="text-green-600"/> 予算詳細・執行状況</h3>
                 <button onClick={()=>{setCurrentBudget({id:null, title:'', category:BUDGET_CATEGORIES[0], planned:0, actual:0, status:'未着手'}); setIsBudgetModalOpen(true);}} 
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
                     {filteredBudgets.map(b => (
                       <tr key={b.id} className="border-b last:border-0 hover:bg-green-50/30 transition-colors cursor-pointer group" onClick={()=>{setCurrentBudget(b); setIsBudgetModalOpen(true);}}>
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
          )}
        </div>
      </main>

      {/* --- Modals --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveTask}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-gray-800">タスク詳細の編集</h3>
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Task Name</label>
                  <input required className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl px-6 py-5 font-bold outline-none transition-all" value={currentTask.title} onChange={e=>setCurrentTask({...currentTask, title:e.target.value})} placeholder="何をしますか？" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Status</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none" value={currentTask.status} onChange={e=>setCurrentTask({...currentTask, status:e.target.value})}>
                      {Object.values(TASK_STATUS).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Due Date</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none" value={currentTask.dueDate} onChange={e=>setCurrentTask({...currentTask, dueDate:e.target.value})}/>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={()=>setIsTaskModalOpen(false)} className="px-8 py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"><Save size={20}/>保存する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10">
            <h3 className="text-2xl font-black mb-8 text-gray-800">プロジェクトの新規作成</h3>
            <form onSubmit={handleSaveEvent} className="space-y-6">
              <input required placeholder="プロジェクト名 (例: 2026 in 大阪)" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingEvent?.name || ''} onChange={e=>setEditingEvent({...editingEvent, name:e.target.value})}/>
              <input required placeholder="会場名" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-blue-500" value={editingEvent?.location || ''} onChange={e=>setEditingEvent({...editingEvent, location:e.target.value})}/>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={()=>setIsEventModalOpen(false)} className="px-6 font-bold text-gray-400">閉じる</button>
                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg">作成する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10">
            <h3 className="text-2xl font-black mb-8 text-gray-800">予算項目の設定</h3>
            <form onSubmit={handleSaveBudget} className="space-y-6">
              <input required placeholder="項目名" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none" value={currentBudget.title} onChange={e=>setCurrentBudget({...currentBudget, title:e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-4">計画額 (¥)</label><input type="number" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none" value={currentBudget.planned} onChange={e=>setCurrentBudget({...currentBudget, planned: parseInt(e.target.value)})}/></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase ml-4">執行額 (¥)</label><input type="number" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none" value={currentBudget.actual} onChange={e=>setCurrentBudget({...currentBudget, actual: parseInt(e.target.value)})}/></div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={()=>setIsBudgetModalOpen(false)} className="px-6 font-bold text-gray-400">キャンセル</button>
                <button type="submit" className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg">決定</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}