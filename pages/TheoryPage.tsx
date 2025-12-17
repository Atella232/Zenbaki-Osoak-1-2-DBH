import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { playSound } from '../services/audio';
import { XP_LIMITS } from '../services/dbService';

// --- DATA STRUCTURES ---

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
}

interface TheoryContent {
  title: string;
  content: React.ReactNode;
  nextLink: string;
  nextLabel: string;
  quiz: QuizQuestion[];
}

const contentData: Record<string, TheoryContent> = {
  'intro': {
    title: '1. Unitatea: Oinarriak',
    nextLink: '/games?mode=ordering&difficulty=easy',
    nextLabel: 'Praktikatu: Ordena',
    content: (
      <div className="flex flex-col gap-8 text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border-l-4 border-primary mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Zer dira Zenbaki Osoak (Z)?</h3>
            <p>Zenbaki osoen multzoa (Z) hiru motatako zenbakiek osatzen dute:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Positiboak:</strong> (+1, +2...) → "Daukadana".</li>
              <li><strong>Zero:</strong> (0) → Muga.</li>
              <li><strong>Negatiboak:</strong> (-1, -2...) → "Zor dudana" edo "Zero azpitik".</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface-light dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">linear_scale</span>
            Zuzen Erreala eta Ordena
          </h3>
          <p className="mb-6 text-sm">Zenbakiak lerro batean ordenatzen dira. Eskuinerantz handitzen dira.</p>

          <div className="w-full h-24 relative flex items-center justify-center select-none overflow-hidden my-8">
            <div className="absolute w-[95%] h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            <div className="flex justify-between w-[90%] relative z-10">
              {[-3, -2, -1, 0, 1, 2, 3].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2 group cursor-pointer hover:-translate-y-1 transition-transform">
                  <div className={`w-0.5 h-4 ${num === 0 ? 'h-6 bg-slate-900 dark:bg-white' : 'bg-slate-400'}`}></div>
                  <span className={`text-sm md:text-base font-bold ${num === 0 ? 'text-slate-900 dark:text-white' : num < 0 ? 'text-red-500' : 'text-blue-500'}`}>{num > 0 ? `+${num}` : num}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">Kontuz Negatiboekin!</h4>
            <p className="text-sm">Negatiboetan, zenbakia zenbat eta "handiagoa" iruditu (0tik urrunago), orduan eta <strong>txikiagoa</strong> da balioa.</p>
            <div className="mt-2 font-mono bg-white dark:bg-slate-800 p-2 rounded text-center border border-red-200 dark:border-red-900">
              -100 &lt; -1
            </div>
          </div>
        </section>
      </div>
    ),
    quiz: [
      {
        question: "Zer motatako zenbakiek osatzen dute Z multzoa?",
        options: ["Bakarrik positiboek", "Positiboek, negatiboek eta zeroak", "Zatikiak eta hamartarrak"],
        correctIdx: 1
      },
      {
        question: "Zuzen errealean, zenbaki bat zenbat eta eskuinerago egon...",
        options: ["Orduan eta txikiagoa da", "Orduan eta handiagoa da", "Berdin dio"],
        correctIdx: 1
      },
      {
        question: "Zein da handiagoa: -2 ala -10?",
        options: ["-2 handiagoa da", "-10 handiagoa da", "Berdinak dira"],
        correctIdx: 0
      }
    ]
  },
  'operations': {
    title: '2. Unitatea: Batuketa eta Kenketa',
    nextLink: '/games?mode=addition&difficulty=easy',
    nextLabel: 'Praktikatu: Batuketak',
    content: (
      <div className="flex flex-col gap-8 text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-600">layers_clear</span>
            1. Pausoa: Parentesiak Kendu
          </h3>
          <p className="mb-4">Zenbaki baten aurrean zeinu bat badago, nola geratzen da?</p>
          <div className="grid grid-cols-2 gap-4 text-center font-mono font-bold">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-slate-400">+(+a) edo -(-a)</span> <br /> <span className="text-green-600 text-xl">→ +a (Berdinak)</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-slate-400">+(-a) edo -(+a)</span> <br /> <span className="text-red-600 text-xl">→ -a (Ezberdinak)</span>
            </div>
          </div>
        </section>

        <section className="bg-surface-light dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calculate</span>
            2. Pausoa: Eragiketa Egin
          </h3>
          <p className="mb-4">Orain ez daukagu parentesirik. Nola operatu?</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-5 rounded-xl">
              <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Zeinu Berdina</h4>
              <p className="text-sm mb-2">Zenbakiak <strong>BATU</strong> egiten dira eta zeinua mantendu.</p>
              <ul className="font-mono text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                <li>+5 +3 = +8</li>
                <li>-5 -3 = -8</li>
              </ul>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-5 rounded-xl">
              <h4 className="font-bold text-red-800 dark:text-red-300 mb-2">Zeinu Ezberdina</h4>
              <p className="text-sm mb-2">Zenbakiak <strong>KENDU</strong> egiten dira eta balio absolutu handienaren zeinua jarri.</p>
              <ul className="font-mono text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                <li>+5 -3 = +2 (5 handiago)</li>
                <li>-5 +3 = -2 (5 handiago)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    ),
    quiz: [
      {
        question: "Zer bihurtzen da '-(+5)' espresioa?",
        options: ["+5", "-5", "5 (zeinu gabe)"],
        correctIdx: 1
      },
      {
        question: "Zeinu berdineko bi zenbaki operatzeko...",
        options: ["Batu eta zeinua mantendu", "Kendu eta handienaren zeinua jarri", "Biderkatu"],
        correctIdx: 0
      },
      {
        question: "Zenbat da -5 + 2?",
        options: ["-7", "+3", "-3"],
        correctIdx: 2
      }
    ]
  },
  'multiplication': {
    title: '3. Unitatea: Biderketa eta Zatiketa',
    nextLink: '/games?mode=multiplication&difficulty=easy',
    nextLabel: 'Praktikatu: Biderketak',
    content: (
      <div className="flex flex-col gap-8 text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">close</span>
            Zeinuen Legea
          </h3>
          <p className="mb-4">Biderketetan eta zatiketetan arau hau betetzen da <strong>BETI</strong>:</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-green-600 mb-1">+ · +</span>
              <span className="text-2xl font-black text-green-700">= +</span>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-red-600 mb-1">+ · -</span>
              <span className="text-2xl font-black text-red-700">= -</span>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-red-600 mb-1">- · +</span>
              <span className="text-2xl font-black text-red-700">= -</span>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-green-600 mb-1">- · -</span>
              <span className="text-2xl font-black text-green-700">= +</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h4 className="font-bold mb-2">Aholkua:</h4>
            <p className="text-sm">Lagunaren araua erabil dezakezu:</p>
            <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
              <li>Nire lagunaren (+) laguna (+) = Nire laguna (+)</li>
              <li>Nire etsaien (-) etsaia (-) = Nire laguna (+)</li>
            </ul>
          </div>
        </section>
      </div>
    ),
    quiz: [
      {
        question: "Zer zeinu dauka 'minus bider minus' eragiketak?",
        options: ["Positiboa (+)", "Negatiboa (-)", "Zero"],
        correctIdx: 0
      },
      {
        question: "Zer zeinu dauka 'positibo zati negatibo' eragiketak?",
        options: ["Positiboa (+)", "Negatiboa (-)", "Depende zenbakiaz"],
        correctIdx: 1
      },
      {
        question: "Zenbat da (-2) · (-3)?",
        options: ["-6", "+5", "+6"],
        correctIdx: 2
      }
    ]
  },
  'powers': {
    title: '4. Unitatea: Berreketak eta Erroketak',
    nextLink: '/games?mode=powers&difficulty=easy',
    nextLabel: 'Praktikatu: Berreketak',
    content: (
      <div className="flex flex-col gap-8 text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Properties Section */}
        <section className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">functions</span>
            Berreketen Propietateak
          </h3>
          <p className="mb-6 text-sm">Hiru arau nagusi hauek buruz jakin behar dituzu eragiketak egiteko:</p>

          <div className="flex flex-col gap-4">
            {/* Product */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
              <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-lg">·</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Biderketa (Oinarri berdina)</h4>
                <p className="text-xs text-slate-500 mb-1">Berretzaileak <strong>BATU</strong> egiten dira.</p>
                <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-sm font-mono text-indigo-600">a<sup>n</sup> · a<sup>m</sup> = a<sup>n+m</sup></code>
              </div>
            </div>

            {/* Quotient */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-red-500 shadow-sm">
              <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 font-bold text-lg">:</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Zatiketa (Oinarri berdina)</h4>
                <p className="text-xs text-slate-500 mb-1">Berretzaileak <strong>KENDU</strong> egiten dira.</p>
                <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-sm font-mono text-indigo-600">a<sup>n</sup> : a<sup>m</sup> = a<sup>n-m</sup></code>
              </div>
            </div>

            {/* Power of Power */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm">
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg">()</div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Berreketaren Berreketa</h4>
                <p className="text-xs text-slate-500 mb-1">Berretzaileak <strong>BIDERKATU</strong> egiten dira.</p>
                <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-sm font-mono text-indigo-600">(a<sup>n</sup>)<sup>m</sup> = a<sup>n·m</sup></code>
              </div>
            </div>
          </div>
        </section>

        {/* Sign Rule Section */}
        <section className="bg-surface-light dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">exposure</span>
            Zeinuen Araua (Oinarri Negatiboa)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/20">
              <p className="font-bold text-sm mb-1">Berretzaile BIKOITIA (2, 4...)</p>
              <p className="text-sm">Emaitza <span className="text-green-600 font-bold">POSITIBOA (+)</span>.</p>
              <p className="font-mono text-xs mt-1 text-slate-500">(-3)<sup>2</sup> = +9</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-black/20">
              <p className="font-bold text-sm mb-1">Berretzaile BAKOITIA (3, 5...)</p>
              <p className="text-sm">Oinarriaren zeinua mantendu.</p>
              <p className="font-mono text-xs mt-1 text-slate-500">(-2)<sup>3</sup> = -8</p>
            </div>
          </div>
        </section>
      </div>
    ),
    quiz: [
      {
        question: "Zer egiten da berretzaileekin oinarri berdineko biderketan?",
        options: ["Batu", "Biderkatu", "Kendu"],
        correctIdx: 0
      },
      {
        question: "Zein da (-2) ber 2 eragiketaren zeinua?",
        options: ["Negatiboa (bakoitia delako)", "Positiboa (bikoitia delako)", "Zero"],
        correctIdx: 1
      },
      {
        question: "Nola sinplifikatzen da (a^2)^3?",
        options: ["a^5", "a^6", "a^8"],
        correctIdx: 1
      }
    ]
  },
  'advanced': {
    title: '5. Unitatea: Konbinatuak (PEMDAS)',
    nextLink: '/games?mode=combined&difficulty=easy',
    nextLabel: 'Praktikatu: Konbinatuak',
    content: (
      <div className="flex flex-col gap-8 text-slate-700 dark:text-slate-300 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-200 dark:border-orange-800">
          <h3 className="text-xl font-black text-orange-700 dark:text-orange-300 mb-2">Eragiketen Hierarkia</h3>
          <p>
            Dena nahastuta dagoenean, ordena hau jarraitu behar da derrigorrez:
          </p>
        </div>
        {/* Pyramid */}
        <section className="flex flex-col items-center w-full max-w-lg mx-auto relative">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-slate-200 dark:bg-slate-700 -z-10"></div>

          {/* Step 1 */}
          <div className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-8 border-purple-500 mb-4 transform hover:scale-105 transition-transform z-10 relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-purple-500 text-white size-8 rounded-full flex items-center justify-center font-bold shadow-lg">1</div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-white">Parentesiak ( ) [ ]</h4>
            </div>
          </div>
          {/* Step 2 - Powers & Roots */}
          <div className="w-[95%] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-8 border-indigo-500 mb-4 transform hover:scale-105 transition-transform z-10 relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-indigo-500 text-white size-8 rounded-full flex items-center justify-center font-bold shadow-lg">2</div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-white">Berreketak eta Erroak</h4>
            </div>
          </div>
          {/* Step 3 */}
          <div className="w-[90%] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-8 border-blue-500 mb-4 transform hover:scale-105 transition-transform z-10 relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-blue-500 text-white size-8 rounded-full flex items-center justify-center font-bold shadow-lg">3</div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-white">Biderketa eta Zatiketa</h4>
            </div>
          </div>
          {/* Step 4 */}
          <div className="w-[80%] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md border-l-8 border-green-500 mb-4 transform hover:scale-105 transition-transform z-10 relative">
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-green-500 text-white size-8 rounded-full flex items-center justify-center font-bold shadow-lg">4</div>
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-white">Batuketa eta Kenketa</h4>
            </div>
          </div>
        </section>
      </div>
    ),
    quiz: [
      {
        question: "Zer ebatzi behar da lehenengo?",
        options: ["Biderketak", "Parentesiak", "Berreketak"],
        correctIdx: 1
      },
      {
        question: "Parentesien ondoren, zer dator?",
        options: ["Batuketak", "Biderketak", "Berreketak eta Erroak"],
        correctIdx: 2
      },
      {
        question: "Zenbat da 2 + 3 · 4?",
        options: ["20", "14", "10"],
        correctIdx: 1
      }
    ]
  }
};

const TheoryPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { user, addXp } = useAuth();
  const { addToast } = useToast();

  const currentKey = topicId || 'intro';
  const theoryKey = `theory_${currentKey}`;
  const data = contentData[currentKey] || contentData['intro'];

  // State for Quiz
  const [quizAnswers, setQuizAnswers] = useState<number[]>(new Array(3).fill(-1));
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // -- LOCK LOGIC START (Strict) --
  const getXp = (key: string) => user ? (user.gameXp[key] || 0) : 0;

  const isUnit2Locked = getXp('ordering_hard') < XP_LIMITS['ordering_hard'];
  const unit2Mastered = getXp('addition_hard') >= XP_LIMITS['addition_hard'] || getXp('subtraction_hard') >= XP_LIMITS['subtraction_hard'];
  const isUnit3Locked = !unit2Mastered;
  const unit3Mastered = getXp('multiplication_hard') >= XP_LIMITS['multiplication_hard'] || getXp('division_hard') >= XP_LIMITS['division_hard'];
  const isUnit4Locked = !unit3Mastered;
  const unit4Mastered = getXp('powers_hard') >= XP_LIMITS['powers_hard'] || getXp('roots_hard') >= XP_LIMITS['roots_hard'];
  const isUnit5Locked = !unit4Mastered;

  if (topicId === 'operations' && isUnit2Locked) return <Navigate to="/topics" replace />;
  if (topicId === 'multiplication' && isUnit3Locked) return <Navigate to="/topics" replace />;
  if (topicId === 'powers' && isUnit4Locked) return <Navigate to="/topics" replace />;
  if (topicId === 'advanced' && isUnit5Locked) return <Navigate to="/topics" replace />;
  // -- LOCK LOGIC END --

  // Check if already completed
  useEffect(() => {
    if (user && user.completedLessons.includes(theoryKey)) {
      setQuizCompleted(true);
      // Pre-fill answers correctly to show it's done
      setQuizAnswers(data.quiz.map(q => q.correctIdx));
      setQuizSubmitted(true);
    } else {
      // Reset state when changing topics if not completed
      setQuizAnswers(new Array(3).fill(-1));
      setQuizSubmitted(false);
      setQuizCompleted(false);
    }
  }, [theoryKey, user, data.quiz]);

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    if (quizCompleted) return; // Disable changing if already done
    const newAnswers = [...quizAnswers];
    newAnswers[qIdx] = oIdx;
    setQuizAnswers(newAnswers);
    setQuizSubmitted(false); // Reset submit state on change to allow retry
  };

  const handleQuizSubmit = async () => {
    if (quizAnswers.some(a => a === -1)) {
      addToast('info', 'Erantzun galdera guztiak mesedez.');
      return;
    }

    setQuizSubmitted(true);

    const allCorrect = quizAnswers.every((ans, idx) => ans === data.quiz[idx].correctIdx);

    if (allCorrect) {
      playSound.win();
      setQuizCompleted(true);
      // Award XP
      if (user && !user.completedLessons.includes(theoryKey)) {
        const added = await addXp(50, theoryKey);
        if (added > 0) {
          addToast('xp', '+50 XP Teoria ikasteagatik!');
        } else {
          addToast('success', 'Teoria osatuta! Orain jolastu dezakezu.');
        }
      }
    } else {
      playSound.wrong();
      addToast('error', 'Erantzun okerrak daude. Berrikusi teoria eta saiatu berriro.');
    }
  };

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-10 flex justify-center">
      <div className="max-w-[900px] w-full flex flex-col gap-8">
        <Link to="/topics" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Atzera
        </Link>

        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-3xl">menu_book</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {topicId === 'intro' ? '1. Unitatea' : topicId === 'operations' ? '2. Unitatea' : topicId === 'multiplication' ? '3. Unitatea' : topicId === 'powers' ? '4. Unitatea' : '5. Unitatea'}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {data.title}
              </h1>
            </div>
          </div>

          {data.content}

          {/* QUIZ SECTION */}
          <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-slate-700">
            <div className="mb-6">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">quiz</span>
                Egiaztatu zure ezagutza
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Erantzun galdera hauek zuzen jokoa eta XP puntuak desblokeatzeko.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {data.quiz.map((q, qIdx) => {
                const isCorrect = quizSubmitted && quizAnswers[qIdx] === q.correctIdx;
                const isWrong = quizSubmitted && quizAnswers[qIdx] !== q.correctIdx;

                return (
                  <div key={qIdx} className={`p-5 rounded-xl border-2 transition-colors ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : isWrong ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'}`}>
                    <p className="font-bold text-slate-900 dark:text-white mb-3">{qIdx + 1}. {q.question}</p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oIdx) => (
                        <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white dark:hover:bg-slate-800 ${quizAnswers[qIdx] === oIdx ? 'bg-white dark:bg-slate-800 shadow-sm ring-2 ring-primary' : ''}`}>
                          <input
                            type="radio"
                            name={`q-${qIdx}`}
                            className="size-4 text-primary focus:ring-primary"
                            checked={quizAnswers[qIdx] === oIdx}
                            onChange={() => handleOptionSelect(qIdx, oIdx)}
                            disabled={quizCompleted}
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {isWrong && <p className="text-xs font-bold text-red-500 mt-2">Erantzun okerra. Saiatu berriro.</p>}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              {!quizCompleted ? (
                <button
                  onClick={handleQuizSubmit}
                  className="w-full md:w-auto px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                >
                  Egiaztatu Erantzunak
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                  <span className="material-symbols-outlined">check_circle</span>
                  Teoria menperatuta!
                </div>
              )}

              <Link
                to={data.nextLink}
                onClick={(e) => !quizCompleted && e.preventDefault()}
                className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold shadow-lg transition-all 
                        ${quizCompleted
                    ? 'bg-primary hover:bg-blue-600 text-white hover:-translate-y-1 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-70'}`}
              >
                <span>{data.nextLabel}</span>
                <span className="material-symbols-outlined">{quizCompleted ? 'sports_esports' : 'lock'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TheoryPage;