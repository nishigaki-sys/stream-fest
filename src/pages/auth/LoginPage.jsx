import React, { useState } from 'react';
import { Mail, Lock, LogIn, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'; 
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../config/firebase';

export default function LoginPage() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (err) { setError('認証に失敗しました。'); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try { await sendPasswordResetEmail(auth, email); setMessage('メールを送信しました。'); }
    catch (err) { setError('送信に失敗しました。'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] rounded-full bg-pink-100/40 blur-3xl" />
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-gray-100 p-8 sm:p-12 relative z-10">
        
        <div className="text-center mb-12">
          {/* --- 枠を削除し、ロゴ画像のみを配置 --- */}
          <div className="flex justify-center mb-6">
            <img 
              src="/public/logo.png"  // publicフォルダにある場合のパス
              alt="STREAM FEST." 
              className="max-h-24 w-auto object-contain" 
            />
          </div>
          {/* -------------------------------------- */}

          <h1 className="text-3xl font-black tracking-tighter text-blue-900 uppercase">STREAM FEST.</h1>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Project Management Portal</p>
        </div>

        {!isForgotPassword ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                <input required type="email" placeholder="name@company.com" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-bold transition-all" value={email} onChange={e => setEmail(e.target.value)}/>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18}/>
                <input required type="password" placeholder="••••••••" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-bold transition-all" value={password} onChange={e => setPassword(e.target.value)}/>
              </div>
            </div>
            <button type="button" onClick={()=>setIsForgotPassword(true)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest block ml-auto transition-colors">パスワードを忘れた方はこちら</button>
            {error && <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2"><AlertCircle size={16}/>{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white rounded-[1.5rem] py-5 font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all">ログイン <LogIn size={20}/></button>
          </form>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <button onClick={()=>setIsForgotPassword(false)} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 text-xs font-black uppercase mb-8 transition-colors"><ArrowLeft size={16}/> 戻る</button>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Reset Password</h2>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <input required type="email" placeholder="Enter your email" className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-5 outline-none font-bold" value={email} onChange={e => setEmail(e.target.value)}/>
              {message && <div className="p-4 bg-green-50 text-green-600 text-xs font-bold rounded-2xl flex items-center gap-2"><CheckCircle2 size={16}/>{message}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white rounded-2xl py-5 font-black shadow-lg">再設定メールを送信</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}