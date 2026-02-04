import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, ListTodo, Bell, Search, Plus, CheckCircle2, AlertCircle,
  Menu, X, ChevronRight, TrendingUp, Layers, Settings2, CalendarDays,
  Wallet, Kanban as KanbanIcon, GripVertical, Lock, Mail, LogIn,
  ArrowLeft, Send, Clock, MapPin, Building2, Pencil, Trash2, Save, Users, Shield, AlertTriangle
} from 'lucide-react';

// Firebase SDK & Config
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDocs, writeBatch
} from "firebase/firestore"; 
import { auth } from './config/firebase';

// Constants & Initial Data
import { 
  BRAND_COLORS, ROLES, TASK_STATUS, BUDGET_CATEGORIES, CATEGORIES,
  INITIAL_TASKS 
} from './constants/appConfig';

// Page Components
import LoginPage from './pages/auth/LoginPage';
import HQOverview from './pages/hq/HQOverview';
import KanbanBoard from './pages/common/KanbanBoard';
import TaskTable from './pages/common/TaskTable';
import BudgetTable from './pages/common/BudgetTable';

// DB初期化
const db = getFirestore();

/**
 * 共通コンポーネント: 統計カード (KPI用)
 */
const StatCard = ({ title, value, subValue, icon: Icon, color, isCurrency = false }) => (
  <div className="p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md">
    <div className="min-w-0">
      <span className="text-gray-500 text-xs sm:text-sm font-medium block truncate">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl sm:text-2xl font-black" style={{ color }}>
          {isCurrency ? `¥${Number(value).toLocaleString()}` : value}
        </span>
        {subValue && <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{subValue}</span>}
      </div>
    </div>
    <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
      <Icon size={18} />
    </div>
  </div>
);

/**
 * メンバー管理コンポーネント (HQ専用)
 */
