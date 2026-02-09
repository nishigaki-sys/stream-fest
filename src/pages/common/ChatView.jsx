import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Users, MessageSquare } from 'lucide-react';
import { 
  getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp 
} from "firebase/firestore";

const db = getFirestore();

export default function ChatView({ currentUser, users, selectedEventId }) {
  const [activeTab, setActiveTab] = useState('project'); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const scrollRef = useRef(null);

  // ダイレクトメッセージ用の一意なIDを生成する関数
  const getDirectChatId = (email1, email2) => {
    return [email1, email2].sort().join('_');
  };

  // メッセージのリアルタイム取得
  useEffect(() => {
    let q;
    setMessages([]); // タブやユーザー切り替え時に表示をリセット

    if (activeTab === 'project') {
      // プロジェクト全体チャット
      if (!selectedEventId) return; 
      q = query(
        collection(db, "chats"),
        where("type", "==", "project"),
        where("eventId", "==", selectedEventId),
        orderBy("createdAt", "asc")
      );
    } else if (activeTab === 'individual' && selectedUser) {
      // 個別チャット：自分と相手のメールアドレスを組み合わせたIDで絞り込む
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
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        console.error("Firebase Snapshot Error:", error);
      });
      return () => unsubscribe();
    }
  }, [activeTab, selectedUser, selectedEventId, currentUser?.email]);

  // 新着メッセージ受信時に自動スクロール
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // メッセージ送信処理
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      senderName: currentUser?.name || '不明なユーザー',
      senderEmail: currentUser?.email || '',
      createdAt: serverTimestamp(),
    };

    try {
      if (activeTab === 'project') {
        if (!selectedEventId) {
          console.error("エラー: プロジェクトIDが未定義のため送信できません。");
          return;
        }
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

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in fade-in">
      {/* タブヘッダー */}
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
        {/* 個別チャット時のユーザーリスト */}
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
            {!users && <div className="p-4 text-center text-xs text-gray-400 font-bold">読み込み中...</div>}
          </div>
        )}

        {/* メッセージエリア */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* 個別チャット時の相手名表示 */}
          {activeTab === 'individual' && selectedUser && (
            <div className="px-6 py-3 border-b bg-gray-50/50 flex items-center gap-3 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-black text-gray-600">{selectedUser.name} との対話</span>
            </div>
          )}

          {/* メッセージ表示エリア */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            { (activeTab === 'project' || selectedUser) ? (
              messages.length > 0 ? (
                <>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderEmail === currentUser?.email ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase">{msg.senderName}</span>
                      </div>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${
                        msg.senderEmail === currentUser?.email 
                          ? 'bg-[#284db3] text-white rounded-tr-none' 
                          : 'bg-gray-100 text-gray-800 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 py-20">
                  <MessageSquare size={48} strokeWidth={1}/>
                  <p className="font-bold text-sm">メッセージはまだありません</p>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
                <User size={48} strokeWidth={1}/>
                <p className="font-bold text-sm mt-2">メンバーを選択してチャットを開始してください</p>
              </div>
            )}
          </div>

          {/* 入力フォーム */}
          {(activeTab === 'project' || selectedUser) && (
            <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50/30 shrink-0">
              <div className="relative">
                <input 
                  type="text"
                  placeholder={selectedUser ? `${selectedUser.name} さんにメッセージを送信...` : "全体へメッセージを送信..."}
                  className="w-full bg-white border-2 border-transparent focus:border-[#284db3] rounded-2xl py-4 pl-6 pr-14 outline-none font-bold shadow-sm transition-all"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || (activeTab === 'project' && !selectedEventId)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    !newMessage.trim() || (activeTab === 'project' && !selectedEventId)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#284db3] text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                  }`}
                >
                  <Send size={18}/>
                </button>
              </div>
              {activeTab === 'project' && !selectedEventId && (
                <p className="text-[9px] text-red-400 font-bold mt-2 ml-2">プロジェクトを選択してください</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}