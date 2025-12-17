import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/progress');
    } catch (err) {
      setError('Errorea saioa hastean. Egiaztatu datuak.');
    }
  };

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest();
      navigate('/progress');
    } catch (err) {
      setError('Arazo bat egon da gonbidatu gisa sartzean.');
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2">Ongi Etorri!</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Sartu zure kontuan jolasten jarraitzeko.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Emaila</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="zure@emaila.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Pasahitza</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="mt-2 w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
            Hasi Saioa
          </button>
        </form>
        
        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          <span className="text-slate-400 text-xs uppercase font-bold">edo</span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
        </div>

        <button 
          onClick={handleGuestLogin}
          className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold transition-all border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">person</span>
          Jarraitu Gonbidatu gisa
        </button>
        
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Ez daukazu konturik? <Link to="/register" className="text-primary font-bold hover:underline">Erregistratu hemen</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;