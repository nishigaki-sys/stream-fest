// src/components/modals/DeleteConfirmModal.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * 削除確認専用モーダル
 * @param {boolean} isOpen - モーダルの開閉状態
 * @param {function} onClose - 閉じる処理
 * @param {string} target - 削除対象の種別 ('プロジェクト' | 'タスク' | '準備物')
 * @param {object} item - 削除対象のデータオブジェクト
 */
export default function DeleteConfirmModal({ isOpen, onClose, target, item }) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 sm:p-10 text-center animate-in zoom-in duration-200">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-xl sm:text-2xl font-black text-gray-800 mb-2">
          {target}の削除
        </h3>
        
        <p className="text-sm sm:text-base text-gray-500 mb-8">
          「<span className="font-bold text-gray-900">{item.name || item.title}</span>」を削除しますか？
          {target === 'プロジェクト' && <><br/>紐づく全てのデータも削除されます。</>}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose} 
            className="order-2 sm:order-1 flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={() => {

                alert("削除処理は詳細編集画面から実行してください。");
                onClose();
            }} 
            className="order-1 sm:order-2 flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 shadow-lg hover:bg-red-600 transition-all"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}