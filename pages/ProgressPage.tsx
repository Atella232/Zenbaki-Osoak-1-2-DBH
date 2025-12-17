import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Achievement } from '../types';
import { dbService, XP_LIMITS, ACHIEVEMENTS } from '../services/dbService';

const ProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await dbService.getLeaderboard();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, [user?.xp]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Calculate percentages based on XP (New Goal: 9000XP due to Unit 4)
  const courseCompletion = Math.min(100, Math.floor((user.xp / 9000) * 100));

  // Helper to format category names for UI
  const getCategoryName = (key: string) => {
    if (key === 'theory_intro') return 'Teoria: Oinarriak';
    if (key === 'theory_operations') return 'Teoria: Batuketa/Kenketa';
    if (key === 'theory_multiplication') return 'Teoria: Biderketa/Zatiketa';
    if (key === 'theory_powers') return 'Teoria: Berreketak';
    if (key === 'theory_advanced') return 'Teoria: Konbinatuak';

    // Manual mapping for clean UI
    const map: Record<string, string> = {
      // Unit 1
      'ordering_easy': 'Ordena (Erraza)',
      'ordering_medium': 'Ordena (Ertaina)',
      'ordering_hard': 'Ordena (Zaila)',

      // Unit 5
      'combined_easy': 'Konbinatuak (Erraza)',
      'combined_medium': 'Konbinatuak (Ertaina)',
      'combined_hard': 'Konbinatuak (Zaila)',

      // Exam
      'mixed_easy': 'Nahastuta (Erraza)',
      'mixed_medium': 'Nahastuta (Ertaina)',
      'mixed_hard': 'Nahastuta (Zaila)',

      // Unit 2
      'addition_easy': 'Batuketa (Erraza)',
      'addition_medium': 'Batuketa (Ertaina)',
      'addition_hard': 'Batuketa (Zaila)',

      'subtraction_easy': 'Kenketa (Erraza)',
      'subtraction_medium': 'Kenketa (Ertaina)',
      'subtraction_hard': 'Kenketa (Zaila)',

      // Unit 3
      'multiplication_easy': 'Biderketa (Erraza)',
      'multiplication_medium': 'Biderketa (Ertaina)',
      'multiplication_hard': 'Biderketa (Zaila)',

      'division_easy': 'Zatiketa (Erraza)',
      'division_medium': 'Zatiketa (Ertaina)',
      'division_hard': 'Zatiketa (Zaila)',

      // Unit 4
      'powers_easy': 'Berreketak (Erraza)',
      'powers_medium': 'Berreketak (Ertaina)',
      'powers_hard': 'Berreketak (Zaila)',

      'roots_easy': 'Erroketak (Erraza)',
      'roots_medium': 'Erroketak (Ertaina)',
      'roots_hard': 'Erroketak (Zaila)',
    };
    return map[key] || key;
  };

  // Group XP Limits by type for display
  const groupedLimits = Object.entries(XP_LIMITS).reduce((acc, [key, limit]) => {
    let group = 'other';

    if (key.includes('theory')) group = 'Teoria';
    else if (key.includes('ordering')) group = 'Ordena';
    else if (key.includes('combined')) group = 'Konbinatuak';
    else if (key.includes('mixed')) group = 'Nahastuta';
    else if (key.includes('addition') || key.includes('subtraction')) group = 'Batuketa eta Kenketa';
    else if (key.includes('multiplication') || key.includes('division')) group = 'Biderketa eta Zatiketa';
    else if (key.includes('powers') || key.includes('roots')) group = 'Berreketak eta Erroketak';
    else group = 'Oinarrizkoak';

    if (!acc[group]) acc[group] = [];
    acc[group].push({ key, limit, current: user.gameXp[key] || 0 });
    return acc;
  }, {} as Record<string, { key: string, limit: number, current: number }[]>);

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-8">
      <div className="mx-auto max-w-[1100px] flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Kaixo, {user.displayName.split(' ')[0]}!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Hemen duzu zure zenbaki osoen abenturaren laburpena.</p>
          </div>
          <Link to="/games" className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined">play_circle</span>
            <span>Jarraitu jolasten</span>
          </Link>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 items-center text-center shadow-sm">
            <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1">
              <span className="material-symbols-outlined">bolt</span>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">{user.xp} XP</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Puntuazioa</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 items-center text-center shadow-sm">
            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-1">
              <span className="material-symbols-outlined">donut_large</span>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">%{courseCompletion}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Ikastaroa osatuta</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 items-center text-center shadow-sm">
            <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <p className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">{user.unlockedAchievements?.length || 0}/{ACHIEVEMENTS.length}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Lorpenak</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex gap-6 justify-between items-end">
              <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">Ikastaroaren Aurrerapen Orokorra</p>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">%{courseCompletion}</span>
            </div>
            <div className="w-full rounded-full bg-slate-100 dark:bg-slate-700 h-3 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${courseCompletion}%` }}></div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
              {courseCompletion < 30 ? "Hasiera ona! Jarraitu ikasten." : courseCompletion < 70 ? "Oso ondo zoaz! Berreketak menperatzea falta zaizu." : "Ia amaitu duzu! Txapelduna zara."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* ACHIEVEMENTS SECTION */}
            <div className="flex flex-col gap-4">
              <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Dominak eta Lorpenak</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map(ach => {
                  const isUnlocked = user.unlockedAchievements?.includes(ach.id);
                  return (
                    <div key={ach.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${isUnlocked ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60 grayscale'}`}>
                      <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                        <span className="material-symbols-outlined">{ach.icon}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className={`font-bold ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{ach.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{ach.description}</p>
                        {isUnlocked && <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-1">+{ach.xpReward} XP Lortuta</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* GAME XP BREAKDOWN */}
            <div className="flex flex-col gap-4">
              <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Jokoen Xehetasunak</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(groupedLimits).map(([groupName, items]) => (
                  <div key={groupName} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">{groupName}</h3>
                    <div className="flex flex-col gap-4">
                      {items.map(item => (
                        <div key={item.key} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-600 dark:text-slate-300">{getCategoryName(item.key)}</span>
                            <span className={`${item.current >= item.limit ? 'text-green-500 font-bold' : 'text-slate-400'}`}>
                              {item.current} / {item.limit} XP
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${item.current >= item.limit ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (item.current / item.limit) * 100)}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-6">
            {/* Level Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 flex flex-col gap-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Zure Maila</h3>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl font-black text-primary border-4 border-primary/20">
                  {user.level}
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-white font-bold mb-1">Ikaslea (Lvl {user.level})</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hurrengo mailara: {500 - (user.xp % 500)} XP</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(user.xp % 500) / 5}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-5 text-white flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-400">trophy</span>
                  <h3 className="font-bold text-lg">Sailkapena</h3>
                </div>
                <span className="text-xs bg-white/10 px-2 py-1 rounded">Aste hau</span>
              </div>

              <div className="flex flex-col gap-2">
                {leaderboard.map((u, index) => (
                  <div key={u.uid} className={`flex items-center justify-between p-2 rounded-lg ${u.uid === user.uid ? 'bg-primary/20 border border-primary/50' : 'hover:bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold w-4 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-500'}`}>{index + 1}</span>
                      <div className="size-8 rounded-full bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url("${u.photoURL}")` }}></div>
                      <span className={`text-sm font-medium ${u.uid === user.uid ? 'text-white font-bold' : 'text-slate-300'}`}>
                        {u.displayName} {u.uid === user.uid && '(Zu)'}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white">{u.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProgressPage;