
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import QuizPlayer from './components/QuizPlayer';
import { generateQuizQuestions } from './services/gemini';
import { STATIC_PHYSICS_QUESTIONS } from './data/physicsData';
import { STATIC_CHEMISTRY_QUESTIONS } from './data/chemistryData';
import { STATIC_BIOLOGY_QUESTIONS } from './data/biologyData';
import { STATIC_CONSTITUTION_QUESTIONS } from './data/constitutionData';
import { View, Question, QuizResult, LeaderboardEntry } from './types';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Loader2, Atom, Map, Calculator, BookOpen, ChevronLeft, 
  PlayCircle, Scale, Trophy, CheckCircle, History, TrendingUp, 
  Target, Crown, Brain, ChevronRight, User, Settings, FileText, 
  Info, Eye, X, Flame, Download, FlaskConical, Dna
} from 'lucide-react';

const SUBJECTS = [
  { id: 'science', name: 'General Science', sub: 'Physics, Chem, Bio', icon: Atom, accent: 'bg-blue-500', size: 'large' },
  { id: 'india_gk', name: 'India GK', sub: 'History, Const, Geo', icon: Map, accent: 'bg-violet-500', size: 'large' },
  { id: 'maths', name: 'Mathematics', sub: 'Arithmetic & Adv', icon: Calculator, accent: 'bg-emerald-500', size: 'small' },
  { id: 'reasoning', name: 'Reasoning', sub: 'Logic & IQ', icon: Brain, accent: 'bg-orange-500', size: 'small' },
];

const STUDY_NOTES = [
  { title: 'Indian Constitution: Articles 1-51', type: 'PDF', size: '2.4 MB', color: 'bg-blue-500', content: 'Detailed breakdown of Fundamental Rights and DPSP...' },
  { title: 'Biology: Human Digestive System', type: 'PDF', size: '1.8 MB', color: 'bg-rose-500', content: 'Comprehensive notes on enzymes, organs and digestion process...' },
  { title: 'Physics: Newton Laws of Motion', type: 'E-Book', size: '4.1 MB', color: 'bg-violet-500', content: 'In-depth analysis of Inertia, Force and Action-Reaction...' },
  { title: 'Modern History: Revolt of 1857', type: 'PDF', size: '1.1 MB', color: 'bg-amber-500', content: 'Causes, main leaders and impact of the first war of independence...' },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Sanju Pro", xp: 12500 },
  { rank: 2, name: "Aditya K.", xp: 11200 },
  { rank: 3, name: "Rahul S.", xp: 10850 },
  { rank: 4, name: "Priya M.", xp: 9900 },
  { rank: 5, name: "Deepak Y.", xp: 9540 },
];

function App() {
  const [currentView, setView] = useState<View>(View.MOCK_TEST);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'india_gk' | 'science' | null>(null);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [xp, setXp] = useState(() => Number(localStorage.getItem('examship_xp') || 0));
  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    const saved = localStorage.getItem('examship_results');
    return saved ? JSON.parse(saved) : [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Question[] | null>(null);

  useEffect(() => {
    localStorage.setItem('examship_results', JSON.stringify(quizResults));
    localStorage.setItem('examship_xp', xp.toString());
  }, [quizResults, xp]);

  const level = Math.floor(xp / 1000) + 1;
  const progressToNextLevel = (xp % 1000) / 10;
  
  const dailyTargetProgress = useMemo(() => {
    const today = new Date().toDateString();
    const todayTests = quizResults.filter(r => new Date(r.date).toDateString() === today);
    const totalTodayQuestions = todayTests.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    return Math.min(100, (totalTodayQuestions / 50) * 100);
  }, [quizResults]);

  const performanceData = useMemo(() => {
    const data = quizResults.slice(-7).map((r, i) => ({
      name: `T${i + 1}`,
      score: Math.round((r.score / r.totalQuestions) * 100)
    }));
    return data.length > 0 ? data : [{name: '0', score: 0}, {name: 'Now', score: 0}];
  }, [quizResults]);

  // Fix error: Cannot find name 'handleQuizComplete'
  const handleQuizComplete = (result: QuizResult) => {
    const gainedXp = result.score * 10;
    setXp(prev => prev + gainedXp);
    setQuizResults(prev => [result, ...prev]);
    setLastResult(result);
    setView(View.RESULT);
    setActiveQuiz(null);
  };

  const handleSetQuiz = async (setNumber: number) => {
    if (!selectedChapter) return;
    const subj = selectedSubject?.toLowerCase() || '';
    let source: Record<string, Question[]> | null = null;
    
    if (subj.includes('physics')) source = STATIC_PHYSICS_QUESTIONS;
    else if (subj.includes('chemistry')) source = STATIC_CHEMISTRY_QUESTIONS;
    else if (subj.includes('biology')) source = STATIC_BIOLOGY_QUESTIONS;
    else if (subj.includes('constitution')) source = STATIC_CONSTITUTION_QUESTIONS;

    if (source) {
      const key = Object.keys(source).find(k => k.includes(selectedChapter) || selectedChapter.includes(k));
      if (key && source[key]) {
        const q = source[key].slice((setNumber - 1) * 20, setNumber * 20);
        setActiveQuiz(q);
        setView(View.TAKE_QUIZ);
        return;
      }
    }

    setIsGenerating(true);
    try {
      const q = await generateQuizQuestions({ topic: selectedChapter, difficulty: 'Medium', questionCount: 20, setNumber });
      setActiveQuiz(q);
      setView(View.TAKE_QUIZ);
    } catch (e) { 
      alert("AI offline. Local modules loading..."); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const renderDashboard = () => (
    <div className="min-h-screen pb-32 animate-slide-up">
      <div className="px-6 pt-8 pb-4 sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                <User size={24} className="text-white" />
             </div>
             <div>
                <h1 className="text-xl font-heading font-bold text-white tracking-tight">ExamShip Elite</h1>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active Now</span>
                </div>
             </div>
          </div>
          <button onClick={() => setView(View.LEADERBOARD)} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-yellow-400 hover:scale-110 transition-all">
             <Trophy size={20} />
          </button>
        </div>

        <div className="glass-card rounded-[2rem] p-6 border border-white/5 relative overflow-hidden mb-6">
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                    <Crown size={18} className="text-yellow-400" />
                    <span className="text-sm font-heading font-bold text-white">Level {level} Scholar</span>
                 </div>
                 <span className="text-xs font-bold text-indigo-400">{xp} XP</span>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progressToNextLevel}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        <div className="glass-panel p-5 rounded-[2rem] border border-white/5 flex items-center gap-5">
           <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                 <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * dailyTargetProgress) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center"><Flame size={18} className="text-orange-500" /></div>
           </div>
           <div>
              <h4 className="text-sm font-heading font-bold text-white">Daily Target</h4>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Solve 50 Questions Today</p>
              <span className="text-[9px] text-emerald-400 font-bold block mt-1">{Math.round(dailyTargetProgress)}% Complete</span>
           </div>
        </div>

        <div>
           <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-400" /> Growth Graph
           </h3>
           <div className="h-32 w-full glass-panel rounded-[1.5rem] p-2 border border-white/5">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={performanceData}>
                 <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fill="#818cf8" fillOpacity={0.1} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-4 flex items-center gap-2">
             <Target size={14} className="text-emerald-400" /> Choose Subject
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {SUBJECTS.map((sub) => (
              <button key={sub.id} 
                onClick={() => {
                  if (sub.id === 'science' || sub.id === 'india_gk') { setActiveTab(sub.id as any); setView(View.SCIENCE_SELECT); }
                  else { setSelectedSubject(sub.id); setView(View.LEVEL_SELECT); }
                }}
                className={`group rounded-[2rem] p-5 flex flex-col justify-between transition-all glass-panel hover:bg-white/5 active:scale-95 border border-white/5 ${sub.size === 'large' ? 'col-span-2 aspect-[2.5/1]' : 'aspect-square'}`}>
                <div className={`w-10 h-10 rounded-2xl ${sub.accent} flex items-center justify-center text-white shadow-lg`}><sub.icon size={20} /></div>
                <div className="text-left mt-2">
                  <span className="text-white font-heading font-bold text-lg block">{sub.name}</span>
                  <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">{sub.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="min-h-screen pb-32 animate-slide-up px-6 pt-8 bg-[#0f172a]">
       <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView(View.MOCK_TEST)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center"><ChevronLeft size={20}/></button>
          <h2 className="text-lg font-heading font-bold uppercase tracking-widest">Rankings</h2>
          <div className="w-10"></div>
       </div>
       <div className="space-y-3">
          {MOCK_LEADERBOARD.map((user) => (
            <div key={user.rank} className={`glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between ${user.rank === 1 ? 'bg-indigo-500/10 border-indigo-500/20' : ''}`}>
               <div className="flex items-center gap-4">
                  <span className={`w-6 text-xs font-bold ${user.rank <= 3 ? 'text-indigo-400' : 'text-white/20'}`}>{user.rank}</span>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 text-xs font-bold">{user.name[0]}</div>
                  <span className="text-sm font-medium">{user.name}</span>
               </div>
               <span className="text-xs font-bold text-indigo-400">{user.xp} XP</span>
            </div>
          ))}
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/20 flex items-center justify-between mt-6">
             <div className="flex items-center gap-4">
                <span className="w-6 text-xs font-bold text-white">42</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">ME</div>
                <span className="text-sm font-bold">You (Personal)</span>
             </div>
             <span className="text-xs font-bold text-white">{xp} XP</span>
          </div>
       </div>
    </div>
  );

  const renderReview = () => (
    <div className="min-h-screen pb-32 bg-[#0f172a] animate-slide-up">
       <div className="px-6 py-6 flex items-center gap-4 sticky top-0 bg-[#0f172a]/95 backdrop-blur-xl z-50 border-b border-white/5">
          <button onClick={() => setView(View.RESULT)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center"><ChevronLeft size={20}/></button>
          <h2 className="text-lg font-heading font-bold">Review Mode</h2>
       </div>
       <div className="p-6 space-y-6">
          {lastResult?.questions.map((q, i) => (
            <div key={i} className="glass-card p-5 rounded-[1.5rem] border border-white/5">
               <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Question {i+1}</span>
                  {q.userAnswer === q.correctAnswerIndex ? <CheckCircle className="text-emerald-400" size={16}/> : <X className="text-rose-500" size={16}/>}
               </div>
               <p className="text-sm font-medium mb-4 leading-relaxed">{q.text}</p>
               <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === q.correctAnswerIndex;
                    const isUserChoice = idx === q.userAnswer;
                    return (
                      <div key={idx} className={`p-3 rounded-xl text-xs flex items-center justify-between border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : isUserChoice ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-white/5 border-transparent text-white/50'}`}>
                        {opt}
                        {isCorrect && <CheckCircle size={12}/>}
                      </div>
                    );
                  })}
               </div>
               {q.explanation && <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-white/40 italic leading-relaxed">{q.explanation}</div>}
            </div>
          ))}
       </div>
    </div>
  );

  const renderDocViewer = () => (
    <div className="fixed inset-0 bg-[#0f172a] z-[100] animate-zoom-in flex flex-col">
       <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center"><FileText size={20}/></div>
             <h2 className="font-heading font-bold text-sm truncate max-w-[200px]">{activeDoc?.title}</h2>
          </div>
          <button onClick={() => setView(View.STUDY_MATERIAL)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center"><X size={20}/></button>
       </div>
       <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center text-center">
          <div className="glass-card p-10 rounded-[2rem] border border-white/5 max-w-sm">
             <BookOpen size={48} className="text-indigo-400 mx-auto mb-6"/>
             <h1 className="text-2xl font-heading font-bold text-white mb-4">{activeDoc?.title}</h1>
             <p className="text-white/40 text-sm mb-8 leading-loose">{activeDoc?.content}</p>
             <button className="bg-indigo-600 w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"><Download size={16}/> Offline Save</button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="font-sans antialiased bg-[#0f172a] text-white max-w-md mx-auto min-h-screen relative overflow-hidden shadow-2xl">
      <div className="relative z-10">
        {currentView === View.MOCK_TEST && renderDashboard()}
        {currentView === View.LEADERBOARD && renderLeaderboard()}
        {currentView === View.STUDY_MATERIAL && (
          <div className="min-h-screen pb-32 px-6 pt-8 animate-slide-up">
            <h1 className="text-2xl font-heading font-bold text-white mb-8">Vault (Notes)</h1>
            <div className="space-y-4">
              {STUDY_NOTES.map((note, idx) => (
                <div key={idx} className="glass-card p-5 rounded-[1.5rem] border border-white/5 flex items-center justify-between">
                  <div onClick={() => { setActiveDoc(note); setView(View.DOC_VIEWER); }} className="flex items-center gap-4 cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl ${note.color} flex items-center justify-center text-white`}><FileText size={22} /></div>
                    <div><h4 className="font-heading font-bold text-sm">{note.title}</h4><span className="text-[9px] text-white/30 uppercase font-bold">{note.size}</span></div>
                  </div>
                  <button onClick={() => { setActiveDoc(note); setView(View.DOC_VIEWER); }} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"><Eye size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === View.DOC_VIEWER && renderDocViewer()}
        {currentView === View.REVIEW && renderReview()}
        
        {currentView === View.TAKE_QUIZ && activeQuiz && (
          <QuizPlayer questions={activeQuiz} topic={selectedChapter || 'Quiz'} onComplete={handleQuizComplete} onExit={() => setView(View.SET_SELECT)} />
        )}

        {currentView === View.RESULT && lastResult && (
          <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#0f172a] animate-zoom-in">
             <Trophy className="text-yellow-400 mb-4" size={64} />
             <h1 className="text-3xl font-heading font-bold mb-8">Performance Report</h1>
             <div className="w-full glass-card rounded-[2.5rem] p-8 mb-8">
                <span className="text-6xl font-heading font-bold">{Math.round((lastResult.score/lastResult.totalQuestions)*100)}%</span>
                <div className="grid grid-cols-2 gap-4 mt-8">
                   <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                      <p className="text-xl font-bold text-emerald-400">{lastResult.score}</p>
                      <p className="text-[9px] uppercase font-bold">Correct</p>
                   </div>
                   <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                      <p className="text-xl font-bold text-rose-400">{lastResult.totalQuestions - lastResult.score}</p>
                      <p className="text-[9px] uppercase font-bold">Wrong</p>
                   </div>
                </div>
             </div>
             <div className="flex flex-col w-full gap-3">
               <button onClick={() => setView(View.REVIEW)} className="w-full py-4 glass-panel rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"><History size={16}/> Review Errors</button>
               <button onClick={() => setView(View.MOCK_TEST)} className="w-full bg-indigo-600 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30">Back Dashboard</button>
             </div>
          </div>
        )}

        {(currentView === View.SCIENCE_SELECT || currentView === View.LEVEL_SELECT || currentView === View.SET_SELECT) && (
          <div className="min-h-screen flex flex-col animate-slide-up">
             <div className="px-6 py-6 flex items-center gap-4 bg-[#0f172a] border-b border-white/5 sticky top-0 z-30">
                <button onClick={() => setView(currentView === View.SET_SELECT ? View.LEVEL_SELECT : currentView === View.LEVEL_SELECT ? View.SCIENCE_SELECT : View.MOCK_TEST)} className="w-10 h-10 glass-panel rounded-full flex items-center justify-center"><ChevronLeft size={20}/></button>
                <h2 className="text-lg font-heading font-bold uppercase">{currentView === View.SET_SELECT ? 'Sets' : 'Modules'}</h2>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-32">
               {currentView === View.SCIENCE_SELECT ? (
                 (activeTab === 'india_gk' ? [{ id: 'constitution', name: 'Constitution', icon: Scale }, { id: 'history', name: 'History', icon: History }] : [{ id: 'physics', name: 'Physics', icon: Atom }, { id: 'chemistry', name: 'Chemistry', icon: FlaskConical }, { id: 'biology', name: 'Biology', icon: Dna }]).map(cat => (
                  <button key={cat.id} onClick={() => {setSelectedSubject(`${activeTab}_${cat.id}`); setView(View.LEVEL_SELECT);}} className="w-full glass-card p-6 rounded-[2rem] flex items-center gap-6 group border border-white/5">
                     <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><cat.icon size={28}/></div>
                     <div className="text-left flex-1"><h4 className="font-heading font-bold text-white text-xl">{cat.name}</h4><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Select Modules</p></div>
                  </button>
                ))
               ) : currentView === View.SET_SELECT ? [1,2,3,4,5].map(s => (
                 <button key={s} onClick={() => handleSetQuiz(s)} className="w-full glass-panel p-5 rounded-[1.5rem] flex justify-between items-center border border-white/5 active:scale-95 transition-all">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold">SET {s}</div>
                      <div><span className="font-heading font-bold text-white text-base block">Mock Test</span><span className="text-[9px] text-white/30 uppercase">20 MCQ Questions</span></div>
                    </div>
                    <PlayCircle className="text-indigo-400" size={28} />
                 </button>
               )) : (selectedSubject?.includes('physics') ? Object.keys(STATIC_PHYSICS_QUESTIONS) : (selectedSubject?.includes('constitution') ? Object.keys(STATIC_CONSTITUTION_QUESTIONS) : ['Module 1', 'Module 2', 'Adv Revision'])).map((ch, i) => (
                 <button key={i} onClick={() => {setSelectedChapter(ch); setView(View.SET_SELECT);}} className="w-full glass-panel p-5 rounded-[1.5rem] flex justify-between items-center group border border-white/5 active:scale-95">
                    <div className="flex items-center gap-4 text-left"><div className="w-10 h-10 bg-white/5 text-white/40 rounded-full flex items-center justify-center text-sm font-bold">{i+1}</div><span className="font-medium text-white/80 text-sm tracking-wide">{ch}</span></div>
                    <ChevronRight className="text-white/20" size={18} />
                 </button>
               ))}
             </div>
          </div>
        )}

        {currentView !== View.TAKE_QUIZ && currentView !== View.DOC_VIEWER && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
             <Navbar currentView={currentView} setView={setView} />
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 bg-[#0f172a]/95 z-[100] flex flex-col items-center justify-center backdrop-blur-md animate-fade-in">
            <Loader2 className="animate-spin text-indigo-500 mb-6" size={64} />
            <p className="font-heading font-bold text-white text-sm tracking-[0.3em] uppercase animate-pulse">Syncing AI Content...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
