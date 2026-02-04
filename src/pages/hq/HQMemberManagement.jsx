import React, { useState } from 'react';
import { UserPlus, Mail, Shield, Pencil, Save, X, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { ROLES } from '../../constants/appConfig';

export default function HQMemberManagement({ users, events, onUpdateUsers }) {
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

  const confirmDelete = () => {
    onUpdateUsers(users.filter(u => u.id !== userToDelete.id));
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingUser.id) {
      onUpdateUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    } else {
      onUpdateUsers([...users, { ...editingUser, id: Date.now() }]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
          <Shield className="text-blue-600" /> メンバー・権限管理
        </h3>
        <button 
          onClick={() => { 
            setEditingUser({ name: '', email: '', role: ROLES.HOST, eventId: null, password: '' });
            setIsModalOpen(true); 
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <UserPlus size={20}/> メンバー招待
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
                      <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={18}/>
                      </button>
                      <button onClick={() => handleDeleteClick(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
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

      {/* 編集・追加モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200">
            <form onSubmit={handleSave}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/30">
                <h3 className="font-black text-xl text-gray-800">{editingUser?.id ? 'メンバー情報の編集' : '新規メンバー招待'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">名前</label>
                  <input required className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                    value={editingUser?.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">メールアドレス</label>
                  <input required type="email" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                    value={editingUser?.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">{editingUser?.id ? '新しいパスワード (任意)' : '初期パスワード'}</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                    <input required={!editingUser?.id} type="text" className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="6文字以上" value={editingUser?.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">役割</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold" value={editingUser?.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                      {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-4">担当</label>
                    <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold" value={editingUser?.eventId || ''} onChange={e => setEditingUser({...editingUser, eventId: e.target.value || null})}>
                      <option value="">全体管理</option>
                      {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-gray-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600">キャンセル</button>
                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">保存する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">メンバーの削除</h3>
              <p className="text-gray-500 font-medium mb-8">
                <span className="font-bold text-gray-800">{userToDelete?.name}</span> さんを削除してもよろしいですか？<br/>
                この操作は取り消せません。
              </p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors">
                  キャンセル
                </button>
                <button onClick={confirmDelete} className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 transition-all">
                  削除する
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}