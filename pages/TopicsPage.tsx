import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { XP_LIMITS } from '../services/dbService';

const TopicsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isLessonCompleted = (id: string) => user.completedLessons.includes(id);
  const getXp = (key: string) => user.gameXp[key] || 0;

  // --- PROGRESSION LOGIC (Strict) ---

  // UNIT 1: Intro -> Ordering Hard
  const unit1GameUnlocked = isLessonCompleted('theory_intro');

  // UNIT 2: Add/Sub -> Requires Ordering Hard (for theory) + Quiz (for game)
  const unit2TheoryUnlocked = getXp('ordering_hard') >= XP_LIMITS['ordering_hard'];
  const unit1ProgressPercent = Math.min(100, (getXp('ordering_hard') / XP_LIMITS['ordering_hard']) * 100);
  const unit2GameUnlocked = isLessonCompleted('theory_operations');

  // UNIT 3: Mult/Div -> Requires Add/Sub Hard
  const unit2Mastered = getXp('addition_hard') >= XP_LIMITS['addition_hard'] || getXp('subtraction_hard') >= XP_LIMITS['subtraction_hard'];
  const unit3TheoryUnlocked = unit2Mastered;
  // Use addition as proxy for progress bar
  const unit2ProgressPercent = Math.min(100, (getXp('addition_hard') / XP_LIMITS['addition_hard']) * 100);
  const unit3GameUnlocked = isLessonCompleted('theory_multiplication');

  // UNIT 4: Powers/Roots -> Requires Mult/Div Hard
  const unit3Mastered = getXp('multiplication_hard') >= XP_LIMITS['multiplication_hard'] || getXp('division_hard') >= XP_LIMITS['division_hard'];
  const unit4TheoryUnlocked = unit3Mastered;
  const unit3ProgressPercent = Math.min(100, (getXp('multiplication_hard') / XP_LIMITS['multiplication_hard']) * 100);
  const unit4GameUnlocked = isLessonCompleted('theory_powers');

  // UNIT 5: Combined -> Requires Powers/Roots Hard
  const unit4Mastered = getXp('powers_hard') >= XP_LIMITS['powers_hard'] || getXp('roots_hard') >= XP_LIMITS['roots_hard'];
  const unit5TheoryUnlocked = unit4Mastered;
  const unit4ProgressPercent = Math.min(100, (getXp('powers_hard') / XP_LIMITS['powers_hard']) * 100);
  const unit5GameUnlocked = isLessonCompleted('theory_advanced');

  return (
    <main className="flex flex-1 flex-col items-center py-8">
      <div className="layout-content-container flex flex-col w-full max-w-[1200px] px-4 lg:px-8 gap-8">

        {/* Header Section */}
        <div className="@container">
          <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 @[480px]:gap-8 @[864px]:flex-row transition-all hover:shadow-md">
            <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl @[480px]:h-auto @[480px]:min-w-[300px] @[864px]:w-1/2 max-w-[500px]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBRmPvc3EOaJSextMYOxzWlMwMqOi_BzRFGtqC16zLLEQ2RKVskHP3h1Gir_tImbrR38L3G0ZbvwuWjG3r0qPFbGZTfYIJ63BkuopqMsdkYhWKRzUNuSILppKpKIz0ZpbSMgRFxv2N8WXIZMf1YTdA81EZFwKhonr7FTy65o7V3UK_QoowEKdi-Xz_NCKty3f47bOK6XDHrlmtWDlLJmWx_FSyufhUQ9Fixq7p9Akh3NkvFg7UngPQ6MAGfkujoka1gEgtOunw-tQpb")' }}>
            </div>
            <div className="flex flex-col justify-center gap-6 flex-1">
              <div className="flex flex-col gap-3 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 w-fit">
                  <span className="material-symbols-outlined text-primary text-sm">school</span>
                  <span className="text-primary text-xs font-bold uppercase tracking-wide">2. DBH - Matematika</span>
                </div>
                <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] @[480px]:text-4xl">
                  Zenbaki Osoak
                </h1>
                <h2 className="text-slate-500 dark:text-slate-300 text-base font-normal leading-relaxed">
                  Osatu unitate bakoitzeko teoria eta jokoak hurrengo maila desblokeatzeko.
                </h2>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Maila Orokorra: {user?.level || 1}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{user?.xp || 0} XP</span>
                </div>
                <div className="rounded-full h-3 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500" style={{ width: `${(user?.xp || 0) % 500 / 5}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 pt-4">
          <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">Ikasketa Bidea</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Jarraibideak bete hurrengo mailak irekitzeko.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">

          {/* Card 1: Intro (ALWAYS OPEN) */}
          <div className="group relative flex flex-col sm:flex-row items-stretch rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden">
            {isLessonCompleted('theory_intro') && (
              <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
            <div className="w-full sm:w-1/3 min-h-[160px] sm:min-h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuANpFJXXpVuGa0bSpEboWaKePkikvFHog0REbJAGDWWLhjrWoLl2tuIq8odigSNYX6gcjAB842Jen-3jtrXELjGUpzk3hO2gLKN4MRMwgmQVw9m3SI84TkaCR5VVXWe1nxR-ZpmZkK3POp95Jf-FyqwWOAIcMFjq9ragGXO5XMGRAZ7H-fnTYOOMB0hRfVUstzXBU0a8V6XnZY5EYrq1NU56aS_zBAoBb85v-qODAiTlblca3GAi4fPwoJ4S7DYH4Cv-0RU0_tgk2YB")' }}></div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/10 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">1. Unitatea</span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-1">Oinarriak</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Balio absolutua, aurkakoa eta ordenatzea.</p>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <Link to="/theory/intro" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors">
                  Teoria
                </Link>
                {unit1GameUnlocked ? (
                  <Link to="/games?mode=ordering&difficulty=easy" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    Jolastu
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    <span className="material-symbols-outlined text-sm">lock</span> Jokoa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Addition & Subtraction */}
          <div className={`group relative flex flex-col sm:flex-row items-stretch rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${unit2TheoryUnlocked ? 'hover:shadow-xl hover:-translate-y-1 transition-all' : 'opacity-70 grayscale'}`}>
            {isLessonCompleted('theory_operations') && (
              <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
            {!unit2TheoryUnlocked && (
              <div className="absolute inset-0 bg-slate-100/10 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
                  <span className="material-symbols-outlined">lock</span>
                  <span className="text-sm font-bold">Osatu 1. Unitatea (Zaila)</span>
                </div>
              </div>
            )}
            <div className="w-full sm:w-1/3 min-h-[160px] sm:min-h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC62k7gl3J7HZSIfnl6y1kMaKGOJ4nTP40gXUjGxscgY28PX5FH6v6lDKFbzmsFufrUrjv__fohbhSDGIuZinVtKkMqFeGJ-eplqrDryMnifQ-0gK0D7I_Ik44zXDr7EpqEwCGNmIOd2IHsXHUqR8Vu7omJKtUnl2jibF4Np8Cf2JN8MUy2cvfM0Aiws6wFlHeKVes9Pdj7fvWbwlTTeOZJ0r3Wbvev1C_cBVn10wXH39BFFY5uGK_SCF3b5yvCLc6PQyE7Np81Lvnl")' }}></div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded bg-orange-50 dark:bg-orange-900/10 text-xs font-bold text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">2. Unitatea</span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-1">Batuketa eta Kenketa</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Parentesiak kendu, zeinu berdinak eta ezberdinak.</p>
                {!unit2TheoryUnlocked && (
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${unit1ProgressPercent}%` }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                {unit2TheoryUnlocked ? (
                  <Link to="/theory/operations" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors">
                    Teoria
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    Teoria
                  </button>
                )}

                {unit2GameUnlocked ? (
                  <Link to="/games?mode=addition&difficulty=easy" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    Jolastu
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    <span className="material-symbols-outlined text-sm">lock</span> Jokoa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Multiplication & Division */}
          <div className={`group relative flex flex-col sm:flex-row items-stretch rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${unit3TheoryUnlocked ? 'hover:shadow-xl hover:-translate-y-1 transition-all' : 'opacity-70 grayscale'}`}>
            {isLessonCompleted('theory_multiplication') && (
              <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
            {!unit3TheoryUnlocked && (
              <div className="absolute inset-0 bg-slate-100/10 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
                  <span className="material-symbols-outlined">lock</span>
                  <span className="text-sm font-bold">Osatu 2. Unitatea (Zaila)</span>
                </div>
              </div>
            )}
            <div className="w-full sm:w-1/3 min-h-[160px] sm:min-h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAP0VeZTXTkvkfWI-nBluHmRyLy8pWM1OB6hCuXMSuTwoJ1V8BxY4Xs22kgalUbtYG7YoyFSvNpHRt93p0PUGBgp89R0zHXgQ0094c7_NfkJ3MMu8A3QiGkyMl0xHdMPPDIIdfzHx0wpXdmxxoYp5LnZmUeI0Vry1gKa7QRShJKhGzh6zWfyXtuALBaw7yw9Qm9YRnKPbnVBdf1Hq1BZN_DxPDVGEDCrikCrozUEu88VIOD9aDBliLeppf-wGv3DmuMCbB_BX5nsL54")' }}>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded bg-purple-50 dark:bg-purple-900/10 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">3. Unitatea</span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-1">Biderketa eta Zatiketa</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Zeinuen Legea: + · + = + ...</p>
                {!unit3TheoryUnlocked && (
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${unit2ProgressPercent}%` }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                {unit3TheoryUnlocked ? (
                  <Link to="/theory/multiplication" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors">
                    Teoria
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    Teoria
                  </button>
                )}
                {unit3GameUnlocked ? (
                  <Link to="/games?mode=multiplication&difficulty=easy" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    Jolastu
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    <span className="material-symbols-outlined text-sm">lock</span> Jokoa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Powers & Roots (NEW) */}
          <div className={`group relative flex flex-col sm:flex-row items-stretch rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${unit4TheoryUnlocked ? 'hover:shadow-xl hover:-translate-y-1 transition-all' : 'opacity-70 grayscale'}`}>
            {isLessonCompleted('theory_powers') && (
              <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
            {!unit4TheoryUnlocked && (
              <div className="absolute inset-0 bg-slate-100/10 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
                  <span className="material-symbols-outlined">lock</span>
                  <span className="text-sm font-bold">Osatu 3. Unitatea (Zaila)</span>
                </div>
              </div>
            )}
            <div className="w-full sm:w-1/3 min-h-[160px] sm:min-h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAz6Y8-19_3-7y88X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888X35-8y57777y18888")' }}>
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-6xl opacity-50">electric_bolt</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-900/10 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">4. Unitatea</span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-1">Berreketak</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Potentziak, erro karratuak eta ikurren arauak.</p>
                {!unit4TheoryUnlocked && (
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${unit3ProgressPercent}%` }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                {unit4TheoryUnlocked ? (
                  <Link to="/theory/powers" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors">
                    Teoria
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    Teoria
                  </button>
                )}
                {unit4GameUnlocked ? (
                  <Link to="/games?mode=powers&difficulty=easy" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-primary hover:bg-blue-700 text-white text-sm font-bold transition-colors">
                    Jolastu
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    <span className="material-symbols-outlined text-sm">lock</span> Jokoa
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Combined */}
          <div className={`group relative flex flex-col sm:flex-row items-stretch rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${unit5TheoryUnlocked ? 'hover:shadow-xl hover:-translate-y-1 transition-all' : 'opacity-70 grayscale'}`}>
            {isLessonCompleted('theory_advanced') && (
              <div className="absolute top-3 right-3 z-10 bg-green-500 text-white rounded-full p-1 shadow-md">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
            {!unit5TheoryUnlocked && (
              <div className="absolute inset-0 bg-slate-100/10 z-20 flex items-center justify-center backdrop-blur-[1px]">
                <div className="bg-slate-900/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-xl">
                  <span className="material-symbols-outlined">lock</span>
                  <span className="text-sm font-bold">Osatu 4. Unitatea (Zaila)</span>
                </div>
              </div>
            )}
            <div className="w-full sm:w-1/3 min-h-[160px] sm:min-h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1cgGZwA72EHOK1-O-BIlo3M3MkeaYS-J0OdZg29jMmVZb-y7I--J4ezmq12kiNHzi60eNCmuf1ANads-dS8fRqTZsTP9jDRiOBnght9FJZQz8ci0BN-8cvfioR3Ii04sTokdxopMBGM9cG0zMH0La_fLlU_-s-R6TlAtDhz3npfdMd8Uf3z0qGXO5MUzSXPdEjO2BxvcP4VQrf17fEx0LEK8qphbXKZ-FJAx_1MF5xrlDgu6LmGFWlLTNBgslTm2N3GNFwdloP8TB")' }}>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded bg-teal-50 dark:bg-teal-900/10 text-xs font-bold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">5. Unitatea</span>
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight mb-1">Eragiketa Konbinatuak</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Hierarkia (PEMDAS) eta parentesi konplexuak.</p>
                {!unit5TheoryUnlocked && (
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${unit4ProgressPercent}%` }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                {unit5TheoryUnlocked ? (
                  <Link to="/theory/advanced" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors">
                    Teoria
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    Teoria
                  </button>
                )}
                {unit5GameUnlocked ? (
                  <Link to="/games?mode=combined&difficulty=easy" className="flex-1 flex items-center justify-center rounded-lg h-9 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-colors shadow-teal-500/20 shadow-lg">
                    Erronka Hasi
                  </Link>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-1 rounded-lg h-9 bg-slate-200 dark:bg-slate-700/50 text-slate-400 text-sm font-bold cursor-not-allowed">
                    <span className="material-symbols-outlined text-sm">lock</span> Jokoa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TopicsPage;