import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { GameOption, Question, Difficulty, GameMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { playSound } from '../services/audio';
import { Confetti } from '../components/Confetti';
import { XP_LIMITS } from '../services/dbService';

// Helper component to render math expressions with HTML superscripts
const MathExpression: React.FC<{ text: string }> = ({ text }) => {
  // Regex looks for patterns like: number^number or )^number
  // We split by standard characters to identify parts that need superscripting

  if (!text.includes('^') && !text.includes('√')) {
    // Standard text rendering
    return (
      <div className="flex items-center justify-center flex-wrap gap-1">
        {text.split(' ').map((char, i) => (
          <span key={i} className={char === '?' ? 'text-slate-400 animate-pulse' : (['+', '-', '×', '÷', '(', ')', ':', '·'].includes(char) ? 'text-slate-400 mx-1' : 'text-primary')}>{char}</span>
        ))}
      </div>
    );
  }

  // Handle Powers: e.g., "(9^5)^2 = ?" or "9^5 · 9^2 = ?"
  const parts = text.split(' ');

  return (
    <div className="flex items-center justify-center flex-wrap gap-2 text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white font-display tracking-tight">
      {parts.map((part, idx) => {
        if (part === '=' || part === '?' || part === '·' || part === ':') {
          return <span key={idx} className="text-slate-400 mx-1">{part}</span>;
        }

        // Handle (9^5)^2 structure
        // We can simple replace ^num with <sup>num</sup> parsing logic
        const tokens = part.split(/(\^)/);
        return (
          <div key={idx} className="flex items-start text-primary">
            {tokens.map((token, tIdx) => {
              if (token === '^') return null; // Skip symbol
              // If previous token was ^, this is an exponent
              if (tIdx > 0 && tokens[tIdx - 1] === '^') {
                return <sup key={tIdx} className="text-2xl md:text-3xl text-primary/80 mt-[-0.5em]">{token.replace(/[\(\)]/g, '')}</sup>;
              }
              // Check if this token ends with ')' which might separate nested powers like (9^5)^2
              // Simple parsing: just render non-caret parts
              // If it's a number or parenthesis
              return <span key={tIdx}>{token}</span>;
            })}
            {/* Handle outer exponent in (..)^N case manually if regex split is tricky, 
                         but for "simple" generation below:
                         We will generate strings like "9^5" or "(9^5)^2"
                     */}
          </div>
        );
      })}
    </div>
  );
};

// Simplified renderer for specific question types generated below
const QuestionRenderer: React.FC<{ text: string, type?: string }> = ({ text, type }) => {
  // If it is a root question e.g. "√144 = ?"
  if (text.startsWith('√')) {
    return (
      <div className="flex items-center gap-1 text-5xl md:text-6xl font-black text-primary">
        <span className="text-slate-400">√</span>
        <span>{text.replace('√', '').replace('= ?', '')}</span>
        <span className="text-slate-400 ml-4">= ?</span>
      </div>
    );
  }

  // Powers logic
  if (text.includes('^')) {
    // Example inputs: 
    // 1. "9^5 · 9^2 = ?"
    // 2. "(9^5)^2 = ?"
    const equationParts = text.split(' = ?')[0]; // Remove "= ?"

    // Function to render a single term like "9^5" or "(9^5)^2"
    const renderTerm = (term: string, key: number) => {
      // Check for power of power: (9^5)^2
      if (term.includes(')^')) {
        const [basePart, outerExp] = term.split(')^');
        const innerBase = basePart.replace('(', '');
        const [baseNum, innerExp] = innerBase.split('^');
        return (
          <div key={key} className="flex items-start">
            <span className="text-slate-400 text-4xl md:text-5xl self-center">(</span>
            <span className="text-primary">{baseNum}</span>
            <sup className="text-2xl md:text-3xl text-primary/80 mt-1">{innerExp}</sup>
            <span className="text-slate-400 text-4xl md:text-5xl self-center">)</span>
            <sup className="text-2xl md:text-3xl text-primary/80 mt-1">{outerExp}</sup>
          </div>
        );
      }

      // Simple power: 9^5
      if (term.includes('^')) {
        const [base, exp] = term.split('^');
        return (
          <div key={key} className="flex items-start">
            <span className="text-primary">{base}</span>
            <sup className="text-2xl md:text-3xl text-primary/80 mt-1">{exp}</sup>
          </div>
        );
      }
      return <span key={key}>{term}</span>;
    };

    // Split by operators
    // We know operators are wrapped in spaces from generation: " · " or " : "
    const parts = equationParts.split(' ');

    return (
      <div className="flex items-center justify-center flex-wrap gap-2 text-5xl md:text-6xl font-black">
        {parts.map((p, i) => {
          if (['·', ':'].includes(p)) return <span key={i} className="text-slate-400 mx-2">{p}</span>;
          return renderTerm(p, i);
        })}
        <span className="text-slate-400 ml-2">= ?</span>
      </div>
    );
  }

  // Default Fallback
  return <MathExpression text={text} />;
}

const GamesPage: React.FC = () => {
  const { user, addXp } = useAuth();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Game Configuration
  const [gameMode, setGameMode] = useState<GameMode>('ordering');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Game State
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<GameOption | null>(null);
  const [questionCount, setQuestionCount] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [explanation, setExplanation] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoNextTimeoutRef = useRef<number | null>(null);
  const [currentXpGain, setCurrentXpGain] = useState(0);

  // Ordering Game Specific State
  const [orderingState, setOrderingState] = useState<{
    sequence: number[],
    currentStep: number,
    completedIds: number[]
  }>({ sequence: [], currentStep: 0, completedIds: [] });

  // --- PROGRESSION CHECKS ---
  const isLessonCompleted = (id: string) => user ? user.completedLessons.includes(id) : false;
  const getXp = (key: string) => user ? (user.gameXp[key] || 0) : 0;

  // Locks Logic (XP Based)
  const addSubUnlocked = getXp('ordering_hard') >= XP_LIMITS['ordering_hard'];
  const multDivUnlocked = getXp('addition_hard') >= XP_LIMITS['addition_hard'] || getXp('subtraction_hard') >= XP_LIMITS['subtraction_hard'];
  const powersRootsUnlocked = getXp('multiplication_hard') >= XP_LIMITS['multiplication_hard'] || getXp('division_hard') >= XP_LIMITS['division_hard'];
  const combinedUnlocked = getXp('powers_hard') >= XP_LIMITS['powers_hard'] || getXp('roots_hard') >= XP_LIMITS['roots_hard'];
  const mixedUnlocked = user ? user.level >= 5 : false;

  // --- NEW: THEORY QUIZ REQUIREMENTS ---
  const getRequiredTheory = (mode: GameMode): string | null => {
    switch (mode) {
      case 'ordering': return 'theory_intro';
      case 'addition':
      case 'subtraction': return 'theory_operations';
      case 'multiplication':
      case 'division': return 'theory_multiplication';
      case 'powers':
      case 'roots': return 'theory_powers';
      case 'combined': return 'theory_advanced';
      // Mixed requires level 5, handled separately
      default: return null;
    }
  };

  const isDifficultyLocked = (mode: GameMode, diff: Difficulty) => {
    if (diff === 'easy') return false;
    const easyLimit = XP_LIMITS[`${mode}_easy`] || 100;
    if (diff === 'medium') return getXp(`${mode}_easy`) < easyLimit;
    const mediumLimit = XP_LIMITS[`${mode}_medium`] || 150;
    if (diff === 'hard') return getXp(`${mode}_medium`) < mediumLimit;
    return true;
  };

  // --- EFFECT: Handle Mode Switching & Permissions ---
  useEffect(() => {
    let mode = searchParams.get('mode') as GameMode;
    const diff = searchParams.get('difficulty') as Difficulty;

    // 1. XP/Level Lock Checks (Prevent URL hacking)
    if (mode === 'mixed' && !mixedUnlocked) mode = 'ordering';
    if (mode === 'combined' && !combinedUnlocked) mode = 'ordering';
    if ((mode === 'powers' || mode === 'roots') && !powersRootsUnlocked) mode = 'ordering';
    if ((mode === 'multiplication' || mode === 'division') && !multDivUnlocked) mode = 'ordering';
    if ((mode === 'addition' || mode === 'subtraction') && !addSubUnlocked) mode = 'ordering';

    // 2. Theory Completion Check (New Requirement)
    const requiredTheory = getRequiredTheory(mode || 'ordering');
    if (requiredTheory && !isLessonCompleted(requiredTheory)) {
      addToast('error', 'Joko hau desblokeatzeko Teoria irakurri eta testa gainditu behar duzu!');
      navigate('/topics');
      return;
    }

    if (!mode) mode = 'ordering';
    setGameMode(mode);

    let targetDiff = diff || 'easy';
    if (isDifficultyLocked(mode, targetDiff)) targetDiff = 'easy';

    setDifficulty(targetDiff);
    generateQuestion(mode, targetDiff);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, [searchParams, mixedUnlocked, combinedUnlocked, addSubUnlocked, multDivUnlocked, powersRootsUnlocked]);

  // Timer Logic
  useEffect(() => {
    if (difficulty === 'hard' && !isGameOver && (!selectedAnswer || (question?.type === 'ordering'))) {
      if (timerRef.current) clearInterval(timerRef.current);
      const isComplex = gameMode === 'combined' || gameMode === 'mixed' || question?.type === 'ordering';
      const timeLimit = isComplex ? 45 : 30;

      if (question?.type !== 'ordering' || orderingState.currentStep === 0) {
        setTimeLeft(timeLimit);
      }

      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 0) return prev - 1;
          handleTimeUp();
          return 0;
        });
      }, 1000);
    } else if (question?.type !== 'ordering') {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(null);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questionCount, difficulty, isGameOver, gameMode, question]);

  const handleTimeUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    playSound.wrong();
    applyPenalty();
    setStreak(0);
    if (question?.type !== 'ordering') {
      setSelectedAnswer({ val: "Denbora!", isCorrect: false });
      setExplanation("Denbora agortu da. Azkarrago hurrengoan!");
    } else {
      setExplanation("Denbora agortu da! Saiatu azkarrago.");
      setSelectedAnswer({ val: "Denbora!", isCorrect: false });
    }
    autoNextTimeoutRef.current = window.setTimeout(() => { nextQuestion(); }, 2000);
  };

  const getRandomInt = (min: number, max: number) => {
    const res = Math.floor(Math.random() * (max - min + 1)) + min;
    return res === 0 ? 0 : res;
  };

  const getCategoryKey = () => `${gameMode}_${difficulty}`;
  const getXpCap = () => XP_LIMITS[getCategoryKey()] || 100;
  const getCurrentCategoryXp = () => user?.gameXp[getCategoryKey()] || 0;

  // --- QUESTION GENERATORS ---
  const generateOrderingQuestion = (diff: Difficulty) => {
    let count = diff === 'easy' ? 4 : 5;
    let range = diff === 'easy' ? 10 : diff === 'medium' ? 25 : 100;
    const nums = new Set<number>();
    while (nums.size < count) {
      let n = getRandomInt(-range, range);
      if (n !== 0) nums.add(n);
    }
    const sequence = Array.from(nums).sort((a, b) => a - b);
    const options = Array.from(nums).sort(() => Math.random() - 0.5).map(n => ({
      val: n.toString(),
      isCorrect: true, id: n
    }));
    setOrderingState({ sequence, currentStep: 0, completedIds: [] });
    setQuestion({ text: "Ordenatu zenbakiak TXIKIENETIK HANDIERA", options, type: 'ordering', orderingSequence: sequence });
    setExplanation("Gogoratu: Zenbaki negatiboetan, zenbat eta urrunago zerotik, orduan eta txikiagoa.");
  };

  const generateCombinedQuestion = (diff: Difficulty) => {
    const type = diff === 'hard' ? getRandomInt(1, 4) : getRandomInt(1, 2);
    let range = diff === 'easy' ? 5 : 10;
    let a = getRandomInt(-range, range);
    let b = getRandomInt(-range, range);
    let c = getRandomInt(-range, range);
    if (a === 0) a = 2; if (b === 0) b = 3; if (c === 0) c = -2;

    let text = "", ans = 0, wrong1 = 0;
    if (type === 1) {
      text = `${a} + ${b < 0 ? `(${b})` : b} · ${c < 0 ? `(${c})` : c}`; ans = a + (b * c); wrong1 = (a + b) * c;
    } else if (type === 2) {
      text = `(${a} ${b < 0 ? '-' : '+'} ${Math.abs(b)}) · ${c < 0 ? `(${c})` : c}`; ans = (a + b) * c; wrong1 = a + (b * c);
    } else if (type === 3) {
      c = c === 0 ? 2 : c; b = c * getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
      text = `${a} - ${b < 0 ? `(${b})` : b} : ${c < 0 ? `(${c})` : c}`; ans = a - (b / c); wrong1 = (a - b) / c;
    } else {
      text = `${a < 0 ? `(${a})` : a} · ${b < 0 ? `(${b})` : b} - ${c < 0 ? `(${c})` : c}`; ans = (a * b) - c; wrong1 = a * (b - c);
    }
    let wrong2 = -ans;
    let wrong3 = ans + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const opts = new Set([ans, wrong1, wrong2, wrong3]);
    while (opts.size < 4) opts.add(getRandomInt(-50, 50));
    const options: GameOption[] = Array.from(opts).sort(() => Math.random() - 0.5).map(val => ({ val: `${val}`, isCorrect: val === ans }));
    setQuestion({ text: text + " = ?", options, type: 'quiz' });
    setExplanation(`Hierarkia (PEMDAS): Parentesiak lehenengo, gero Berreketak/Erroak, gero Biderketa/Zatiketa, azkenik Batuketa/Kenketa.`);
  };

  const generateQuestion = (mode: GameMode, diff: Difficulty) => {
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    setSelectedAnswer(null); setExplanation(''); setOrderingState({ sequence: [], currentStep: 0, completedIds: [] });

    if (mode === 'ordering') { generateOrderingQuestion(diff); return; }
    if (mode === 'combined') { generateCombinedQuestion(diff); return; }

    let currentMode = mode;
    if (mode === 'mixed') {
      const rand = Math.random();
      if (rand < 0.15) { generateOrderingQuestion(diff); return; }
      if (rand < 0.35) { generateCombinedQuestion(diff); return; }
      const modes = ['addition', 'subtraction', 'multiplication', 'division', 'powers', 'roots'] as const;
      currentMode = modes[getRandomInt(0, 5)];
    }

    let range = diff === 'easy' ? 9 : diff === 'medium' ? 20 : 50;
    let num1 = getRandomInt(-range, range);
    let num2 = getRandomInt(-range, range);
    let operator = '';
    let correctAnswerStr = "";
    let qText = '';
    const optionsRaw = new Set<string>();

    if (currentMode === 'powers') {
      // --- NEW POWERS LOGIC (VISUAL FIX) ---
      // Instead of generating Unicode superscripts, we generate standard text markers like '^'
      // The Renderer will handle the display.

      const propType = getRandomInt(1, 3); // 1: Multiply, 2: Divide, 3: Power of Power
      let base = diff === 'easy' ? getRandomInt(2, 9) : getRandomInt(2, 15);
      let exp1 = getRandomInt(2, 5);
      let exp2 = getRandomInt(2, 5);

      let correctExp = 0;
      let wrongExp1 = 0, wrongExp2 = 0, wrongExp3 = 0;

      if (propType === 1) { // Product: a^n * a^m = a^(n+m)
        operator = '·';
        qText = `${base}^${exp1} · ${base}^${exp2} = ?`;
        correctExp = exp1 + exp2;
        wrongExp1 = exp1 * exp2;
        wrongExp2 = Math.abs(exp1 - exp2);
        wrongExp3 = correctExp + 1;
        setExplanation(`Oinarri berdineko biderketan, berretzaileak BATU egiten dira (${exp1} + ${exp2} = ${correctExp}).`);
      } else if (propType === 2) { // Quotient: a^n : a^m = a^(n-m)
        if (exp2 >= exp1) { let t = exp1; exp1 = exp2 + getRandomInt(1, 3); exp2 = t; }
        operator = ':';
        qText = `${base}^${exp1} : ${base}^${exp2} = ?`;
        correctExp = exp1 - exp2;
        wrongExp1 = exp1 + exp2;
        wrongExp2 = Math.floor(exp1 / exp2);
        wrongExp3 = correctExp + 2;
        setExplanation(`Oinarri berdineko zatiketan, berretzaileak KENDU egiten dira (${exp1} - ${exp2} = ${correctExp}).`);
      } else { // Power of Power: (a^n)^m = a^(n*m)
        operator = '()';
        qText = `(${base}^${exp1})^${exp2} = ?`;
        correctExp = exp1 * exp2;
        wrongExp1 = exp1 + exp2;
        wrongExp2 = Math.pow(exp1, exp2);
        wrongExp3 = correctExp - 1;
        setExplanation(`Berreketaren berreketan, berretzaileak BIDERKATU egiten dira (${exp1} · ${exp2} = ${correctExp}).`);
      }

      // We render options with a custom renderer or just as strings if simple
      // For buttons, we can leave them as strings with ^ notation OR render them. 
      // Let's render them as ReactNodes in the options logic?
      // Actually, the option interface expects a string value for `val`.
      // We will make the button render logic parse this string.

      correctAnswerStr = `${base}^${correctExp}`;
      optionsRaw.add(correctAnswerStr);
      optionsRaw.add(`${base}^${wrongExp1}`);
      if (wrongExp2 !== correctExp && wrongExp2 !== wrongExp1) optionsRaw.add(`${base}^${wrongExp2}`);
      optionsRaw.add(`${base}^${wrongExp3}`);

      while (optionsRaw.size < 4) {
        optionsRaw.add(`${base}^${correctExp + getRandomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1)}`);
      }

    } else if (currentMode === 'roots') {
      let root = diff === 'easy' ? getRandomInt(1, 10) : getRandomInt(1, 15);
      if (root === 0) root = 2;
      num1 = root * root;
      let answerVal = root;
      qText = `√${num1} = ?`;
      correctAnswerStr = answerVal.toString();

      optionsRaw.add(correctAnswerStr);
      optionsRaw.add((root + 1).toString());
      optionsRaw.add((root - 1).toString());
      optionsRaw.add((Math.floor(num1 / 2)).toString());
      setExplanation(`Erantzuna: ${root}, zeren ${root}² = ${num1}.`);

    } else {
      // Standard Ops
      let val1 = num1;
      let val2 = num2;
      if (currentMode === 'division') {
        if (num2 === 0) num2 = 2;
        const ans = getRandomInt(-10, 10);
        val2 = num2;
        val1 = (ans === 0 ? 2 : ans) * val2;
      }
      let ansNum = 0;
      switch (currentMode) {
        case 'addition': operator = '+'; ansNum = val1 + val2; break;
        case 'subtraction': operator = '-'; ansNum = val1 - val2; break;
        case 'multiplication': operator = '×'; ansNum = val1 * val2; break;
        case 'division': operator = ':'; ansNum = val1 / val2; break;
      }
      qText = `${val1 < 0 ? `(${val1})` : val1} ${operator} ${val2 < 0 ? `(${val2})` : val2} = ?`;
      correctAnswerStr = ansNum > 0 ? `+${ansNum}` : `${ansNum}`;

      optionsRaw.add(correctAnswerStr);

      // --- SMART DISTRACTORS ---
      const off = Math.random() > 0.5 ? 1 : 2;
      const nearMiss = ansNum + (Math.random() > 0.5 ? off : -off);
      optionsRaw.add(nearMiss > 0 ? `+${nearMiss}` : `${nearMiss}`);

      let wrongOp = 0;
      if (operator === '+') wrongOp = val1 - val2;
      else if (operator === '-') wrongOp = val1 + val2;
      else if (operator === '×') wrongOp = val1 + val2;
      else if (operator === ':') wrongOp = val1 - val2;

      if (wrongOp !== ansNum) {
        optionsRaw.add(wrongOp > 0 ? `+${wrongOp}` : `${wrongOp}`);
      }

      if (Math.random() < 0.2 && ansNum !== 0) {
        optionsRaw.add(ansNum > 0 ? `${-ansNum}` : `+${-ansNum}`);
      }

      while (optionsRaw.size < 4) {
        const variance = Math.max(5, Math.abs(ansNum) * 0.4);
        const r = getRandomInt(ansNum - variance, ansNum + variance);
        if (r !== ansNum) {
          optionsRaw.add(r > 0 ? `+${r}` : `${r}`);
        }
      }
      setExplanation(`Erantzuna: ${correctAnswerStr}.`);
    }

    const options: GameOption[] = Array.from(optionsRaw).sort(() => Math.random() - 0.5).map(val => ({
      val: val,
      isCorrect: val === correctAnswerStr
    }));

    setQuestion({ text: qText, options, type: 'quiz' });
  };

  const getPointsForQuestion = (currentStreak: number) => {
    const basePoints = difficulty === 'hard' ? 25 : difficulty === 'medium' ? 15 : 10;
    const streakBonus = currentStreak * (difficulty === 'hard' ? 3 : 2);
    return basePoints + streakBonus;
  };

  const awardXp = async (amount: number) => {
    const added = await addXp(amount, getCategoryKey());
    if (added > 0) {
      addToast('xp', `+${added} XP`);
      setCurrentXpGain(prev => prev + added);
    } else if (amount > 0) {
      addToast('info', 'Zailtasun honetako XP muga lortu duzu! Saiatu hurrengoa.');
    } else if (added < 0) {
      addToast('error', `-${Math.abs(added)} XP (Penalizazioa)`);
      setCurrentXpGain(prev => prev + added);
    }
  };

  const applyPenalty = async () => {
    const potentialWin = getPointsForQuestion(streak);
    const penalty = potentialWin * 1.5;
    await awardXp(-penalty);
  };

  const handleOrderingClick = (opt: GameOption) => {
    if (!question || !question.orderingSequence) return;
    const targetNum = question.orderingSequence[orderingState.currentStep];
    const clickedNum = parseInt(opt.val);

    if (clickedNum === targetNum) {
      playSound.click();
      const newCompleted = [...orderingState.completedIds, clickedNum];
      if (newCompleted.length === question.orderingSequence.length) {
        playSound.correct();
        setOrderingState(prev => ({ ...prev, completedIds: newCompleted }));
        setSelectedAnswer({ val: "Zuzena!", isCorrect: true });
        const points = getPointsForQuestion(streak);
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        awardXp(points);
        autoNextTimeoutRef.current = window.setTimeout(() => { nextQuestion(); }, 1500);
      } else {
        setOrderingState(prev => ({ ...prev, currentStep: prev.currentStep + 1, completedIds: newCompleted }));
      }
    } else {
      playSound.wrong();
      applyPenalty();
      setStreak(0);
      addToast('error', 'Ordena okerra! Saiatu berriro.');
    }
  };

  const handleAnswerClick = (ans: GameOption) => {
    if (selectedAnswer) return;
    if (question?.type === 'ordering') { handleOrderingClick(ans); return; }

    setSelectedAnswer(ans);
    if (timerRef.current) clearInterval(timerRef.current);

    if (ans.isCorrect) {
      playSound.correct();
      const points = getPointsForQuestion(streak);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      awardXp(points);
    } else {
      playSound.wrong();
      applyPenalty();
      setStreak(0);
    }
    autoNextTimeoutRef.current = window.setTimeout(() => { nextQuestion(); }, 1500);
  };

  const nextQuestion = () => {
    playSound.click();
    if (questionCount < 5) {
      setQuestionCount(prev => prev + 1);
      generateQuestion(gameMode, difficulty);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setIsGameOver(true);
    playSound.win();
    if (score >= (difficulty === 'hard' ? 50 : 30)) {
      const bonus = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 30 : 10;
      await awardXp(bonus);
      addToast('success', `Jokoa amaituta! Bonus: ${bonus} XP`);
    } else {
      addToast('success', 'Jokoa amaituta!');
    }
  };

  const restartGame = () => {
    playSound.click();
    setIsGameOver(false);
    setQuestionCount(1);
    setScore(0);
    setStreak(0);
    setCurrentXpGain(0);
    generateQuestion(gameMode, difficulty);
  };

  // --- RENDER ---
  if (isGameOver) {
    const stars = score > (difficulty === 'hard' ? 100 : 50) ? 3 : score > (difficulty === 'hard' ? 50 : 30) ? 2 : 1;
    return (
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {stars === 3 && <Confetti />}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300 relative z-10">
          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <span key={i} className={`material-symbols-outlined text-6xl ${i <= stars ? 'text-yellow-400 fill-current animate-bounce' : 'text-slate-200 dark:text-slate-700'}`} style={{ animationDelay: `${i * 100}ms` }}>
                star
              </span>
            ))}
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {stars === 3 ? 'Bikain!' : stars === 2 ? 'Oso Ondo!' : 'Ondo!'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {score} puntu lortu dituzu.
            {currentXpGain !== 0 && (
              <span className={`block mt-2 font-bold ${currentXpGain > 0 ? 'text-yellow-500' : 'text-red-500'}`}>
                {currentXpGain > 0 ? `+${currentXpGain}` : currentXpGain} XP saio honetan
              </span>
            )}
            {currentXpGain === 0 && <span className="block mt-2 text-xs text-slate-400 uppercase font-bold">XP Muga Lortuta</span>}
          </p>

          <div className="flex flex-col gap-3">
            <button onClick={restartGame} className="w-full py-3 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">replay</span>
              Jolastu Berriro
            </button>
            <Link to="/topics" className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold">
              Itzuli Gaietara
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentCap = getXpCap();
  const currentEarned = getCurrentCategoryXp();
  const isCapped = currentEarned >= currentCap;

  return (
    <main className="layout-container flex h-full grow flex-col">
      <div className="w-full flex flex-1 justify-center py-5 px-4 md:px-8">
        <div className="layout-content-container flex flex-col max-w-[1200px] flex-1 gap-8">

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              {isCapped && <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center font-black text-yellow-600 dark:text-yellow-400 opacity-20 -rotate-12 text-3xl">MAX</div>}
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-yellow-500">stars</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">XP ({difficulty})</p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-slate-900 dark:text-white text-2xl font-bold">{currentEarned}</p>
                <p className="text-slate-400 text-sm font-medium mb-1">/ {currentCap}</p>
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-1">
                <div className={`h-full rounded-full transition-all ${isCapped ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (currentEarned / currentCap) * 100)}%` }}></div>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">school</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Maila</p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">{user ? user.level : 1}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Bolada</p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">{streak}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-[#1a2634] shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-blue-400">score</span>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Puntuazioa</p>
              </div>
              <p className="text-slate-900 dark:text-white text-2xl font-bold">{score}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Game Area (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">

              <div className="flex gap-4">
                <div className="flex-1 bg-white dark:bg-[#1a2634] rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">tune</span>
                    <p className="text-slate-900 dark:text-white text-sm font-bold">Zailtasuna</p>
                  </div>
                  <div className="flex gap-1">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                      const locked = isDifficultyLocked(gameMode, d);
                      return (
                        <button
                          key={d}
                          disabled={locked}
                          onClick={() => { playSound.click(); setDifficulty(d); generateQuestion(gameMode, d); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }}
                          className={`px-3 py-1 text-xs font-bold rounded-full capitalize border flex items-center gap-1 transition-all
                                ${difficulty === d
                              ? 'bg-primary text-white border-primary'
                              : locked
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed opacity-70'
                                : 'bg-transparent text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                        >
                          {locked && <span className="material-symbols-outlined text-[10px]">lock</span>}
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {timeLeft !== null && (
                  <div className={`w-20 bg-white dark:bg-[#1a2634] rounded-xl p-2 shadow-sm border flex items-center justify-center font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-500 border-red-500 animate-pulse' : 'text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'}`}>
                    {timeLeft}s
                  </div>
                )}
              </div>

              {/* Game Card */}
              <div className="flex flex-col bg-white dark:bg-[#1a2634] rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-sm">quiz</span>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Galdera {questionCount}/5</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1.5 w-6 rounded-full ${i < questionCount - 1 ? 'bg-green-500' : (i === questionCount - 1 ? 'bg-blue-500 animate-pulse' : 'bg-slate-200 dark:bg-slate-700')}`}></div>
                    ))}
                  </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col items-center justify-center gap-8 min-h-[400px]">
                  {question && (
                    <>
                      <div className="text-center w-full">
                        <p className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">
                          {question.type === 'ordering' ? 'Ordenatu Zenbakiak' : gameMode === 'combined' ? 'Kalkulatu (Kontuz Hierarkiarekin!)' : gameMode === 'powers' ? 'Sinplifikatu' : 'Kalkulatu emaitza'}
                        </p>

                        {question.type !== 'ordering' ? (
                          <QuestionRenderer text={question.text} type={question.type} />
                        ) : (
                          <div className="flex flex-col items-center gap-6 w-full">
                            <div className="flex gap-2 items-center justify-center flex-wrap min-h-[60px] p-4 bg-slate-100 dark:bg-slate-900 rounded-xl w-full">
                              {orderingState.completedIds.map(id => (
                                <div key={id} className="size-12 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-lg animate-in zoom-in">
                                  {id}
                                </div>
                              ))}
                              {orderingState.completedIds.length === 0 && <span className="text-slate-400 italic">Hautatu zenbaki txikiena...</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
                        {question.options.map((item, idx) => {
                          if (question.type === 'ordering' && orderingState.completedIds.includes(item.id!)) {
                            return <div key={idx} className="h-[76px]"></div>;
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerClick(item)}
                              disabled={!!selectedAnswer && question.type !== 'ordering'}
                              className={`group relative flex items-center justify-center py-6 px-4 rounded-xl border-2 transition-all 
                                    ${(selectedAnswer === item && question.type !== 'ordering') ? (item.isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') :
                                  'border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 active:bg-primary/10'}`}
                            >
                              <div className={`text-2xl font-bold transition-colors ${(selectedAnswer === item && question.type !== 'ordering') ? (item.isCorrect ? 'text-green-600' : 'text-red-600') : 'text-slate-700 dark:text-slate-200 group-hover:text-primary'}`}>
                                {/* Use simple rendering for options, or parse if they contain powers */}
                                {item.val.includes('^') ? (
                                  <div className="flex items-start">
                                    <span>{item.val.split('^')[0]}</span>
                                    <sup className="text-sm mt-1">{item.val.split('^')[1]}</sup>
                                  </div>
                                ) : (
                                  item.val
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
                {selectedAnswer && (
                  <div className={`border-t p-4 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-2 fade-in duration-300 ${selectedAnswer.isCorrect || question?.type === 'ordering' ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-full flex items-center justify-center ${selectedAnswer.isCorrect || question?.type === 'ordering' ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300' : 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300'}`}>
                        <span className="material-symbols-outlined">{(selectedAnswer.isCorrect || question?.type === 'ordering') ? 'celebration' : 'help'}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-lg leading-tight ${(selectedAnswer.isCorrect || question?.type === 'ordering') ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                          {(selectedAnswer.isCorrect || question?.type === 'ordering') ? (question?.type === 'ordering' ? 'Ondo ordenatuta!' : 'Primeran!') : 'Saiatu berriro!'}
                        </p>
                        {question?.type !== 'ordering' && (
                          <p className={`${selectedAnswer.isCorrect ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'} text-sm`}>
                            {selectedAnswer.isCorrect ? 'Erantzun zuzena.' : explanation}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold opacity-60 text-slate-600 dark:text-slate-300">
                      Hurrengoa kargatzen...
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Menu Area (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">Joko Moduak</h3>
                <Link className="text-primary text-sm font-medium hover:underline" to="/topics">Teoria</Link>
              </div>

              <div className="flex flex-col gap-4">

                {/* Main Games */}
                <div className="grid grid-cols-1 gap-3">
                  <button
                    disabled={!mixedUnlocked}
                    onClick={() => { if (mixedUnlocked) { playSound.click(); setGameMode('mixed'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); } }}
                    className={`relative p-5 rounded-2xl border-2 shadow-sm flex flex-col items-center gap-3 transition-all text-center group ${!mixedUnlocked ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed' : gameMode === 'mixed' ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                  >
                    {!mixedUnlocked && <div className="absolute top-2 right-2 text-slate-400"><span className="material-symbols-outlined">lock</span></div>}
                    <div className={`size-14 rounded-full flex items-center justify-center border-4 border-white/20 shrink-0 ${gameMode === 'mixed' ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                      <span className="material-symbols-outlined text-3xl">shuffle</span>
                    </div>
                    <div>
                      <h4 className={`font-black text-xl leading-none ${gameMode === 'mixed' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>Nahastuta</h4>
                      <p className={`text-xs mt-1 font-bold uppercase tracking-wide opacity-80 ${gameMode === 'mixed' ? 'text-blue-100' : 'text-slate-500'}`}>Azterketa Orokorra</p>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={!isLessonCompleted('theory_intro')}
                      onClick={() => {
                        if (!isLessonCompleted('theory_intro')) return;
                        playSound.click(); setGameMode('ordering'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0);
                      }}
                      className={`p-4 rounded-xl border shadow-sm flex flex-col items-center gap-2 transition-all ${!isLessonCompleted('theory_intro') ? 'opacity-50 grayscale cursor-not-allowed' : gameMode === 'ordering' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-[#101822]' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:border-amber-500/50'}`}
                    >
                      <div className={`size-10 rounded-full flex items-center justify-center border-2 border-white/20 ${gameMode === 'ordering' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                        <span className="material-symbols-outlined">sort</span>
                      </div>
                      <span className={`text-sm font-bold ${gameMode === 'ordering' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>Ordena</span>
                    </button>

                    <button
                      disabled={!combinedUnlocked || !isLessonCompleted('theory_advanced')}
                      onClick={() => { if (combinedUnlocked && isLessonCompleted('theory_advanced')) { playSound.click(); setGameMode('combined'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); } }}
                      className={`p-4 rounded-xl border shadow-sm flex flex-col items-center gap-2 transition-all ${!combinedUnlocked || !isLessonCompleted('theory_advanced') ? 'bg-slate-50 dark:bg-slate-800 opacity-50 cursor-not-allowed border-slate-200' : gameMode === 'combined' ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20 ring-2 ring-purple-600 ring-offset-2 dark:ring-offset-[#101822]' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-600/50'}`}
                    >
                      <div className={`size-10 rounded-full flex items-center justify-center border-2 border-white/20 ${gameMode === 'combined' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'}`}>
                        <span className="material-symbols-outlined">function</span>
                      </div>
                      <span className={`text-sm font-bold ${gameMode === 'combined' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>Konbinatuak</span>
                      {(!combinedUnlocked || !isLessonCompleted('theory_advanced')) && <span className="material-symbols-outlined text-xs absolute top-2 right-2 text-slate-400">lock</span>}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

                {/* Specific Operations Grid */}
                <div>
                  {/* ADD / SUB */}
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">2. Unitatea</h4>
                  <div className={`grid grid-cols-2 gap-3 mb-4 ${!addSubUnlocked || !isLessonCompleted('theory_operations') ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button disabled={!addSubUnlocked} onClick={() => { setGameMode('addition'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${gameMode === 'addition' ? 'bg-green-600 border-green-600 text-white shadow-md' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-900/10'}`}>
                      <div className="size-8 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center font-black text-lg">+</div>
                      <span className={`text-sm font-bold ${gameMode === 'addition' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Batuketa</span>
                      {(!addSubUnlocked || !isLessonCompleted('theory_operations')) && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                    </button>
                    <button disabled={!addSubUnlocked} onClick={() => { setGameMode('subtraction'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${gameMode === 'subtraction' ? 'bg-red-500 border-red-500 text-white shadow-md' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/10'}`}>
                      <div className="size-8 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center font-black text-lg">-</div>
                      <span className={`text-sm font-bold ${gameMode === 'subtraction' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Kenketa</span>
                      {(!addSubUnlocked || !isLessonCompleted('theory_operations')) && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                    </button>
                  </div>

                  {/* MULT / DIV */}
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">3. Unitatea</h4>
                  <div className={`grid grid-cols-2 gap-3 mb-4 ${!multDivUnlocked || !isLessonCompleted('theory_multiplication') ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button disabled={!multDivUnlocked} onClick={() => { setGameMode('multiplication'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${gameMode === 'multiplication' ? 'bg-orange-500 border-orange-500 text-white shadow-md' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-orange-50 dark:hover:bg-orange-900/10'}`}>
                      <div className="size-8 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-lg">×</div>
                      <span className={`text-sm font-bold ${gameMode === 'multiplication' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Biderketa</span>
                      {(!multDivUnlocked || !isLessonCompleted('theory_multiplication')) && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                    </button>
                    <button disabled={!multDivUnlocked} onClick={() => { setGameMode('division'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${gameMode === 'division' ? 'bg-teal-500 border-teal-500 text-white shadow-md' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/10'}`}>
                      <div className="size-8 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-lg">:</div>
                      <span className={`text-sm font-bold ${gameMode === 'division' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Zatiketa</span>
                      {(!multDivUnlocked || !isLessonCompleted('theory_multiplication')) && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                    </button>
                  </div>

                  {/* POWERS / ROOTS (NEW) */}
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">4. Unitatea</h4>
                  <div className={`grid grid-cols-2 gap-3 ${!powersRootsUnlocked || !isLessonCompleted('theory_powers') ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button disabled={!powersRootsUnlocked} onClick={() => { setGameMode('powers'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${gameMode === 'powers' ? 'bg-indigo-500 border-indigo-500 text-white shadow-md' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'}`}>
                      <div className="size-8 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">x²</div>
                      <span className={`text-sm font-bold ${gameMode === 'powers' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Berreketak</span>
                      {(!powersRootsUnlocked || !isLessonCompleted('theory_powers')) && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                    </button>
                    <button disabled={!powersRootsUnlocked} onClick={() => { setGameMode('roots'); setDifficulty('easy'); setQuestionCount(1); setScore(0); setCurrentXpGain(0); }} className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${gameMode === 'roots' ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/10'}`}>
                      <div className="size-8 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-lg">√</div>
                      <span className={`text-sm font-bold ${gameMode === 'roots' ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Erroketak</span>
                      {(!powersRootsUnlocked || !isLessonCompleted('theory_powers')) && <span className="material-symbols-outlined text-xs ml-auto">lock</span>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default GamesPage;