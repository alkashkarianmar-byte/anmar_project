
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AchievementSection, SectionId } from '../types';

// Custom hook for declarative intervals
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


const GameWrapper: React.FC<{ title: string; instructions: string; children: React.ReactNode }> = ({ title, instructions, children }) => (
  <div className="text-center text-slate-700 dark:text-slate-300">
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm mb-4">{instructions}</p>
    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg min-h-[350px] flex items-center justify-center p-2 overflow-hidden select-none">
      {children}
    </div>
  </div>
);

const GameResult: React.FC<{ score: number | string; onPlayAgain: () => void }> = ({ score, onPlayAgain }) => (
  <div className="flex flex-col items-center justify-center bg-black/30 absolute inset-0 z-20">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg text-center">
      <h4 className="text-2xl font-bold mb-2">انتهت اللعبة!</h4>
      <p className="text-lg mb-4">نتيجتك: {score}</p>
      <button onClick={onPlayAgain} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
        العب مرة أخرى
      </button>
    </div>
  </div>
);

// --- Game 1: Goal Target Game ---
const GoalTargetGame: React.FC = () => {
    type Target = { id: number; x: number; y: number };
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [targets, setTargets] = useState<Target[]>([]);

    const createTarget = () => {
        if (targets.length < 5) { // Max 5 targets at a time
             setTargets(prev => [...prev, {
                id: Date.now(),
                x: Math.random() * 90, // %
                y: Math.random() * 90, // %
            }]);
        }
    };
    
    useInterval(createTarget, gameState === 'playing' ? 800 : null);
    
    useInterval(() => {
        if (gameState === 'playing') {
            if (timeLeft > 0) {
                setTimeLeft(t => t - 1);
            } else {
                setGameState('finished');
            }
        }
    }, 1000);

    const handleStart = () => {
        setScore(0);
        setTimeLeft(15);
        setTargets([]);
        setGameState('playing');
    };

    const handleTargetClick = (id: number) => {
        setScore(s => s + 10);
        setTargets(t => t.filter(target => target.id !== id));
    };

    return (
        <GameWrapper title="إصابة الهدف" instructions="انقر على أكبر عدد ممكن من الأهداف قبل انتهاء الوقت!">
            {gameState === 'idle' && (
                 <button onClick={handleStart} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    ابدأ اللعبة
                </button>
            )}
            {gameState === 'playing' && (
                <div className="w-full h-full absolute inset-0">
                     <div className="absolute top-2 right-2 font-bold text-lg">النتيجة: {score}</div>
                     <div className="absolute top-2 left-2 font-bold text-lg">الوقت: {timeLeft}</div>
                    {targets.map(target => (
                        <button key={target.id} onClick={() => handleTargetClick(target.id)}
                            className="absolute w-10 h-10 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                            style={{ left: `${target.x}%`, top: `${target.y}%` }}
                            aria-label="Target"
                        />
                    ))}
                </div>
            )}
            {gameState === 'finished' && <GameResult score={score} onPlayAgain={handleStart} />}
        </GameWrapper>
    );
};

// --- Game 2: Planning Order Game ---
const PlanningOrderGame: React.FC = () => {
    const correctOrder = useMemo(() => [
        { id: 1, text: 'جمع المواد (خبز، جبن)' },
        { id: 2, text: 'وضع الجبن على الخبز' },
        { id: 3, text: 'وضع الشطيرة في المحمصة' },
        { id: 4, text: 'تناول الشطيرة اللذيذة!' },
    ], []);

    const shuffle = useCallback((array: any[]) => [...array].sort(() => Math.random() - 0.5), []);

    const [items, setItems] = useState(() => shuffle(correctOrder));
    const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
    const [status, setStatus] = useState<'playing' | 'won'>('playing');

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (targetId: number) => {
        if (draggedItemId === null) return;
        const draggedIndex = items.findIndex(item => item.id === draggedItemId);
        const targetIndex = items.findIndex(item => item.id === targetId);
        
        const newItems = [...items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        setItems(newItems);
        setDraggedItemId(null);
    };
    
    const checkOrder = () => {
      const isCorrect = items.every((item, index) => item.id === correctOrder[index].id);
      if(isCorrect) {
          setStatus('won');
      } else {
          alert('الترتيب غير صحيح، حاول مرة أخرى!');
      }
    };
    
    const resetGame = () => {
        setItems(shuffle(correctOrder));
        setStatus('playing');
    }

    return (
         <GameWrapper title="ترتيب الخطة" instructions="اسحب وأفلت الخطوات لترتيب خطة عمل شطيرة جبن.">
            {status === 'playing' ? (
                 <div className="w-full">
                    <div className="space-y-3 p-4">
                        {items.map(item => (
                            <div key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(item.id)}
                                className={`p-3 rounded-lg cursor-grab text-white font-semibold transition-colors ${draggedItemId === item.id ? 'bg-blue-400' : 'bg-blue-600'}`}>
                                {item.text}
                            </div>
                        ))}
                    </div>
                     <button onClick={checkOrder} className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors">
                        تحقق من الترتيب
                    </button>
                </div>
            ) : (
                <GameResult score="أحسنت!" onPlayAgain={resetGame} />
            )}
        </GameWrapper>
    );
};


