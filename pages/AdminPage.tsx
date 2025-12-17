import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { useToast } from '../context/ToastContext';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKickModal, setShowKickModal] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    if (user?.isAdmin) {
      const allUsers = await dbService.getAllUsers();
      setUsers(allUsers);
      setLoading(false);
    }
  };

  const handleKickUser = async (uid: string) => {
    try {
      await dbService.kickUser(uid);
      addToast('success', 'Erabiltzailea kanporatua izan da.');
      setShowKickModal(null);
      fetchUsers(); // Refresh list
    } catch (e) {
      addToast('error', 'Arazoa egon da erabiltzailea kanporatzean.');
    }
  };

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex-1 p-6 md:p-10 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-red-500">admin_panel_settings</span>
          Administrazio Panela
        </h1>

        {loading ? (
          <p className="text-center">Kargatzen...</p>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase">Erabiltzailea</th>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase">Emaila</th>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase">IP</th>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase text-center">XP</th>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase text-center">Maila</th>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase text-center">Azken Saioa</th>
                    <th className="p-4 text-sm font-bold text-slate-500 uppercase text-right">Ekintzak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="size-10 rounded-full bg-cover bg-center bg-slate-200" style={{ backgroundImage: `url("${u.photoURL}")` }}></div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {u.displayName}
                          {u.isAdmin && <span className="ml-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-black">Admin</span>}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{u.email}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-xs">{u.lastIp || 'Ezezaguna'}</td>
                      <td className="p-4 text-center font-bold text-primary">{u.xp}</td>
                      <td className="p-4 text-center">
                        <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-xs font-bold">{u.level}</span>
                      </td>
                      <td className="p-4 text-center text-sm text-slate-500">
                        {new Date(u.lastLoginDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {!u.isAdmin && (
                          <button
                            onClick={() => setShowKickModal(u.uid)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                            title="Kanporatu"
                          >
                            <span className="material-symbols-outlined">person_remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION POPUP */}
      {showKickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ziur zaude?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Ekintza honek erabiltzailea eta bere datu guztiak ezabatuko ditu. Ezin da desegin.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowKickModal(null)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Ezeztatu
              </button>
              <button
                onClick={() => handleKickUser(showKickModal)}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                Kanporatu
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default AdminPage;