
import React, { useState, useEffect, useRef } from 'react';
import { Question, QuizResult } from '../types';
import { ChevronLeft, Check, X, Volume2, VolumeX, Sparkles, ArrowRight, Timer, Zap } from 'lucide-react';

interface QuizPlayerProps {
  questions: Question[];
  topic: string;
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

const QuizPlayer: React.FC<QuizPlayerProps> = ({ questions, topic, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>(questions);

  const correctAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1115/1115-preview.mp3'));
  const wrongAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1116/1116-preview.mp3'));

  useEffect(() => {
    if (isAnswered) return;
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleTimeOut(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isAnswered]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setWrongCount(prev => prev + 1);
    playSound('wrong');
  };

  const playSound = (type: 'correct' | 'wrong') => {
    if (isMuted) return;
    try {
      const audio = type === 'correct' ? correctAudio.current : wrongAudio.current;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    const updated = [...quizQuestions];
    updated[currentIndex] = { ...updated[currentIndex], userAnswer: idx };
    setQuizQuestions(updated);

    if (idx === questions[currentIndex].correctAnswerIndex) {
      setScore(s => s + 1);
      playSound('correct');
    } else {
      setWrongCount(w => w + 1);
      playSound('wrong');
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete({
        quizId: Date.now().toString(),
        score: score,
        totalQuestions: questions.length,
        date: new Date().toISOString(),
        topic: topic,
        questions: quizQuestions
      });
    }
  };

  const currentQuestion = quizQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0f172a] text-white font-sans overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* 1. Header */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between shrink-0 h-[60px]">
        <button onClick={onExit} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-white/10 group">
          <ChevronLeft size={20} className="text-white/70 group-hover:text-white" />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
             <span className="text-[10px] font-heading font-bold text-emerald-400 tracking-widest uppercase">Live Session</span>
          </div>
          <h1 className="text-[12px] font-heading font-bold text-white/90 uppercase tracking-widest truncate max-w-[150px]">{topic}</h1>
        </div>

        <button onClick={() => setIsMuted(!isMuted)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-white/10 group">
          {isMuted ? <VolumeX size={18} className="text-white/50" /> : <Volume2 size={18} className="text-white/80" />}
        </button>
      </div>

      {/* 2. HUD (Heads Up Display) */}
      <div className="relative z-10 shrink-0 px-5 mb-2">
        {/* Progress Line */}
        <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden mb-4">
           <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Check size={14} className="text-indigo-400" />
             </div>
             <div>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Score</p>
                <p className="text-base font-heading font-bold text-white">{score}</p>
             </div>
          </div>

          <div className={`relative w-14 h-14 rounded-full flex items-center justify-center border-[3px] transition-colors duration-300 ${timeLeft < 10 ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-indigo-500/30'}`}>
            <span className={`text-lg font-heading font-bold ${timeLeft < 10 ? 'text-rose-500' : 'text-white'}`}>{timeLeft}</span>
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
               <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className={timeLeft < 10 ? 'text-rose-500' : 'text-indigo-500'} strokeDasharray="283" strokeDashoffset={283 - (283 * timeLeft) / 30} strokeLinecap="round" />
            </svg>
          </div>

          <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                <X size={14} className="text-rose-400" />
             </div>
             <div>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Missed</p>
                <p className="text-base font-heading font-bold text-white">{wrongCount}</p>
             </div>
          </div>
        </div>
      </div>

      {/* 3. Question Area */}
      <div className="relative z-10 flex-1 flex flex-col px-4 min-h-0 pb-2">
        <div className="glass-card rounded-[2rem] p-6 mb-4 flex-shrink-0 max-h-[40%] overflow-y-auto custom-scrollbar animate-slide-up">
           <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                Question {currentIndex + 1} <span className="text-white/30">/ {questions.length}</span>
              </span>
           </div>
           <p className="text-lg md:text-xl font-heading font-semibold leading-relaxed text-white/90">
             {currentQuestion.text}
           </p>
        </div>

        {/* Options */}
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto custom-scrollbar px-1 pb-2">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            const isSelected = idx === selectedOption;
            
            let containerClass = "glass-panel border-white/5 hover:bg-white/5 text-white/70";
            let indicatorClass = "bg-white/5 text-white/40";
            
            if (isAnswered) {
              if (isCorrect) {
                containerClass = "bg-emerald-500/10 border-emerald-500/50 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                indicatorClass = "bg-emerald-500 text-white shadow-lg";
              } else if (isSelected) {
                containerClass = "bg-rose-500/10 border-rose-500/50 text-rose-100";
                indicatorClass = "bg-rose-500 text-white";
              } else {
                containerClass = "opacity-30 grayscale";
              }
            } else if (isSelected) {
               containerClass = "bg-indigo-600 border-indigo-400 text-white shadow-lg";
               indicatorClass = "bg-white text-indigo-600";
            }

            return (
              <button 
                key={idx} 
                onClick={() => handleOptionClick(idx)} 
                disabled={isAnswered} 
                className={`w-full relative group flex items-center p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${containerClass}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-heading font-bold text-xs mr-4 shrink-0 transition-all ${indicatorClass}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 text-sm md:text-base font-medium text-left leading-snug">{option}</span>
                {isAnswered && isCorrect && <Check size={20} className="text-emerald-400 ml-2" />}
                {isAnswered && isSelected && !isCorrect && <X size={20} className="text-rose-400 ml-2" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Footer / Explanation */}
      <div className="relative z-20 px-4 pb-6 pt-2 shrink-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
        {isAnswered && currentQuestion.explanation && (
          <div className="mb-4 glass-panel p-4 rounded-2xl border-l-4 border-l-indigo-500 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">AI Analysis</span>
            </div>
            <p className="text-xs text-indigo-100/80 leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}
        
        <button 
          onClick={handleNext} 
          disabled={!isAnswered} 
          className={`
            w-full h-14 rounded-2xl font-heading font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300
            ${isAnswered 
              ? 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] active:scale-95' 
              : 'bg-white/5 text-white/20 cursor-not-allowed'}
          `}
        >
          {currentIndex === questions.length - 1 ? 'Complete Quiz' : 'Next Challenge'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default QuizPlayer;