// --- Game 3: Progress Reaction Game ---
const ProgressReactionGame: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'waiting' | 'ready' | 'clicked'>('idle');
    const [message, setMessage] = useState('انقر للبدء');
    const [result, setResult] = useState<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const startGame = () => {
        setStatus('waiting');
        setMessage('انتظر اللون الأخضر...');
        setResult(null);
        timerRef.current = window.setTimeout(() => {
            if (timerRef.current) {
                setStatus('ready');
                setMessage('انقر الآن!');
            }
        }, Math.random() * 2000 + 1000);
    };
    
    const handleClick = () => {
        if(status === 'idle') {
            startGame();
            return;
        }
        if(status === 'waiting' && timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
            setStatus('idle');
            setMessage('لقد نقرت مبكرًا! انقر للمحاولة مرة أخرى.');
        }
        if(status === 'ready') {
            setResult(Math.floor(Math.random() * 100) + 200);
            setStatus('clicked');
            setMessage('انقر للعب مرة أخرى');
        }
        if(status === 'clicked') {
            startGame();
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <GameWrapper title="اختبار سرعة التقدم" instructions="عندما يتحول المربع إلى اللون الأخضر، انقر بأسرع ما يمكن!">
             <div onClick={handleClick} className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 rounded-lg ${
                 status === 'waiting' ? 'bg-red-500' :
                 status === 'ready' ? 'bg-green-500' :
                 'bg-blue-500'
             }`}>
                 <div className="text-white text-2xl font-bold text-center">
                    {message}
                    {result !== null && (
                        <div className="text-4xl mt-4">{result}ms</div>
                    )}
                </div>
            </div>
        </GameWrapper>
    );
};

// --- Game 4: Learning Quiz Game ---
const quizQuestions = [
    {
        question: "ما هي عاصمة المملكة العربية السعودية؟",
        answers: ["جدة", "الرياض", "الدمام", "مكة"],
        correct: "الرياض",
    },
    {
        question: "أي كوكب يُعرف بـ 'الكوكب الأحمر'؟",
        answers: ["الأرض", "المريخ", "زحل", "المشتري"],
        correct: "المريخ",
    },
    {
        question: "كم عدد القارات في العالم؟",
        answers: ["5", "6", "7", "8"],
        correct: "7",
    },
    {
        question: "ما هو أكبر حيوان في العالم؟",
        answers: ["الفيل", "الحوت الأزرق", "الزرافة", "القرش الأبيض"],
        correct: "الحوت الأزرق",
    }
];

const LearningQuizGame: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);

    const handleStart = () => {
        setScore(0);
        setCurrentQuestionIndex(0);
        setGameState('playing');
    };

    const handleAnswerClick = (answer: string) => {
        if (answer === quizQuestions[currentQuestionIndex].correct) {
            setScore(s => s + 1);
        }

        const nextQuestion = currentQuestionIndex + 1;
        if (nextQuestion < quizQuestions.length) {
            setCurrentQuestionIndex(nextQuestion);
        } else {
            setGameState('finished');
        }
    };

    if (gameState === 'idle') {
        return (
            <GameWrapper title="تحدي المعلومات" instructions="أجب عن الأسئلة التالية لاختبار معلوماتك العامة.">
                <button onClick={handleStart} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    ابدأ التحدي
                </button>
            </GameWrapper>
        );
    }

    if (gameState === 'finished') {
        return (
            <GameWrapper title="تحدي المعلومات" instructions="أجب عن الأسئلة التالية لاختبار معلوماتك العامة.">
                <GameResult score={`${score} / ${quizQuestions.length}`} onPlayAgain={handleStart} />
            </GameWrapper>
        );
    }
    
    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <GameWrapper title="تحدي المعلومات" instructions={`سؤال ${currentQuestionIndex + 1} من ${quizQuestions.length}`}>
            <div className="w-full p-4 flex flex-col items-center">
                <h4 className="text-xl font-semibold mb-6 text-center">{currentQuestion.question}</h4>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {currentQuestion.answers.map(answer => (
                        <button 
                            key={answer} 
                            onClick={() => handleAnswerClick(answer)}
                            className="p-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform hover:scale-105"
                        >
                            {answer}
                        </button>
                    ))}
                </div>
            </div>
        </GameWrapper>
    );
};

// --- Game 5: Presentation Word Cloud Game ---
const PresentationWordCloudGame: React.FC<{ content: string }> = ({ content }) => {
    const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');

    const arabicStopWords = useMemo(() => new Set(['من', 'في', 'على', 'الى', 'عن', 'و', 'يا', 'هو', 'هي', 'هذا', 'هذه', 'أن', 'تم', 'قد', 'لا', 'ما', 'مع', 'كل', 'كان', 'يكون', 'لم', 'لن', 'أو', 'إلى', 'عن', 'فيه', 'به', 'له', 'منه']), []);

    const words = useMemo(() => {
        const wordCounts = content
            .split(/[\s،.()]+/)
            .filter(word => word.length > 2 && !arabicStopWords.has(word))
            .reduce((acc, word) => {
                acc[word] = (acc[word] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
        
        return Object.entries(wordCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([text, count]) => ({ text, count }));
    }, [content, arabicStopWords]);

    const keywords = useMemo(() => new Set(words.slice(0, Math.min(5, words.length)).map(w => w.text)), [words]);
    const [foundKeywords, setFoundKeywords] = useState<Set<string>>(new Set());
    
    type PositionedWord = { text: string; count: number; x: number; y: number; size: number; rotation: number; };
    const [positionedWords, setPositionedWords] = useState<PositionedWord[]>([]);

    useEffect(() => {
        setPositionedWords(words.map(word => ({
            ...word,
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            size: 1 + word.count * 0.5,
            rotation: Math.random() * 60 - 30,
        })));
    }, [words]);

    const handleWordClick = (word: string) => {
        if (keywords.has(word)) {
            setFoundKeywords(prev => {
                const newSet = new Set(prev);
                newSet.add(word);
                if (newSet.size === keywords.size && keywords.size > 0) {
                    setGameState('finished');
                }
                return newSet;
            });
        }
    };
    
    const resetGame = () => {
        setFoundKeywords(new Set());
        setGameState('playing');
    };
    
    return (
        <GameWrapper title="سحابة الكلمات الرئيسية" instructions={keywords.size > 0 ? `ابحث عن ${keywords.size} كلمات رئيسية من إنجازك!` : 'لا توجد كلمات رئيسية كافية لبدء اللعبة.'}>
            <div className="w-full h-[350px] relative">
                {positionedWords.map(word => (
                    <button
                        key={word.text}
                        onClick={() => handleWordClick(word.text)}
                        disabled={foundKeywords.has(word.text) || keywords.size === 0}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 font-bold
                            ${foundKeywords.has(word.text) ? 'text-green-500 scale-110' : 'text-slate-700 dark:text-slate-300 hover:text-blue-500'}
                            disabled:cursor-default disabled:hover:text-slate-700 disabled:dark:hover:text-slate-300
                        `}
                        style={{
                            left: `${word.x}%`,
                            top: `${word.y}%`,
                            fontSize: `${Math.min(word.size, 4)}rem`,
                            transform: `rotate(${word.rotation}deg)`,
                        }}
                    >
                        {word.text}
                    </button>
                ))}
            </div>
            {gameState === 'finished' && <GameResult score="أحسنت!" onPlayAgain={resetGame} />}
        </GameWrapper>
    );
};

const AchievementGame: React.FC<{ section: AchievementSection }> = ({ section }) => {
  switch (section.type) {
    case 'goals':
      return <GoalTargetGame />;
    case 'planning':
      return <PlanningOrderGame />;
    case 'progress':
      return <ProgressReactionGame />;
    case 'learning':
      return <LearningQuizGame />;
    case 'presentation':
      return <PresentationWordCloudGame content={section.content} />;
    default:
      const _exhaustiveCheck: never = section.type;
      return (
          <div className="text-center p-8">
              <h3 className="font-bold">عفوًا!</h3>
              <p>لم يتم العثور على لعبة لهذا القسم.</p>
          </div>
      );
  }
};

export default AchievementGame;