const HQMemberManagement = ({ users, events, onUpdateUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleEditClick = (user) => {
    setEditingUser({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (e) {
      console.error("Error deleting user: ", e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser.id) {
        const { password, id, ...userData } = editingUser;
        if (password) userData.password = password;
        await updateDoc(doc(db, "users", id), userData);
      } else {
        await addDoc(collection(db, "users"), editingUser);
      }
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (e) {
      console.error("Error saving user: ", e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <Shield className="text-[#284db3]" /> メンバー・権限管理
        </h3>
        <button 
          onClick={() => { setEditingUser({ name: '', email: '', role: ROLES.HOST, eventId: null, password: '' }); setIsModalOpen(true); }}
          className="bg-[#284db3] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Users size={20}/> メンバー招待
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-8 py-5">名前</th>
                <th className="px-8 py-5">メールアドレス</th>
                <th className="px-8 py-5">役割</th>
                <th className="px-8 py-5">担当プロジェクト</th>
                <th className="px-8 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-700">{user.name}</td>
                  <td className="px-8 py-6 text-sm text-gray-500 flex items-center gap-2">
                    <Mail size={14}/> {user.email}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase" 
                      style={{ backgroundColor: user.role === ROLES.HQ ? '#284db315' : '#f3f4f6', color: user.role === ROLES.HQ ? '#284db3' : '#6b7280' }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">
                    {user.eventId ? events.find(e => e.id === user.eventId)?.name : '未割当（全体）'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-[#284db3] transition-colors" title="編集">
                        <Pencil size={18}/>
                      </button>
                      <button onClick={() => handleDeleteClick(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="削除">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-gray-800">{editingUser?.id ? 'メンバー情報の編集' : '新規メンバー招待'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">名前</label>
                  <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                    value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">メールアドレス</label>
                  <input required type="email" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                    value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">{editingUser?.id ? '新しいパスワード (任意)' : '初期パスワード'}</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                    <input required={!editingUser?.id} type="text" className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      placeholder="6文字以上" value={editingUser?.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">役割</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={editingUser?.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                      {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">担当プロジェクト</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={editingUser?.eventId || ''} onChange={e => setEditingUser({...editingUser, eventId: e.target.value || null})}>
                      <option value="">全体管理</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">キャンセル</button>
                <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Save size={20}/> 保存する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-10 text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">メンバーの削除</h3>
            <p className="text-gray-500 mb-8">
              <span className="font-bold text-gray-800">{userToDelete?.name}</span> さんを削除してもよろしいですか？<br/>
              この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">
                キャンセル
              </button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg transition-all">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('hq-overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore Data States
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventDeleteConfirmOpen, setIsEventDeleteConfirmOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isNewTaskMode, setIsNewTaskMode] = useState(false);

  const fontStyle = { fontFamily: '"LINE Seed JP", sans-serif' };

  // --- Firestore Real-time Sync ---
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

    return () => {
      unsubEvents();
      unsubTasks();
      unsubBudgets();
      unsubUsers();
    };
  }, []);

  // Authentication logic
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const profile = users.find(u => u.email === user.email) || 
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
  }, [users]);

  // --- Memos & KPI Logic ---
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

  // --- Handlers (Firestore CRUD) ---
  const handleLogout = () => signOut(auth);

  const handleEventSelect = (id) => {
    setSelectedEventId(id);
    setActiveTab('event-dashboard');
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      const eventData = { 
        ...editingItem, 
        status: editingItem.status || '進行中', 
        progress: editingItem.progress || 0 
      };
      if (editingItem.id) {
        const { id, ...data } = eventData;
        await updateDoc(doc(db, "events", id), data);
      } else {
        await addDoc(collection(db, "events"), eventData);
      }
      setIsEventModalOpen(false);
      setEditingItem(null);
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
      if (selectedEventId === eventToDelete.id) { setSelectedEventId(null); setActiveTab('hq-overview'); }
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
      try {
        await updateDoc(doc(db, "tasks", taskId.toString()), updates);
      } catch (err) {
        console.error("Task update failed:", err);
      }
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = { 
        ...editingItem, 
        eventId: selectedEventId,
        startDate: editingItem.startDate || '',
        dueDate: editingItem.dueDate || '',
        assignee: editingItem.assignee || '',
        status: editingItem.status || TASK_STATUS.TODO
      };
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
      {/* サイドバー */}
      <aside className="w-72 bg-[#284db3] border-r border-[#284db3]/20 hidden lg:flex flex-col relative z-20 text-white">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1 shadow-lg">
            <img src="/STREAM_FESTアイコン.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">STREAM FEST.</h1>
        </div>
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
          {isHQ && (
            <>
              <button onClick={() => { setActiveTab('hq-overview'); setSelectedEventId(null); }} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === 'hq-overview' ? 'bg-white text-[#284db3] font-bold shadow-xl' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <LayoutDashboard size={20}/><span>プロジェクト全体</span>
              </button>
              <button onClick={() => { setActiveTab('hq-members'); setSelectedEventId(null); }} 
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === 'hq-members' ? 'bg-white text-[#284db3] font-bold shadow-xl' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                <Users size={20}/><span>メンバー管理</span>
              </button>
            </>
          )}
          <div className="pt-8 pb-3 px-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Project Admin</div>
          {isHQ && (
            <select className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm font-bold mb-4 outline-none focus:ring-2 focus:ring-white text-white appearance-none cursor-pointer" 
              value={selectedEventId || ''} onChange={e => handleEventSelect(e.target.value)}>
              <option value="" disabled className="text-gray-800">地域を選択...</option>
              {events.map(ev => <option key={ev.id} value={ev.id} className="text-gray-800">{ev.name}</option>)}
            </select>
          )}
          {[
            { id: 'event-dashboard', icon: TrendingUp, label: 'ダッシュボード', hide: !selectedEventId },
            { id: 'kanban', icon: KanbanIcon, label: 'カンバンボード', hide: !selectedEventId },
            { id: 'tasks', icon: ListTodo, label: 'タスク & WBS', hide: !selectedEventId },
            { id: 'budget', icon: Wallet, label: '予算管理', hide: !selectedEventId },
          ].map(item => !item.hide && (
            <button key={item.id} onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] transition-all ${activeTab === item.id ? 'bg-white text-[#284db3] font-bold shadow-xl' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <item.icon size={20}/><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10 bg-[#284db3]/50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-white/70 font-bold hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <LogIn className="rotate-180" size={20}/><span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 bg-gray-50">
        <header className="bg-white/80 backdrop-blur-md border-b h-20 flex items-center justify-between px-10 sticky top-0 z-30">
          <div className="relative max-w-md w-full">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="検索..." className="w-full pl-14 pr-6 py-3 bg-gray-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#284db3] outline-none font-medium transition-all" 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex items-center gap-8">
            <button className="relative p-3 rounded-2xl text-gray-400 hover:bg-gray-100 transition-all">
              <Bell size={22}/>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-gray-800">{currentUser?.name}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{currentUser?.role}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-1 shadow-lg border-2 border-white overflow-hidden">
                <img src="/STREAM_FESTアイコン.png" alt="User" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full pb-32">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                <span>{isHQ ? 'HQ Access' : 'Host Portal'}</span>
                <ChevronRight size={14}/>
                <span className="text-[#284db3]">{activeTab.replace('-', ' ')}</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight text-gray-900">{selectedEvent?.name || 'プロジェクト全体'}</h2>
            </div>
            {selectedEventId && isHQ && (
              <button 
                onClick={() => { setEventToDelete(selectedEvent); setIsEventDeleteConfirmOpen(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 size={16}/> プロジェクトを削除
              </button>
            )}
          </div>

          {activeTab === 'event-dashboard' && dashboardData && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="プロジェクト進捗" value={`${dashboardData.progress}%`} icon={TrendingUp} color={BRAND_COLORS.BLUE} />
                <StatCard title="タスク完了数" value={dashboardData.taskStats} subValue="完了/全タスク" icon={ListTodo} color={BRAND_COLORS.ORANGE} />
                <StatCard title="予算執行額" value={dashboardData.budgetSpend} icon={Wallet} color={BRAND_COLORS.GREEN} isCurrency />
                <StatCard title="予算消化率" value={dashboardData.budgetProgress} icon={CheckCircle2} color={BRAND_COLORS.RED} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border shadow-sm p-8">
                  <h3 className="font-black text-lg flex items-center gap-3 text-gray-800 mb-8">
                    <ListTodo size={24} className="text-[#284db3]"/> あなたに割り当てられたタスク
                  </h3>
                  {dashboardData.myTasks.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.myTasks.map(task => (
                        <div key={task.id} 
                          onClick={() => { handleTaskUpdate(task.id, null, task); }}
                          className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-[#284db3] transition-all cursor-pointer group bg-gray-50/30">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-10 rounded-full" style={{ backgroundColor: BRAND_COLORS.BLUE }}></div>
                            <div>
                              <h4 className="font-bold text-gray-800 group-hover:text-[#284db3] transition-colors">{task.title}</h4>
                              <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <span>{task.category}</span>
                                <span><CalendarDays size={12}/> {task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-orange-50 text-orange-500 uppercase">{task.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-gray-400 font-bold">対応が必要なタスクはありません。</div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-[#284db3] to-blue-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100">
                  <h4 className="font-black text-lg mb-2">Project Message</h4>
                  <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">期限が近づいているタスクがあります。ステータスの更新を忘れずに行ってください。</p>
                  <button onClick={() => setActiveTab('kanban')} className="w-full bg-white text-[#284db3] py-4 rounded-2xl font-black text-sm hover:shadow-lg transition-all active:scale-95">カンバンを開く</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hq-overview' && (
            <HQOverview 
              events={events} tasks={tasks} budgets={budgets} 
              onEventSelect={handleEventSelect}
              onAddEvent={() => {
                setEditingItem({ name: '', location: '', hostName: currentUser?.name || '' });
                setIsEventModalOpen(true);
              }}
            />
          )}

          {activeTab === 'hq-members' && (
            <HQMemberManagement 
              users={users} 
              events={events} 
              onUpdateUsers={setUsers} 
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard 
              tasks={filteredTasks} 
              currentUser={currentUser} 
              onTaskUpdate={handleTaskUpdate}
              onAddTaskClick={(status) => {
                setIsNewTaskMode(false);
                setEditingItem({ title: '', status, category: CATEGORIES[0], assignee: currentUser?.name || '', startDate: '', dueDate: '', eventId: selectedEventId });
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskTable 
              tasks={filteredTasks}
              onAddTaskClick={() => {
                setIsNewTaskMode(false);
                setEditingItem({ title: '', status: TASK_STATUS.TODO, category: CATEGORIES[0], assignee: currentUser?.name || '', startDate: '', dueDate: '', eventId: selectedEventId });
                setIsTaskModalOpen(true);
              }}
              onTaskEdit={(task) => { handleTaskUpdate(task.id, null, task); }}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetTable 
              budgets={filteredBudgets}
              onAddBudgetClick={() => {
                setEditingItem({ title: '', category: BUDGET_CATEGORIES[0], planned: 0, actual: 0, status: '進行中', eventId: selectedEventId });
                setIsBudgetModalOpen(true);
              }}
              onBudgetEdit={(budget) => { setEditingItem(budget); setIsBudgetModalOpen(true); }}
            />
          )}
        </div>
      </main>

      {/* --- モーダル群 --- */}
      {isEventDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-10 text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">プロジェクトの削除</h3>
            <p className="text-gray-500 mb-8 font-medium">
              <span className="font-bold text-gray-900">{eventToDelete?.name}</span> を削除しますか？<br/>
              紐づく全てのタスク・予算データも削除されます。
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsEventDeleteConfirmOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50">キャンセル</button>
              <button onClick={confirmDeleteEvent} className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 shadow-lg">完全に削除</button>
            </div>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveEvent}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-gray-800">プロジェクトの新規作成</h3>
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Project Name</label>
                  <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                    value={editingItem?.name || ''} onChange={e=>setEditingItem({...editingItem, name: e.target.value})} placeholder="例: 2026 in 名古屋" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                    <input required className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.location || ''} onChange={e=>setEditingItem({...editingItem, location: e.target.value})} placeholder="会場名" />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={()=>setIsEventModalOpen(false)} className="px-8 py-4 font-bold text-gray-400">キャンセル</button>
                <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl">作成する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveTask}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-gray-800">タスクの設定</h3>
                <button type="button" onClick={() => { setIsTaskModalOpen(false); setIsNewTaskMode(false); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Task Name</label>
                  {!editingItem?.id && (
                    <button type="button" onClick={() => setIsNewTaskMode(!isNewTaskMode)} className="text-[10px] font-black text-[#284db3] flex items-center gap-1 hover:underline">
                      {isNewTaskMode ? <ListTodo size={12}/> : <Plus size={12}/>}
                      {isNewTaskMode ? "既存リストから選択" : "新しくタスク名を入力"}
                    </button>
                  )}
                </div>

                {!isNewTaskMode && !editingItem?.id ? (
                  <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]"
                    onChange={(e) => {
                      const template = INITIAL_TASKS.find(t => t.title === e.target.value);
                      if(template) setEditingItem({ ...editingItem, title: template.title, category: template.category });
                    }} value={editingItem?.title || ''}>
                    <option value="" disabled>タスクをリストから選択...</option>
                    {INITIAL_TASKS.map((t, idx) => <option key={idx} value={t.title}>{t.title} ({t.category})</option>)}
                  </select>
                ) : (
                  <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                    value={editingItem?.title || ''} onChange={e=>setEditingItem({...editingItem, title: e.target.value})} placeholder="タスク名を入力" />
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">担当者</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.assignee || ''} onChange={e=>setEditingItem({...editingItem, assignee: e.target.value})}>
                      <option value="">未割り当て</option>
                      {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">ステータス</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.status || ''} onChange={e=>setEditingItem({...editingItem, status: e.target.value})}>
                      {Object.values(TASK_STATUS).map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">開始日</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.startDate || ''} onChange={e=>setEditingItem({...editingItem, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">期日</label>
                    <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      value={editingItem?.dueDate || ''} onChange={e=>setEditingItem({...editingItem, dueDate: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={()=>{setIsTaskModalOpen(false); setIsNewTaskMode(false);}} className="px-8 py-4 font-bold text-gray-400">閉じる</button>
                <button type="submit" className="bg-[#284db3] text-white px-10 py-4 rounded-2xl font-black shadow-xl">保存する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
            <form onSubmit={handleSaveBudget}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-gray-800">予算項目の設定</h3>
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6">
                <input required className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" value={editingItem?.title || ''} onChange={e=>setEditingItem({...editingItem, title: e.target.value})} placeholder="項目名" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 ml-4">計画額 (¥)</label>
                    <input type="number" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none" value={editingItem?.planned || 0} onChange={e=>setEditingItem({...editingItem, planned: parseInt(e.target.value)})}/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 ml-4">執行額 (¥)</label>
                    <input type="number" className="w-full bg-gray-100 rounded-2xl p-5 font-bold outline-none" value={editingItem?.actual || 0} onChange={e=>setEditingItem({...editingItem, actual: parseInt(e.target.value)})}/>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex justify-end gap-4">
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