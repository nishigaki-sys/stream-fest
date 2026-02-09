import React, { useState } from 'react';
import { Mail, Shield, Pencil, Trash2, X, Lock, Save, AlertTriangle, Users } from 'lucide-react';
import { getFirestore, doc, updateDoc, addDoc, collection, deleteDoc } from "firebase/firestore";
import { ROLES } from '../../constants/appConfig';

const db = getFirestore();

export default function HQMemberManagement({ users, events }) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl sm:text-2xl font-black text-gray-800 flex items-center gap-3">
          <Shield className="text-[#284db3]" /> メンバー・権限管理
        </h3>
        <button 
          onClick={() => { setEditingUser({ name: '', email: '', role: ROLES.HOST, eventId: null, password: '' }); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-[#284db3] text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        >
          <Users size={20}/> メンバー招待
        </button>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 border-b">
              <tr>
                <th className="px-4 sm:px-8 py-5">名前</th>
                <th className="hidden md:table-cell px-8 py-5">メール</th>
                <th className="px-4 sm:px-8 py-5">役割</th>
                <th className="hidden sm:table-cell px-8 py-5">担当プロジェクト</th>
                <th className="px-4 sm:px-8 py-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 sm:px-8 py-4 sm:py-6">
                    <div className="font-bold text-gray-700">{user.name}</div>
                    <div className="md:hidden text-[10px] text-gray-400">{user.email}</div>
                  </td>
                  <td className="hidden md:table-cell px-8 py-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2"><Mail size={14}/> {user.email}</div>
                  </td>
                  <td className="px-4 sm:px-8 py-6">
                    <span className="px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase" 
                      style={{ backgroundColor: user.role === ROLES.HQ ? '#284db315' : '#f3f4f6', color: user.role === ROLES.HQ ? '#284db3' : '#6b7280' }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-8 py-6 text-sm font-bold text-gray-500">
                    {user.eventId ? events.find(e => e.id === user.eventId)?.name : '未割当（全体）'}
                  </td>
                  <td className="px-4 sm:px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <button onClick={() => handleEditClick(user)} className="p-2 text-gray-400 hover:text-[#284db3] transition-colors"><Pencil size={18}/></button>
                      <button onClick={() => handleDeleteClick(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
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
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSave}>
              <div className="p-6 sm:p-8 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="font-black text-lg sm:text-xl text-gray-800">{editingUser?.id ? 'メンバー情報の編集' : '新規メンバー招待'}</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
              </div>
              <div className="p-6 sm:p-10 space-y-6">
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
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-4">{editingUser?.id ? 'パスワード (変更時のみ)' : '初期パスワード'}</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                    <input required={!editingUser?.id} type="text" className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 font-bold outline-none focus:ring-2 focus:ring-[#284db3]" 
                      placeholder="6文字以上" value={editingUser?.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
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
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden p-8 sm:p-10 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800 mb-2">メンバーの削除</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-8">
              <span className="font-bold text-gray-800">{userToDelete?.name}</span> さんを削除してもよろしいですか？
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="order-2 sm:order-1 flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 bg-gray-50">キャンセル</button>
              <button onClick={confirmDelete} className="order-1 sm:order-2 flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 shadow-lg">削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}