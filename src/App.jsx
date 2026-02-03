import './index.css'
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Calendar, 
  MessageSquare, 
  User, 
  ArrowRightLeft, 
  Bell, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Filter,
  Users,
  Building2,
  MapPin,
  TrendingUp,
  ChevronDown,
  Layers,
  UserPlus,
  ShieldCheck,
  UserCog,
  Trash2,
  Save,
  BarChart3,
  ExternalLink,
  Settings2,
  CalendarDays,
  Pencil,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Kanban as KanbanIcon,
  Circle,
  GripVertical
} from 'lucide-react';

// --- Color Palette Constants ---
const BRAND_COLORS = {
  BLUE: '#284db3',
  LIGHT_GREEN: '#c2e086',
  PINK: '#ffc1bc',
  GREEN: '#34cc99',
  YELLOW: '#fef667',
  RED: '#fd594e',
  ORANGE: '#fe9a33'
};

// --- Constants & Types ---
const ROLES = {
  HQ: '本部',
  HOST: '主催',
  PARTNER: '提供',
  SUPPORT: '後援・共催'
};

const TASK_STATUS = {
  TODO: '未着手',
  IN_PROGRESS: '進行中',
  PENDING: '確認待ち',
  DONE: '完了'
};

const BUDGET_CATEGORIES = ['会場費', '広報広告費', '制作物費', '運営人件費', '機材備品費', 'その他'];
const CATEGORIES = ['①設計', '②準備', '③運営', '④事後'];

// --- Mock Data ---
const INITIAL_EVENTS = [
  { id: 'ev_osaka', name: 'STREAM FEST. 2026 in 大阪', location: 'マイドームおおさか', hostName: '石垣', status: '進行中', progress: 68, startDate: '2026-05-05' },
  { id: 'ev_tokyo', name: 'STREAM FEST. 2026 in 東京', location: '東京ビッグサイト', hostName: '大津', status: '設計中', progress: 32, startDate: '2026-07-20' },
  { id: 'ev_fukuoka', name: 'STREAM FEST. 2026 in 福岡', location: '福岡国際会議場', hostName: '地域パートナー', status: '未着手', progress: 0, startDate: '2026-09-12' },
];

const INITIAL_USERS = [
  { id: 1, name: '重見', role: ROLES.HQ, email: 'shigemi@stream-fest.org', eventId: null },
  { id: 2, name: '石垣', role: ROLES.HOST, email: 'ishigaki@edion.com', eventId: 'ev_osaka' },
  { id: 3, name: '大津', role: ROLES.HOST, email: 'otsu@yumemiru.jp', eventId: 'ev_tokyo' },
  { id: 4, name: '池田', role: ROLES.HQ, email: 'ikeda@stream-fest.org', eventId: null },
];

const INITIAL_TASKS = [
  { id: 101, eventId: 'ev_osaka', title: '全体スケジュール設定', category: '①設計', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.DONE, startDate: '2026-01-05', dueDate: '2026-01-20', progress: 100 },
  { id: 102, eventId: 'ev_osaka', title: '会場選定・下見', category: '①設計', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.DONE, startDate: '2026-01-10', dueDate: '2026-01-25', progress: 100 },
  { id: 103, eventId: 'ev_osaka', title: '広報計画策定', category: '①設計', role: ROLES.HQ, assignee: '重見', status: TASK_STATUS.DONE, startDate: '2026-01-15', dueDate: '2026-01-30', progress: 100 },
  { id: 104, eventId: 'ev_osaka', title: '制作物一覧作成', category: '①設計', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.IN_PROGRESS, startDate: '2026-01-20', dueDate: '2026-02-15', progress: 70 },
  { id: 201, eventId: 'ev_osaka', title: '公式Webサイト作成', category: '②準備', role: ROLES.HQ, assignee: '池田', status: TASK_STATUS.IN_PROGRESS, startDate: '2026-02-01', dueDate: '2026-03-01', progress: 45 },
  { id: 202, eventId: 'ev_osaka', title: '共催・後援依頼の送付', category: '②準備', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.PENDING, startDate: '2026-02-10', dueDate: '2026-03-10', progress: 90 },
  { id: 203, eventId: 'ev_osaka', title: 'スポンサー営業', category: '②準備', role: ROLES.HOST, assignee: '石垣', status: TASK_STATUS.TODO, startDate: '2026-02-15', dueDate: '2026-04-10', progress: 0 },
];

