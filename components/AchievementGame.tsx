

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
  <div className="text-center text-slate-700 dark:text-slate-300 flex flex-col items-center">
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm mb-4 max-w-md">{instructions}</p>
    <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg w-full min-h-[350px] flex items-center justify-center p-2 overflow-hidden select-none">
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

// --- Game 1: Clicker Game ---
const ClickerGame: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);

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
        setTimeLeft(10);
        setGameState('playing');
    };

    const handleButtonClick = () => {
        if (gameState === 'playing') {
            setScore(s => s + 1);
        }
    };

    return (
        <GameWrapper title="تحدي النقر السريع" instructions="انقر على الزر بأسرع ما يمكن خلال 10 ثوانٍ!">
            {gameState === 'idle' && (
                 <button onClick={handleStart} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    ابدأ اللعبة
                </button>
            )}
            {gameState === 'playing' && (
                <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center p-4">
                     <div className="absolute top-2 right-2 font-bold text-lg">النتيجة: {score}</div>
                     <div className="absolute top-2 left-2 font-bold text-lg">الوقت: {timeLeft}</div>
                    <button 
                        onClick={handleButtonClick}
                        className="w-48 h-48 bg-red-500 text-white text-2xl font-bold rounded-full transform transition-transform active:scale-95 shadow-lg hover:shadow-xl focus:outline-none"
                    >
                        انقر هنا!
                    </button>
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
                timerRef.current = Date.now();
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
        if(status === 'ready' && timerRef.current) {
            setResult(Date.now() - timerRef.current);
            timerRef.current = null;
            setStatus('clicked');
            setMessage('انقر للعب مرة أخرى');
        }
        if(status === 'clicked') {
            startGame();
        }
    };

    useEffect(() => {
        return () => {
            if (typeof timerRef.current === 'number' && status !== 'ready') {
                clearTimeout(timerRef.current);
            }
        };
    }, [status]);

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
const quizQuestionPool = [
    { question: "ما هي عاصمة المملكة العربية السعودية؟", answers: ["جدة", "الرياض", "الدمام", "مكة"], correct: "الرياض" },
    { question: "أي كوكب يُعرف بـ 'الكوكب الأحمر'؟", answers: ["الأرض", "المريخ", "زحل", "المشتري"], correct: "المريخ" },
    { question: "كم عدد القارات في العالم؟", answers: ["5", "6", "7", "8"], correct: "7" },
    { question: "ما هو أكبر حيوان في العالم؟", answers: ["الفيل", "الحوت الأزرق", "الزرافة", "القرش الأبيض"], correct: "الحوت الأزرق" },
    { question: "ما هو أطول نهر في العالم؟", answers: ["الأمازون", "المسيسيبي", "النيل", "اليانغتسي"], correct: "النيل" },
    { question: "كم عدد الصلوات المفروضة في اليوم؟", answers: ["3", "4", "5", "6"], correct: "5" },
    { question: "ما هو الغاز الذي نتنفسه للبقاء على قيد الحياة؟", answers: ["النيتروجين", "ثاني أكسيد الكربون", "الأكسجين", "الهيدروجين"], correct: "الأكسجين" },
    { question: "من هو مؤسس المملكة العربية السعودية؟", answers: ["الملك فيصل", "الملك فهد", "الملك عبدالله", "الملك عبدالعزيز"], correct: "الملك عبدالعزيز" },
    { question: "ما هو أكبر محيط في العالم؟", answers: ["الأطلسي", "الهندي", "المتجمد الشمالي", "الهادئ"], correct: "الهادئ" },
    { question: "ما هي العملية التي تستخدمها النباتات لصنع طعامها؟", answers: ["التنفس", "النتح", "البناء الضوئي", "الامتصاص"], correct: "البناء الضوئي" },
    { question: "ما هو الرمز الكيميائي للماء؟", answers: ["O2", "CO2", "H2O", "NaCl"], correct: "H2O" },
    { question: "كم ضلعاً للمكعب؟", answers: ["6", "8", "12", "10"], correct: "12" },
    { question: "ما هو أسرع حيوان بري؟", answers: ["الأسد", "النمر", "الفهد", "الحصان"], correct: "الفهد" },
    { question: "في أي قارة تقع مصر؟", answers: ["آسيا", "أفريقيا", "أوروبا", "أستراليا"], correct: "أفريقيا" },
    { question: "ما هو لون علم المملكة العربية السعودية؟", answers: ["أخضر وأبيض", "أحمر وأبيض", "أزرق وأصفر", "أسود وأخضر"], correct: "أخضر وأبيض" },
];

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const LearningQuizGame: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [questions, setQuestions] = useState(() => shuffleArray(quizQuestionPool).slice(0, 5));
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);

    const handleStart = () => {
        setScore(0);
        setCurrentQuestionIndex(0);
        setQuestions(shuffleArray(quizQuestionPool).slice(0, 5));
        setGameState('playing');
        setFeedback(null);
    };

    const handleAnswerClick = (answer: string) => {
        const isCorrect = answer === questions[currentQuestionIndex].correct;
        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ message: 'إجابة صحيحة!', isCorrect: true });
        } else {
            setFeedback({ message: `إجابة خاطئة. الصحيحة هي: ${questions[currentQuestionIndex].correct}`, isCorrect: false });
        }

        setTimeout(() => {
            setFeedback(null);
            const nextQuestion = currentQuestionIndex + 1;
            if (nextQuestion < questions.length) {
                setCurrentQuestionIndex(nextQuestion);
            } else {
                setGameState('finished');
            }
        }, 1500);
    };

    if (gameState === 'idle') {
        return (
            <GameWrapper title="تحدي المعلومات" instructions="أجب عن 5 أسئلة لاختبار معلوماتك العامة.">
                <button onClick={handleStart} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    ابدأ التحدي
                </button>
            </GameWrapper>
        );
    }

    if (gameState === 'finished') {
        return (
            <GameWrapper title="تحدي المعلومات" instructions="أجب عن 5 أسئلة لاختبار معلوماتك العامة.">
                <GameResult score={`${score} / ${questions.length}`} onPlayAgain={handleStart} />
            </GameWrapper>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <GameWrapper title="تحدي المعلومات" instructions={`سؤال ${currentQuestionIndex + 1} من ${questions.length}`}>
            <div className="w-full p-4 flex flex-col items-center">
                <h4 className="text-xl font-semibold mb-6 text-center">{currentQuestion.question}</h4>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {currentQuestion.answers.map(answer => (
                        <button 
                            key={answer} 
                            onClick={() => handleAnswerClick(answer)}
                            disabled={!!feedback}
                            className="p-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed"
                        >
                            {answer}
                        </button>
                    ))}
                </div>
                 {feedback && (
                    <div className={`mt-4 text-lg font-bold ${feedback.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {feedback.message}
                    </div>
                )}
            </div>
        </GameWrapper>
    );
};

// --- Game 5: Snake Game ---

const BOARD_SIZE = 20; // 20x20 grid

type Position = { x: number; y: number };

const generateRandomPosition = (snakeBody: Position[] = []): Position => {
    let position: Position;
    do {
        position = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE),
        };
    } while (snakeBody.some(segment => segment.x === position.x && segment.y === position.y));
    return position;
};

const SnakeGame: React.FC = () => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [apple, setApple] = useState<Position>(() => generateRandomPosition([{ x: 10, y: 10 }]));
    const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
    const [score, setScore] = useState(0);

    const handleStart = () => {
        const startSnake = [{ x: 10, y: 10 }];
        setGameState('playing');
        setSnake(startSnake);
        setApple(generateRandomPosition(startSnake));
        setDirection({ x: 1, y: 0 }); // Move right
        setScore(0);
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        e.preventDefault();
        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) setDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                if (direction.y === 0) setDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                if (direction.x === 0) setDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                if (direction.x === 0) setDirection({ x: 1, y: 0 });
                break;
        }
    }, [direction]);

    useEffect(() => {
        if (gameState === 'playing') {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [gameState, handleKeyDown]);

    const gameLoop = () => {
        const newSnake = [...snake];
        const head = { ...newSnake[0] };

        head.x += direction.x;
        head.y += direction.y;

        if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
            setGameState('finished');
            return;
        }

        for (let i = 1; i < newSnake.length; i++) {
            if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
                setGameState('finished');
                return;
            }
        }
        
        newSnake.unshift(head);

        if (head.x === apple.x && head.y === apple.y) {
            setScore(s => s + 1);
            setApple(generateRandomPosition(newSnake));
        } else {
            newSnake.pop();
        }

        setSnake(newSnake);
    };

    useInterval(gameLoop, gameState === 'playing' ? 150 : null);
    
    const changeDirection = (newDir: {x: number, y: number}) => {
       if (gameState !== 'playing') return;
       if (newDir.x !== 0 && direction.x === 0) setDirection(newDir);
       if (newDir.y !== 0 && direction.y === 0) setDirection(newDir);
    }

    return (
        <GameWrapper title="لعبة الثعبان" instructions="استخدم أسهم لوحة المفاتيح أو الأزرار لتحريك الثعبان وتناول التفاح. تجنب الاصطدام بالجدران أو بنفسك!">
             <div className="flex flex-col items-center w-full">
                <div 
                    className="w-full max-w-[350px] aspect-square relative bg-slate-200 dark:bg-slate-800 rounded-md grid"
                    style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`}}
                >
                    {gameState === 'idle' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <button onClick={handleStart} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                ابدأ اللعبة
                            </button>
                        </div>
                    )}
                    {gameState === 'playing' && (
                       <>
                         {snake.map((segment, index) => (
                            <div key={index} className="bg-green-500 rounded-sm" style={{ gridColumn: segment.x + 1, gridRow: segment.y + 1 }}></div>
                         ))}
                         <div className="bg-red-500 rounded-full" style={{ gridColumn: apple.x + 1, gridRow: apple.y + 1 }}></div>
                       </>
                    )}
                    {gameState === 'finished' && <GameResult score={score} onPlayAgain={handleStart} />}
                    <div className="absolute top-1 right-2 text-slate-800 dark:text-slate-100 font-bold bg-black/20 px-2 py-1 rounded z-10">
                        النتيجة: {score}
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 w-48 md:hidden">
                    <div></div>
                    <button onClick={() => changeDirection({x: 0, y: -1})} className="p-3 bg-slate-300 dark:bg-slate-600 rounded-lg active:bg-slate-400 dark:active:bg-slate-500">▲</button>
                    <div></div>
                    <button onClick={() => changeDirection({x: -1, y: 0})} className="p-3 bg-slate-300 dark:bg-slate-600 rounded-lg active:bg-slate-400 dark:active:bg-slate-500">◀</button>
                    <button onClick={() => changeDirection({x: 0, y: 1})} className="p-3 bg-slate-300 dark:bg-slate-600 rounded-lg active:bg-slate-400 dark:active:bg-slate-500">▼</button>
                    <button onClick={() => changeDirection({x: 1, y: 0})} className="p-3 bg-slate-300 dark:bg-slate-600 rounded-lg active:bg-slate-400 dark:active:bg-slate-500">▶</button>
                </div>
            </div>
        </GameWrapper>
    );
};


const AchievementGame: React.FC<{ section: AchievementSection }> = ({ section }) => {
  switch (section.type) {
    case 'goals':
      return <ClickerGame />;
    case 'planning':
      return <PlanningOrderGame />;
    case 'progress':
      return <ProgressReactionGame />;
    case 'learning':
      return <LearningQuizGame />;
    case 'presentation':
      return <SnakeGame />;
    default:
      return (
          <div className="text-center p-8">
              <h3 className="font-bold">عفوًا!</h3>
              <p>لم يتم العثور على لعبة لهذا القسم.</p>
          </div>
      );
  }
};

export default AchievementGame;