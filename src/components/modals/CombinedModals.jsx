// src/components/modals/CombinedModals.jsx
import React from 'react';
import TaskModal from './TaskModal'; // 要別ファイル化
import EventModal from './EventModal'; // 要別ファイル化
import SupplyModal from './SupplyModal'; // 要別ファイル化
import BudgetModal from './BudgetModal'; // 要別ファイル化
import DeleteConfirmModal from './DeleteConfirmModal'; // 要別ファイル化

export default function CombinedModals({ state, onClose, context }) {
  const { type, data } = state;
  if (!type) return null;

  // 各保存処理のラッパー（実際のFirebase保存ロジックを各モーダルへ内包させる）
  return (
    <>
      {type === 'task' && (
        <TaskModal 
          isOpen={true} 
          onClose={onClose} 
          editingItem={data} 
          users={context.users} 
          eventId={context.selectedEventId} 
        />
      )}

      {type === 'event' && (
        <EventModal 
          isOpen={true} 
          onClose={onClose} 
          editingItem={data} 
        />
      )}

      {type === 'supply' && (
        <SupplyModal 
          isOpen={true} 
          onClose={onClose} 
          editingItem={data} 
          users={context.users} 
          eventId={context.selectedEventId} 
        />
      )}

      {type === 'budget' && (
        <BudgetModal 
          isOpen={true} 
          onClose={onClose} 
          editingItem={data} 
          eventId={context.selectedEventId} 
        />
      )}

      {type === 'delete' && (
        <DeleteConfirmModal 
          isOpen={true} 
          onClose={onClose} 
          target={data.target} 
          item={data.item} 
        />
      )}
    </>
  );
}