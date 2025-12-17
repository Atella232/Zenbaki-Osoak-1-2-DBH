import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { playSound } from '../services/audio';

const AVATARS = [
  'https://ui-avatars.com/api/?name=User&background=136dec&color=fff',
  'https://ui-avatars.com/api/?name=User&background=0d9488&color=fff',
  'https://ui-avatars.com/api/?name=User&background=7c3aed&color=fff',
  'https://ui-avatars.com/api/?name=User&background=db2777&color=fff',
  'https://ui-avatars.com/api/?name=User&background=ea580c&color=fff',
];

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth(); // We'll re-login to refresh context or force update manually
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || AVATARS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) return <p className="text-center p-10">Saioa hasi behar duzu.</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    playSound.click();

    try {
      await dbService.updateProfile(user.uid, {
        displayName,
        photoURL: selectedAvatar
      });
      setMessage('Aldaketak ondo gorde dira!');
      playSound.correct();
      // Reload page to refresh context (simple fix for demo)
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage('Errorea gertatu da.');
      playSound.wrong();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
          Nire Profila
        </h1>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Avatarra Aukeratu</label>
            <div className="flex gap-3 justify-center flex-wrap">
              {AVATARS.map((avatar, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setSelectedAvatar(avatar); playSound.click(); }}
                  className={`size-14 rounded-full border-4 transition-transform hover:scale-110 ${selectedAvatar === avatar ? 'border-primary' : 'border-transparent'}`}
                  style={{ backgroundImage: `url("${avatar}")`, backgroundSize: 'cover' }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Erabiltzaile Izena</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 opacity-60">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Emaila (Ezin da aldatu)</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="mt-4 w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Gordetzen...' : 'Gorde Aldaketak'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default ProfilePage;