import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { XP_LIMITS } from '../services/dbService';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const isLessonCompleted = (id: string) => user ? user.completedLessons.includes(id) : false;
  const getXp = (key: string) => user ? (user.gameXp[key] || 0) : 0;

  // PROGRESSION CHECKS (Strict: Must complete Theory Quiz to play)
  const unit1GameUnlocked = isLessonCompleted('theory_intro');

  // Unit 2 Game (Add/Sub) needs Unit 2 Theory Quiz
  // (Theory unlocks via Unit 1 Hard, but GAME unlocks via Theory Quiz)
  const unit2GameUnlocked = isLessonCompleted('theory_operations');

  // Unit 3 needs Theory Quiz 3
  const unit3GameUnlocked = isLessonCompleted('theory_multiplication');

  // Unit 4 (Powers) needs Theory Quiz 4
  const unit4GameUnlocked = isLessonCompleted('theory_powers');

  // Unit 5 (Combined) Needs Theory Quiz 5
  const unit5GameUnlocked = isLessonCompleted('theory_advanced');

  const examUnlocked = user ? user.level >= 5 : false;

  return (
    <main className="flex-1 flex flex-col items-center w-full">
      <div className="w-full max-w-[1200px] px-4 md:px-10 flex flex-col gap-12 pb-20">
        {/* Hero Section */}
        <section className="@container mt-8 md:mt-12">
          <div className="flex flex-col-reverse gap-8 md:flex-row items-center">
            <div className="flex flex-col gap-6 md:w-1/2 items-start text-left">
              <div className="flex flex-col gap-4">
                <span className="text-primary font-bold tracking-wider uppercase text-xs md:text-sm bg-primary/10 w-fit px-3 py-1 rounded-full">DBH 2. Maila - Matematika</span>
                <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                  Zenbaki Osoen Abentura Hasi!
                </h1>
                <h2 className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-normal leading-relaxed max-w-[500px]">
                  Ikasi, jolastu eta irabazi puntuak. Deskubritu zenbaki negatiboen mundua erronka dibertigarriekin eta bihurtu matematikako txapeldun.
                </h2>
              </div>
              <div className="flex gap-4 w-full sm:w-auto flex-col sm:flex-row">
                <Link to="/topics" className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-blue-600 text-white text-base font-bold shadow-lg shadow-blue-500/40 transition-all hover:translate-y-[-2px]">
                  <span className="truncate">Hasi Abentura</span>
                  <span className="material-symbols-outlined ml-2 text-[20px]">rocket_launch</span>
                </Link>
                <Link to="/theory/intro" className="flex items-center justify-center rounded-lg h-12 px-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all">
                  <span>Lehen Ikasgaia</span>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 aspect-video md:aspect-square lg:aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden relative group" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAqmvAuI9_ytmxwMBXV9ubA8KS2DSe3XEPM5aROqmNBTmliY-H8QjZ3fS9t4mOZHGGRcug1VZrzBfppqzDBH4IybMsE5Mc0iP496e08PNQv9QKKaAJAjRPswCKVzbcKfaC9LvzL-fcWuOLLNCoVv4RbqHYb3O3ilFQC9Rxovw_kI1eaJyTqlaTrX1gS1Ky6_iUUOSf9Iy5sfXDZfQv_nRo1_7FWIEEKBpXtUv0t-gblYLtakb2zxVN0rLP91s1F7_yOkBlAetImQVmY")' }}>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
            </div>
          </div>
        </section>
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] text-slate-100 dark:text-slate-800 rotate-12 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[100px]">groups</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider relative z-10">Jokalari Aktiboak</p>
            <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight relative z-10">150+</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] text-slate-100 dark:text-slate-800 rotate-12 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[100px]">check_circle</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider relative z-10">Ebatzitako Ariketak</p>
            <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight relative z-10">3,500</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="absolute right-[-10px] top-[-10px] text-slate-100 dark:text-slate-800 rotate-12 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[100px]">military_tech</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider relative z-10">Maila Maximoa</p>
            <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight relative z-10 text-primary">Lvl 10</p>
          </div>
        </section>

        {/* Learning Path / Modules Section */}
        <section className="flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">Aukeratu Zure Bidea</h2>
            <Link className="text-primary hover:text-blue-600 text-sm font-bold flex items-center gap-1" to="/topics">
              Ikusi dena <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1: Always open */}
            <Link className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg dark:hover:border-primary/50" to="/topics">
              <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1cgGZwA72EHOK1-O-BIlo3M3MkeaYS-J0OdZg29jMmVZb-y7I--J4ezmq12kiNHzi60eNCmuf1ANads-dS8fRqTZsTP9jDRiOBnght9FJZQz8ci0BN-8cvfioR3Ii04sTokdxopMBGM9cG0zMH0La_fLlU_-s-R6TlAtDhz3npfdMd8Uf3z0qGXO5MUzSXPdEjO2BxvcP4VQrf17fEx0LEK8qphbXKZ-FJAx_1MF5xrlDgu6LmGFWlLTNBgslTm2N3GNFwdloP8TB")' }}></div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Ikasgaia</span>
                </div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Teoria Orokorra</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">Zenbaki osoen definizioa, adibideak eta oinarrizko kontzeptuak.</p>
              </div>
            </Link>

            {/* Card 2: Requires Unit 1 Quiz */}
            {unit1GameUnlocked ? (
              <Link className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg dark:hover:border-primary/50" to="/games?mode=ordering&difficulty=easy">
                <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRuJL8XcxOxLUfp4STBBcZtrGVgXIJSmpVHm3LdlzeuZiXJ0li916s3sLNCUPq7NEJpuFVQaThKg72Dp1A5GhOZNUzZ9241T3e26Zu2dc637v7CVSkGTDI8qS95bWJN_LJLEWXWlAy0Szzv93YqJ5rCcctQuoi7_Dp1qC1xTTOeObXqluXX30E1XY6QnCF8rvxQ3rJ6Y7fOvvTO0TS_0oWxPS7fIgPXIobpotiFPpX40Y7q6_iwDJcwSns-J9f7DtgQRJ_JLHIHsnt")' }}></div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Praktika</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold group-hover:text-primary transition-colors">Ordena</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">Praktikatu zenbaki positibo eta negatiboen ordena.</p>
                </div>
              </Link>
            ) : (
              <div className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark p-5 opacity-60 grayscale cursor-not-allowed">
                <div className="absolute inset-0 flex items-center justify-center z-10"><span className="material-symbols-outlined text-4xl text-slate-500">lock</span></div>
                <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRuJL8XcxOxLUfp4STBBcZtrGVgXIJSmpVHm3LdlzeuZiXJ0li916s3sLNCUPq7NEJpuFVQaThKg72Dp1A5GhOZNUzZ9241T3e26Zu2dc637v7CVSkGTDI8qS95bWJN_LJLEWXWlAy0Szzv93YqJ5rCcctQuoi7_Dp1qC1xTTOeObXqluXX30E1XY6QnCF8rvxQ3rJ6Y7fOvvTO0TS_0oWxPS7fIgPXIobpotiFPpX40Y7q6_iwDJcwSns-J9f7DtgQRJ_JLHIHsnt")' }}></div>
                <div className="flex flex-col flex-1">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">Ordena</h3>
                  <p className="text-xs font-bold text-red-500">Osatu 1. Test-a</p>
                </div>
              </div>
            )}

            {/* Card 3: Requires Unit 5 Quiz */}
            {unit5GameUnlocked ? (
              <Link className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark p-5 transition-all hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-lg dark:hover:border-purple-500/50" to="/games?mode=combined&difficulty=easy">
                <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIZmeQp51n44ag26kn_j3Wxmg9Xby9wnQt2DeijnjaiVHWrO9u__kplt6ihLmwyYLdILX77r_sDZn0AcYdpAhzrILrPSl4X_FVKCicB27DwY8sewtwXSYebz096oEQl2K9P28rnIebKzitiDiExWiFJ20iLrn1s4WRlKZ8vmGaUMoPwpZ-jshoBWQwnYlCEQc2daYVC1fJQOBqXM-dTO4BVYG9VyvtFK9HGE5GRYEIdaDUEHTFdwEKW1xQc6UWqeLP6zXZV9dWcSEG")' }}></div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Jokoa</span>
                  </div>
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold group-hover:text-purple-600 transition-colors">Konbinatuak</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">PEMDAS hierarkia eta parentesiak.</p>
                </div>
              </Link>
            ) : (
              <div className="group relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark p-5 opacity-60 grayscale cursor-not-allowed">
                <div className="absolute inset-0 flex items-center justify-center z-10"><span className="material-symbols-outlined text-4xl text-slate-500">lock</span></div>
                <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIZmeQp51n44ag26kn_j3Wxmg9Xby9wnQt2DeijnjaiVHWrO9u__kplt6ihLmwyYLdILX77r_sDZn0AcYdpAhzrILrPSl4X_FVKCicB27DwY8sewtwXSYebz096oEQl2K9P28rnIebKzitiDiExWiFJ20iLrn1s4WRlKZ8vmGaUMoPwpZ-jshoBWQwnYlCEQc2daYVC1fJQOBqXM-dTO4BVYG9VyvtFK9HGE5GRYEIdaDUEHTFdwEKW1xQc6UWqeLP6zXZV9dWcSEG")' }}></div>
                <div className="flex flex-col flex-1">
                  <h3 className="text-slate-900 dark:text-white text-lg font-bold">Konbinatuak</h3>
                  <p className="text-xs font-bold text-red-500">Osatu 5. Test-a</p>
                </div>
              </div>
            )}

            {/* Card 4: Exam (Level 5) */}
            <div className={`group relative flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark p-5 transition-all ${examUnlocked ? 'hover:-translate-y-1 hover:border-red-500/50 hover:shadow-lg' : 'opacity-75 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer'}`}>
              {!examUnlocked && (
                <div className="absolute inset-0 bg-slate-900/5 z-10 flex items-center justify-center rounded-xl group-hover:opacity-0 transition-opacity">
                  <span className="material-symbols-outlined text-4xl text-slate-600 dark:text-slate-400">lock</span>
                </div>
              )}
              <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCWrhtwa-o7p-baLbvePVX6xikASyU7RfyKlP5fGYWxrQCSbu4DKl5uIqOxm47P3glz9vfsCXoV3cBXqLBN22Vne4fHNUFL-CJ1t-4uP5ZGJEzgiF487zXaeI6yLeJwUcFCIO1xOCCBtKrOku7p7I1tF6k_uwVD63ZCiIGkNZP7Ho7-W4Anc65VmyKjkUlu8WChMZ7Q89vfGRyHFOPvgGK8hyykZWEjnAKhx9OAug6XuK5vEiDmFqanU3ao24NM7SJXNbmZDr13lGom")' }}></div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Azterketa</span>
                </div>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold group-hover:text-red-600 transition-colors">Azken Erronka</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2">Erakutsi dakizun guztia maila hau gainditzeko.</p>
              </div>
              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Desblokeatu Lvl 5ean</span>
                {examUnlocked ? (
                  <Link to="/games?mode=mixed&difficulty=hard" className="text-primary font-bold text-xs">JOLASTU</Link>
                ) : (
                  <span className="material-symbols-outlined text-slate-400">lock</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;