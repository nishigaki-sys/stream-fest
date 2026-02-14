// src/pages/common/ChatView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Users, MessageSquare, Pencil, X, Check, Trash2 } from 'lucide-react';
import { 
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, deleteDoc, arrayUnion // arrayUnionを追加
} from "firebase/firestore";

const db = getFirestore();

export default function ChatView({ currentUser, users, selectedEventId }) {
  const [activeTab, setActiveTab] = useState('project'); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const scrollRef = useRef(null);

  const getDirectChatId = (email1, email2) => {
    return [email1, email2].sort().join('_');
  };

  useEffect(() => {
    let q;
    setMessages([]);

    if (activeTab === 'project') {
      if (!selectedEventId) return; 
      q = query(
        collection(db, "chats"),
        where("type", "==", "project"),
        where("eventId", "==", selectedEventId),
        orderBy("createdAt", "asc")
      );
    } else if (activeTab === 'individual' && selectedUser) {
      if (!currentUser?.email || !selectedUser?.email) return;
      const chatId = getDirectChatId(currentUser.email, selectedUser.email);
      q = query(
        collection(db, "chats"),
        where("type", "==", "individual"),
        where("chatId", "==", chatId),
        orderBy("createdAt", "asc")
      );
    }

    if (q) {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(fetchedMessages);

        // --- 既読処理の追加 ---
        if (currentUser?.uid) {
          fetchedMessages.forEach(async (msg) => {
            // 自分が送信者ではなく、かつ自分がまだ既読配列に入っていない場合のみ更新
            if (msg.senderEmail !== currentUser.email && (!msg.readBy || !msg.readBy.includes(currentUser.uid))) {
              try {
                const msgRef = doc(db, "chats", msg.id);
                await updateDoc(msgRef, {
                  readBy: arrayUnion(currentUser.uid)
                });
              } catch (err) {
                console.error("既読更新エラー:", err);
              }
            }
          });
        }
        // --------------------

      }, (error) => {
        console.error("Firebase Snapshot Error:", error);
      });
      return () => unsubscribe();
    }
  }, [activeTab, selectedUser, selectedEventId, currentUser]); // currentUserを依存配列に追加

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, editingMessageId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      senderName: currentUser?.name || '不明なユーザー',
      senderEmail: currentUser?.email || '',
      createdAt: serverTimestamp(),
      readBy: [currentUser.uid], // 送信時に自分を既読に含める
    };

    try {
      if (activeTab === 'project') {
        await addDoc(collection(db, "chats"), {
          ...messageData,
          type: "project",
          eventId: selectedEventId
        });
      } else if (activeTab === 'individual' && selectedUser) {
        const chatId = getDirectChatId(currentUser.email, selectedUser.email);
        await addDoc(collection(db, "chats"), {
          ...messageData,
          type: "individual",
          chatId: chatId,
          participants: [currentUser.email, selectedUser.email]
        });
      }
      setNewMessage('');
    } catch (error) {
      console.error("送信エラー:", error);
    }
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleUpdateMessage = async (msgId) => {
    if (!editText.trim()) return;
    try {
      const messageRef = doc(db, "chats", msgId);
      await updateDoc(messageRef, {
        text: editText,
        updatedAt: serverTimestamp()
      });
      setEditingMessageId(null);
      setEditText('');
    } catch (error) {
      console.error("更新エラー:", error);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("このメッセージを削除してもよろしいですか？")) return;
    try {
      await deleteDoc(doc(db, "chats", msgId));
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
      <div className="flex border-b bg-gray-50/30 shrink-0">
        <button 
          onClick={() => { setActiveTab('project'); setSelectedUser(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-black text-sm transition-all ${activeTab === 'project' ? 'text-[#284db3] border-b-4 border-[#284db3] bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Users size={18}/> プロジェクト全体
        </button>
        <button 
          onClick={() => setActiveTab('individual')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 font-black text-sm transition-all ${activeTab === 'individual' ? 'text-[#284db3] border-b-4 border-[#284db3] bg-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <User size={18}/> 個別チャット
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'individual' && (
          <div className="w-1/3 border-r overflow-y-auto bg-gray-50/30">
            <div className="p-3 text-[10px] font-black text-gray-400 uppercase border-b bg-gray-100/50">メンバーリスト</div>
            {users && users.filter(u => u.email !== currentUser?.email).map(user => (
              <div 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 cursor-pointer border-b transition-all flex items-center gap-3 ${selectedUser?.email === user.email ? 'bg-white shadow-inner border-l-4 border-l-[#284db3]' : 'hover:bg-white/50'}`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#284db3] font-bold text-xs shrink-0">
                  {user.name ? user.name[0] : '?'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-gray-800 truncate">{user.name}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">{user.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(activeTab === 'project' || selectedUser) ? (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.senderEmail === currentUser?.email ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase">{msg.senderName}</span>
                      {msg.senderEmail === currentUser?.email && editingMessageId !== msg.id && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditing(msg)} className="text-gray-300 hover:text-[#284db3] transition-colors p-1">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {editingMessageId === msg.id ? (
                      <div className="w-full max-w-[80%] space-y-2 animate-in slide-in-from-top-1">
                        <textarea 
                          className="w-full p-3 text-sm border-2 border-[#284db3] rounded-xl outline-none bg-white font-medium shadow-inner"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={cancelEditing} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                            <X size={14} />
                          </button>
                          <button onClick={() => handleUpdateMessage(msg.id)} className="p-1.5 rounded-lg bg-[#284db3] text-white hover:bg-blue-700 shadow-md">
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group flex flex-col items-end max-w-[80%]">
                        <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm relative ${
                          msg.senderEmail === currentUser?.email 
                            ? 'bg-[#284db3] text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                          {msg.updatedAt && (
                            <span className={`block text-[8px] mt-1 opacity-50 text-right ${msg.senderEmail === currentUser?.email ? 'text-white' : 'text-gray-400'}`}>
                              (編集済)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                <MessageSquare size={48} strokeWidth={1}/>
                <p className="font-bold text-sm">メッセージを選択してください</p>
              </div>
            )}
          </div>

          {(activeTab === 'project' || selectedUser) && (
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50/30 shrink-0">
              <div className="relative">
                <input 
                  type="text"
                  placeholder={selectedUser ? `${selectedUser.name} さんにメッセージ...` : "全体へメッセージ..."}
                  className="w-full bg-white border-2 border-transparent focus:border-[#284db3] rounded-2xl py-4 pl-6 pr-14 outline-none font-bold shadow-sm transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#284db3] text-white hover:bg-blue-700 disabled:bg-gray-300 shadow-lg shadow-blue-100 transition-all"
                >
                  <Send size={18}/>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}