const INITIAL_BUDGETS = [
  { id: 1, eventId: 'ev_osaka', title: '会場レンタル代', category: '会場費', planned: 500000, actual: 500000, status: '完了' },
  { id: 2, eventId: 'ev_osaka', title: 'SNS広告運用費', category: '広報広告費', planned: 200000, actual: 150000, status: '進行中' },
];

// --- Sub-Components ---

const StatCard = ({ title, value, subValue, icon: Icon, color, isCurrency = false }) => (
  <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md">
    <div className="min-w-0">
      <span className="text-gray-500 text-xs sm:text-sm font-medium block truncate">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl sm:text-2xl font-black" style={{ color }}>
          {isCurrency ? `¥${value.toLocaleString()}` : value}
        </span>
        {subValue && <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap">{subValue}</span>}
      </div>
    </div>
    <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
      <Icon size={18} />
    </div>
  </div>
);

const ProgressBar = ({ progress, height = "h-2", color = BRAND_COLORS.BLUE }) => (
  <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
    <div 
      className="h-full transition-all duration-700 ease-out" 
      style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}
    ></div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('hq-overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentUser] = useState({ name: '重見', role: ROLES.HQ, assignedEventId: null });
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // Modal States
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({ name: '', email: '', role: ROLES.HQ, eventId: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentTask, setCurrentTask] = useState({ id: null, title: '', category: CATEGORIES[0], role: ROLES.HQ, assignee: '', startDate: '', dueDate: '', progress: 0, status: TASK_STATUS.TODO });
  const [currentBudget, setCurrentBudget] = useState({ id: null, title: '', category: BUDGET_CATEGORIES[0], planned: 0, actual: 0, status: '未着手' });

  const isHQ = currentUser.role === ROLES.HQ;

  const projectMembers = useMemo(() => {
    if (!selectedEventId) return users.filter(u => u.role === ROLES.HQ);
    return users.filter(u => u.role === ROLES.HQ || u.eventId === selectedEventId);
  }, [users, selectedEventId]);

  useEffect(() => {
    if (!isHQ && !selectedEventId) {
      const hostEvent = events.find(e => e.hostName === currentUser.name) || events[0];
      if (hostEvent) {
        setSelectedEventId(hostEvent.id);
        setActiveTab('event-dashboard');
      }
    }
  }, [isHQ, events, currentUser.name, selectedEventId]);

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), [events, selectedEventId]
  );

  const filteredBudgets = useMemo(() => {
    let result = budgets;
    if (selectedEventId) {
      result = result.filter(b => b.eventId === selectedEventId);
    }
    return result;
  }, [budgets, selectedEventId]);

  const budgetSummary = useMemo(() => {
    const planned = filteredBudgets.reduce((acc, curr) => acc + curr.planned, 0);
    const actual = filteredBudgets.reduce((acc, curr) => acc + curr.actual, 0);
    const remaining = planned - actual;
    return { planned, actual, remaining };
  }, [filteredBudgets]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedEventId) {
      result = result.filter(t => t.eventId === selectedEventId);
    }
    if (searchQuery) {
      result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return [...result].sort((a, b) => a.category.localeCompare(b.category) || a.startDate.localeCompare(b.startDate));
  }, [tasks, selectedEventId, searchQuery]);

  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.assignee === currentUser.name && t.status !== TASK_STATUS.DONE);
  }, [tasks, currentUser.name]);

  const handleEventSelect = (id) => {
    setSelectedEventId(id);
    setActiveTab('event-dashboard');
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
  };

  // --- Handlers ---
  const handleOpenBudgetModal = (budget = null) => {
    if (budget) setCurrentBudget({ ...budget });
    else setCurrentBudget({ id: null, title: '', category: BUDGET_CATEGORIES[0], planned: 0, actual: 0, status: '未着手' });
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    if (currentBudget.id) setBudgets(budgets.map(b => b.id === currentBudget.id ? currentBudget : b));
    else setBudgets([...budgets, { ...currentBudget, id: Date.now(), eventId: selectedEventId }]);
    setIsBudgetModalOpen(false);
  };

  const handleOpenEventModal = (event = null) => {
    if (event) setEditingEvent({ ...event });
    else setEditingEvent({ id: `ev_${Date.now()}`, name: '', location: '', hostName: '', status: '未着手', progress: 0, startDate: '' });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    const exists = events.find(e => e.id === editingEvent.id);
    setEvents(exists ? events.map(e => e.id === editingEvent.id ? editingEvent : e) : [...events, editingEvent]);
    setIsEventModalOpen(false);
  };

  const handleOpenTaskModal = (task = null) => {
    if (task) setCurrentTask({ ...task });
    else setCurrentTask({ id: null, title: '', category: CATEGORIES[0], role: projectMembers[0]?.role || ROLES.HQ, assignee: projectMembers[0]?.name || '', startDate: '', dueDate: '', progress: 0, status: TASK_STATUS.TODO });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (currentTask.id) setTasks(tasks.map(t => t.id === currentTask.id ? currentTask : t));
    else setTasks([...tasks, { ...currentTask, id: Date.now(), eventId: selectedEventId }]);
    setIsTaskModalOpen(false);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { id: Date.now(), ...newUser, eventId: newUser.role === ROLES.HQ ? null : (newUser.eventId || null) }]);
    setNewUser({ name: '', email: '', role: ROLES.HQ, eventId: '' });
    setIsAddUserModalOpen(false);
  };

  // --- Drag and Drop Handlers ---
  const onDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, status) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        let newProgress = task.progress;
        if (targetStatus === TASK_STATUS.DONE) newProgress = 100;
        if (targetStatus === TASK_STATUS.TODO && task.progress === 100) newProgress = 0;
        
        return { ...task, status: targetStatus, progress: newProgress };
      }
      return task;
    }));
    
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  const onDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  // --- Style Helpers ---
  const getCategoryColor = (category) => {
    if (category.includes('①')) return BRAND_COLORS.PINK;
    if (category.includes('②')) return BRAND_COLORS.BLUE;
    if (category.includes('③')) return BRAND_COLORS.GREEN;
    if (category.includes('④')) return BRAND_COLORS.LIGHT_GREEN;
    return BRAND_COLORS.BLUE;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.DONE: return BRAND_COLORS.GREEN;
      case TASK_STATUS.IN_PROGRESS: return BRAND_COLORS.ORANGE;
      case TASK_STATUS.TODO: return BRAND_COLORS.RED;
      case TASK_STATUS.PENDING: return BRAND_COLORS.YELLOW;
      default: return BRAND_COLORS.BLUE;
    }
  };

  // --- Kanban Column Render ---
  const renderKanbanColumn = (status) => {
    const columnTasks = filteredTasks.filter(t => t.status === status);
    const isOver = dragOverStatus === status;
    
    return (
      <div 
        className={`flex-1 min-w-[280px] sm:min-w-[320px] h-full flex flex-col rounded-3xl p-4 transition-all duration-200 ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-gray-100/50'
        }`}
        onDragOver={(e) => onDragOver(e, status)}
        onDrop={(e) => onDrop(e, status)}
        onDragLeave={() => setDragOverStatus(null)}
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
            <h4 className="font-black text-sm uppercase tracking-widest text-gray-500">{status}</h4>
          </div>
          <span className="bg-white text-[10px] font-black px-2 py-1 rounded-lg border shadow-sm text-gray-400">{columnTasks.length}</span>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
          {columnTasks.map(task => (
            <div 
              key={task.id} 
              draggable
              onDragStart={(e) => onDragStart(e, task.id)}
              onDragEnd={onDragEnd}
              onClick={() => handleOpenTaskModal(task)}
              className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-grab active:cursor-grabbing group relative overflow-hidden ${
                draggedTaskId === task.id ? 'opacity-40 grayscale scale-95' : ''
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: getCategoryColor(task.category) }} />
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md" style={{ backgroundColor: `${getCategoryColor(task.category)}20`, color: getCategoryColor(task.category) }}>
                  {task.category}
                </span>
                <div className="flex items-center gap-1 text-gray-300">
                   {task.status === TASK_STATUS.DONE && <CheckCircle2 size={14} className="text-green-500" />}
                   <GripVertical size={14} className="group-hover:text-gray-400" />
                </div>
              </div>
              <h5 className="font-bold text-sm text-gray-800 leading-snug group-hover:text-blue-700 transition-colors mb-4">{task.title}</h5>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-black border border-white shadow-sm" style={{ backgroundColor: `${BRAND_COLORS.BLUE}15`, color: BRAND_COLORS.BLUE }}>{task.assignee[0]}</div>
                  <span>{task.assignee}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400">
                  <CalendarDays size={12} />
                  <span>{task.dueDate.split('-').slice(1).join('/')}</span>
                </div>
              </div>
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-2xl opacity-40">
              <Plus size={24} className="text-gray-400 mb-2" />
              <p className="text-[10px] font-black uppercase text-gray-400">Drag to move</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Views ---
  const renderKanban = () => (
    <div className="h-[calc(100vh-250px)] animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
      <div className="flex gap-6 h-full min-w-max pb-4">
        {renderKanbanColumn(TASK_STATUS.TODO)}
        {renderKanbanColumn(TASK_STATUS.IN_PROGRESS)}
        {renderKanbanColumn(TASK_STATUS.PENDING)}
        {renderKanbanColumn(TASK_STATUS.DONE)}
      </div>
    </div>
  );

  const renderHQOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="開催予定数" value={events.length} subValue="2026年度" icon={Building2} color={BRAND_COLORS.BLUE} />
        <StatCard title="全体予算規模" value={budgets.reduce((acc,curr)=>acc+curr.planned, 0)} icon={Wallet} color={BRAND_COLORS.GREEN} isCurrency />
        <StatCard title="要対応アラート" value={todayTasks.length} subValue="未完了タスク" icon={AlertCircle} color={BRAND_COLORS.RED} />
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden text-sm sm:text-base">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold flex items-center gap-2"><Layers size={20} style={{ color: BRAND_COLORS.BLUE }} /> プロジェクト一覧</h3>
          <button onClick={() => handleOpenEventModal()} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold" style={{ backgroundColor: BRAND_COLORS.BLUE }}><Plus size={16} />新規作成</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
              <tr><th className="px-6 py-4">プロジェクト</th><th className="px-6 py-4">会場 / 開催日</th><th className="px-6 py-4">進捗</th><th className="px-6 py-4 text-right">予算消化</th><th className="px-6 py-4 text-right">管理</th></tr>
            </thead>
            <tbody>
              {events.map(event => {
                const eb = budgets.filter(b => b.eventId === event.id);
                const p = eb.reduce((a,c)=>a+c.planned,0);
                const a = eb.reduce((a,c)=>a+c.actual,0);
                return (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors border-b last:border-0">
                    <td className="px-6 py-4 cursor-pointer" onClick={() => handleEventSelect(event.id)}><div className="font-black text-gray-700">{event.name}</div><div className="text-[10px] text-gray-400 font-bold uppercase">{event.id}</div></td>
                    <td className="px-6 py-4"><div className="font-bold text-gray-600">¥ {event.location}</div><div className="text-[10px] text-gray-400">{event.startDate || '未定'}</div></td>
                    <td className="px-6 py-4 min-w-[150px]"><ProgressBar progress={event.progress} color={BRAND_COLORS.BLUE} /></td>
                    <td className="px-6 py-4 text-right font-bold">¥{a.toLocaleString()} <span className="text-[10px] text-gray-400 block font-normal">/ ¥{p.toLocaleString()}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => handleOpenEventModal(event)} className="p-2 text-gray-300 hover:text-gray-900"><Settings2 size={18} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans relative overflow-hidden">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b flex justify-between items-center"><div className="flex items-center gap-2"><Layers style={{ color: BRAND_COLORS.BLUE }} size={24} strokeWidth={3} /><h1 className="text-xl font-black tracking-tighter uppercase" style={{ color: BRAND_COLORS.BLUE }}>STREAM FEST.</h1></div><button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2"><X size={24} /></button></div>
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {isHQ && <button onClick={() => {setActiveTab('hq-overview'); setSelectedEventId(null);}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'hq-overview' ? 'text-white font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`} style={{ backgroundColor: activeTab === 'hq-overview' ? BRAND_COLORS.BLUE : 'transparent' }}><LayoutDashboard size={20} /><span>プロジェクト総覧</span></button>}
          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">プロジェクト管理</div>
          {isHQ && <div className="px-4 mb-4"><select className="w-full bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none" value={selectedEventId || ''} onChange={(e) => handleEventSelect(e.target.value)}><option value="" disabled>地域を選択...</option>{events.map(ev => <option key={ev.id} value={ev.id}>{ev.name.split('in')[1] || ev.name}</option>)}</select></div>}
          {[
            { id: 'event-dashboard', icon: TrendingUp, label: 'ダッシュボード', hide: !selectedEventId },
            { id: 'kanban', icon: KanbanIcon, label: 'カンバンボード', hide: !selectedEventId },
            { id: 'tasks', icon: ListTodo, label: 'タスク & WBS', hide: !selectedEventId },
            { id: 'budget', icon: Wallet, label: '予算管理', hide: !selectedEventId },
          ].map(item => !item.hide && <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === item.id ? 'text-white font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`} style={{ backgroundColor: activeTab === item.id ? BRAND_COLORS.BLUE : 'transparent' }}><item.icon size={20} /><span>{item.label}</span></button>)}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b h-16 sm:h-20 flex items-center justify-between px-4 sm:px-10 sticky top-0 z-30">
          <button className="lg:hidden p-2 text-gray-500" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
          <div className="relative max-w-xs sm:max-w-md w-full hidden sm:block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="検索..." className="w-full pl-12 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl text-sm outline-none font-medium focus:ring-2 focus:ring-blue-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div className="flex items-center gap-2 sm:gap-6"><button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className={`relative p-2.5 rounded-xl ${isNotificationOpen ? 'bg-blue-50 text-blue-600' : ''}`}><Bell size={22} />{todayTasks.length > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-2 border-white rounded-full bg-red-500 animate-pulse"></span>}</button><div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2 border-white" style={{ backgroundColor: `${BRAND_COLORS.BLUE}15`, color: BRAND_COLORS.BLUE }}>{currentUser.name[0]}</div></div>
        </header>

        <div className="p-4 sm:p-10 max-w-7xl mx-auto w-full pb-20">
          <div className="mb-6"><div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2"><span>{isHQ ? 'HQ' : 'Host'}</span><ChevronRight size={12} /><span style={{ color: BRAND_COLORS.BLUE }} className="font-black uppercase">{activeTab.replace('-', ' ')}</span></div><h2 className="text-2xl sm:text-4xl font-black tracking-tight uppercase leading-tight">{selectedEvent?.name || '総覧'}</h2></div>
          {activeTab === 'hq-overview' && renderHQOverview()}
          {activeTab === 'kanban' && renderKanban()}
          {/* 他のタブは適宜表示... (renderWBS, renderBudgetDetailed等) */}
        </div>
      </main>

      {/* --- Task Modal --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative my-auto animate-in zoom-in-95 duration-200 overflow-hidden">
            <form onSubmit={handleSaveTask} className="flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50"><h3 className="text-xl font-black">Edit Ticket</h3><button type="button" onClick={() => setIsTaskModalOpen(false)}><X size={24}/></button></div>
              <div className="p-6 sm:p-8 space-y-6">
                <input required className="w-full bg-gray-100 border-none rounded-2xl px-5 py-4 font-bold outline-none" value={currentTask.title} onChange={e => setCurrentTask({...currentTask, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-6">
                  <select className="w-full bg-gray-100 rounded-2xl px-5 py-4 font-bold" value={currentTask.status} onChange={e => setCurrentTask({...currentTask, status: e.target.value})}>{Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <input required type="date" className="w-full bg-gray-100 rounded-2xl px-5 py-4 font-bold" value={currentTask.dueDate} onChange={e => setCurrentTask({...currentTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="p-6 bg-gray-50 text-right"><button type="submit" className="px-8 py-4 rounded-2xl text-white font-black" style={{ backgroundColor: BRAND_COLORS.BLUE }}>Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}