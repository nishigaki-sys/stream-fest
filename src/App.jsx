// src/App.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, doc, updateDoc, writeBatch, collection, serverTimestamp } from "firebase/firestore";
import { useAuth } from './contexts/AuthContext';
import { useFirestoreData } from './hooks/useFirestoreData';
import { ROLES } from './constants/appConfig';

// レイアウト・共通コンポーネント
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CombinedModals from './components/modals/CombinedModals';
import LoginPage from './pages/auth/LoginPage';
import EventDashboard from './components/dashboard/EventDashboard';

// ページコンポーネント
import HQOverview from './pages/hq/HQOverview';
import HQMemberManagement from './pages/hq/HQMemberManagement';
import KanbanBoard from './pages/common/KanbanBoard';
import GanttChart from './pages/common/GanttChart'; 
import BudgetTable from './pages/common/BudgetTable';
import ChatView from './pages/common/ChatView';
import TaskTable from './pages/common/TaskTable';
import SuppliesList from './pages/common/SuppliesList';

const db = getFirestore();

export default function App() {
  // 1. 認証とデータの取得
  const { currentUser, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const events = useFirestoreData("events");
  const tasks = useFirestoreData("tasks");
  const budgets = useFirestoreData("budgets");
  const users = useFirestoreData("users");
  const supplies = useFirestoreData("supplies");

  // 2. 状態管理
  const [activeTab, setActiveTab] = useState('hq-overview');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState({ type: null, data: null });

  // 3. ログイン時の自動遷移ロジック
  useEffect(() => {
    if (currentUser?.role === ROLES.HOST && currentUser.eventId) {
      setSelectedEventId(currentUser.eventId);
      setActiveTab('event-dashboard');
    }
  }, [currentUser]);

  // 4. 計算プロパティ
  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), [events, selectedEventId]
  );

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (selectedEventId) result = result.filter(t => t.eventId === selectedEventId);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.assignee && t.assignee.toLowerCase().includes(q))
      );
    }
    return result;
  }, [tasks, selectedEventId, searchQuery]);

  // 5. ハンドラー関数
  const openModal = (type, data = null) => setModalState({ type, data });
  const closeModal = () => setModalState({ type: null, data: null });

  const handleInstantTaskUpdate = async (taskId, updates) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), updates);
    } catch (err) {
      console.error("Task update error:", err);
    }
  };

  // プロジェクトのコピー機能
  const handleCopyProject = async () => {
    if (!selectedEvent) return;
    const confirmCopy = window.confirm(`「${selectedEvent.name}」をベースに新しいプロジェクトを作成しますか？\n(タスクと準備物の担当者・ステータスはリセットされます)`);
    if (!confirmCopy) return;

    try {
      const batch = writeBatch(db);
      const newEventRef = doc(collection(db, "events"));
      const newEventData = {
        ...selectedEvent,
        name: `${selectedEvent.name} (コピー)`,
        progress: 0,
        status: '進行中',
        createdAt: serverTimestamp()
      };
      delete newEventData.id;
      batch.set(newEventRef, newEventData);

      const eventTasks = tasks.filter(t => t.eventId === selectedEventId);
      eventTasks.forEach(task => {
        const newTaskRef = doc(collection(db, "tasks"));
        const { id, ...taskData } = task;
        batch.set(newTaskRef, {
          ...taskData,
          eventId: newEventRef.id,
          assignee: '',
          status: '未着手',
          startDate: '', 
          dueDate: '',
          progress: 0
        });
      });

      const eventSupplies = supplies.filter(s => s.eventId === selectedEventId);
      eventSupplies.forEach(supply => {
        const newSupplyRef = doc(collection(db, "supplies"));
        const { id, ...supplyData } = supply;
        batch.set(newSupplyRef, {
          ...supplyData,
          eventId: newEventRef.id,
          status: '未着手',
          method: '',
          supplier: '',
          assignee: ''
        });
      });

      await batch.commit();
      setSelectedEventId(newEventRef.id);
      setActiveTab('event-dashboard');
      alert('プロジェクトをコピーしました。');
    } catch (err) {
      console.error("Copy Error:", err);
      alert('コピーに失敗しました。');
    }
  };

  // プロジェクトの削除機能
  const handleDeleteProject = async () => {
    if (!selectedEvent) return;
    
    const confirmFirst = window.confirm(`「${selectedEvent.name}」を削除しますか？\nこの操作は取り消せず、関連する全てのタスク・準備物・予算データも削除されます。`);
    if (!confirmFirst) return;
    
    const confirmSecond = window.confirm(`本当に削除しますか？最終確認です。`);
    if (!confirmSecond) return;

    try {
      const batch = writeBatch(db);

      const eventTasks = tasks.filter(t => t.eventId === selectedEventId);
      const eventSupplies = supplies.filter(s => s.eventId === selectedEventId);
      const eventBudgets = budgets.filter(b => b.eventId === selectedEventId);

      eventTasks.forEach(t => batch.delete(doc(db, "tasks", t.id)));
      eventSupplies.forEach(s => batch.delete(doc(db, "supplies", s.id)));
      eventBudgets.forEach(b => batch.delete(doc(db, "budgets", b.id)));
      batch.delete(doc(db, "events", selectedEventId));

      await batch.commit();

      setSelectedEventId(null);
      setActiveTab('hq-overview');
      alert('プロジェクトを削除しました。');
    } catch (err) {
      console.error("Delete Error:", err);
      alert('削除に失敗しました。');
    }
  };

  // 6. ガード句
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#284db3]"></div>
      </div>
    );
  }
  if (!isLoggedIn) return <LoginPage />;

  // 7. コンテンツレンダリング
  const renderContent = () => {
    const eventContext = {
      tasks: filteredTasks,
      budgets: budgets.filter(b => b.eventId === selectedEventId),
      supplies: supplies.filter(s => s.eventId === selectedEventId),
    };

    switch (activeTab) {
      case 'hq-overview':
        return (
          <HQOverview 
            events={events} tasks={tasks} budgets={budgets} 
            onEventSelect={(id) => { setSelectedEventId(id); setActiveTab('event-dashboard'); }} 
            onAddEvent={() => openModal('event', { name: '', location: '' })}
          />
        );
      case 'hq-members':
        return <HQMemberManagement users={users} events={events} />;
      case 'event-dashboard':
        return (
          <EventDashboard 
            selectedEvent={selectedEvent}
            tasks={eventContext.tasks}
            budgets={eventContext.budgets}
            supplies={eventContext.supplies} // データを追加
            currentUser={currentUser}
            onTaskClick={(task) => openModal('task', task)}
            onEditSupplyClick={(item) => openModal('supply', item)} // ハンドラーを追加
            onKanbanLink={() => setActiveTab('kanban')}
          />
        );
      case 'task-list':
        return (
          <TaskTable 
            tasks={eventContext.tasks} users={users} 
            onAddTaskClick={() => openModal('task', { title: '', eventId: selectedEventId })}
            onTaskEdit={(task) => openModal('task', task)} 
          />
        );
      case 'kanban':
        return (
          <KanbanBoard 
            tasks={eventContext.tasks} 
            currentUser={currentUser} 
            onAddTaskClick={(status) => openModal('task', { title: '', status, eventId: selectedEventId })}
            onTaskEdit={(task) => openModal('task', task)} 
            onTaskUpdate={handleInstantTaskUpdate}
          />
        );
      case 'tasks':
        return <GanttChart tasks={eventContext.tasks} onTaskEdit={(task) => openModal('task', task)} />;
      case 'budget':
        return (
          <BudgetTable 
            budgets={eventContext.budgets} 
            onAddBudgetClick={() => openModal('budget', { title: '', planned: 0, actual: 0, eventId: selectedEventId })}
            onBudgetEdit={(budget) => openModal('budget', budget)}
          />
        );
      case 'supplies':
        return (
          <SuppliesList 
            items={eventContext.supplies} users={users} 
            onAddItemClick={() => openModal('supply', { name: '', eventId: selectedEventId })}
            onEditItemClick={(item) => openModal('supply', item)}
          />
        );
      case 'chat':
        return <ChatView currentUser={currentUser} users={users} selectedEventId={selectedEventId} />;
      case 'event-settings':
        return (
            <div className="max-w-2xl bg-white rounded-[2.5rem] border p-8 sm:p-12 animate-in fade-in">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-800">プロジェクト設定</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => openModal('event', selectedEvent)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    基本情報を編集
                  </button>
                  <button 
                    onClick={handleCopyProject}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    プロジェクトをコピー
                  </button>
                  <button 
                    onClick={handleDeleteProject}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    プロジェクトを削除
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 border-t pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs font-black text-gray-400 uppercase">会場</span>
                  <span className="col-span-2 text-sm font-bold text-gray-700">{selectedEvent?.location || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs font-black text-gray-400 uppercase">住所</span>
                  <span className="col-span-2 text-sm font-bold text-gray-700">{selectedEvent?.address || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs font-black text-gray-400 uppercase">開催期間</span>
                  <span className="col-span-2 text-sm font-bold text-gray-700">{selectedEvent?.period || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-xs font-black text-gray-400 uppercase">主催者</span>
                  <span className="col-span-2 text-sm font-bold text-gray-700">{selectedEvent?.organizer || '-'}</span>
                </div>
              </div>
            </div>
        );
      default:
        return <HQOverview events={events} tasks={tasks} budgets={budgets} onEventSelect={(id) => { setSelectedEventId(id); setActiveTab('event-dashboard'); }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans relative items-start">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        events={events}
        selectedEventId={selectedEventId}
        setSelectedEventId={setSelectedEventId}
      />

      <div className="flex-1 flex flex-col min-h-screen relative z-10 bg-gray-50">
        <Header 
          title={selectedEvent?.name || '全体俯瞰'} 
          user={currentUser} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMenuClick={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 sm:p-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <CombinedModals 
        state={modalState} 
        onClose={closeModal}
        context={{ selectedEventId, users }}
      />
    </div>
  );
}