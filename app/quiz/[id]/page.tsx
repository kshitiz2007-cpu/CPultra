'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, Languages, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function QuizPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // SAFE INITIALIZATION
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function initQuiz() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          window.location.href = '/';
          return;
        }
        
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setUser(profile);

        const { data: quizData, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();

        if (error || !quizData) {
          alert('Quiz not found!');
          window.location.href = '/dashboard';
          return;
        }

        setQuiz(quizData);
        setTimeLeft(quizData.time_limit * 60);
        setLoading(false);

      } catch (err) {
        console.error("Critical Quiz Load Error:", err);
        alert("Failed to load the quiz. Redirecting to dashboard.");
        window.location.href = '/dashboard';
      }
    }

    initQuiz();
  }, [quizId]);

  // TIMER LOGIC
  useEffect(() => {
    if (timeLeft <= 0 || loading || submitting) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting]);

  const handleSelectOption = (optIndex: number) => {
    if (!quiz) return;
    const q = quiz.questions[currentQ];
    setAnswers({ ...answers, [q.id]: optIndex });
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    setSubmitting(true);

    try {
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;

      const detailedResponses = quiz.questions.map((q: any) => {
        const selectedIndex = answers[q.id];
        const isCorrect = selectedIndex === q.correct;
        
        if (selectedIndex === undefined) {
          skippedCount++;
        } else if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
        }
        
        return {
          question: q.text,
          selected_answer: selectedIndex !== undefined ? q.options[selectedIndex] : 'Skipped',
          correct_answer: q.options[q.correct],
          isCorrect: isCorrect,
          explanation: q.explanation || null
        };
      });

      const totalQuestions = quiz.questions.length;
      const finalScore = Math.round((correctCount / totalQuestions) * 100);

      const attempt = {
        id: `a_${Date.now()}`,
        user_id: user.id,
        user_name: user.name || user.email || 'Student',
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        quiz_title_hi: quiz.titleHi || '',
        category: quiz.category || 'UPSC',
        score: finalScore,
        correct: correctCount,
        wrong: wrongCount,
        skipped: skippedCount,
        total: totalQuestions,
        details: detailedResponses,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase.from('attempts').insert([attempt]);
      
      if (error) {
        alert(`Database Error: ${error.message}`);
        console.error(error);
        setSubmitting(false);
        return;
      }

      window.location.href = `/quiz/${quiz.id}/result`;

    } catch (err) {
      console.error("Submission crash:", err);
      alert("A critical error occurred while submitting.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!quiz) return null;

  const totalQs = quiz.questions.length;
  const q = quiz.questions[currentQ];
  const progress = Math.round((currentQ / totalQs) * 100);
  
  const isHi = lang === 'hi';
  const hasHi = !!q.textHi;
  const qText = isHi && q.textHi ? q.textHi : q.text;
  const opts = isHi && q.optionsHi && q.optionsHi.length ? q.optionsHi : q.options;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeString = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const isTimeWarning = timeLeft <= 60;

  return (
    <div className="min-h-screen bg-[#020617] relative flex flex-col selection:bg-emerald-500/30 font-sans">
      
      {/* 1. GLOWING AURORA BACKGROUND */}
      <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-3xl mx-auto w-full p-4 md:p-6 pb-24 flex-1 flex flex-col relative z-10">
        
        {/* HEADER: Progress & Timer */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] p-6 mb-6 shadow-lg border border-white/10 animate-fade-in text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-1">{quiz.category}</p>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                Question {currentQ + 1} <span className="text-white/30 font-normal">of {totalQs}</span>
              </h1>
            </div>
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full border shadow-inner font-mono font-bold text-lg ${
              isTimeWarning ? 'border-rose-500/50 text-rose-400 bg-rose-500/10 animate-pulse' : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
            }`}>
              <Clock className="w-5 h-5" />
              <span>{timeString}</span>
            </div>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="flex justify-between text-[11px] font-bold text-white/50 uppercase tracking-widest">
            <span>{currentQ} answered</span>
            <span>{totalQs - currentQ} remaining</span>
          </div>
        </div>

        {/* BILINGUAL TOGGLE */}
        {hasHi && (
          <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-2xl mb-6 backdrop-blur-md animate-fade-in shadow-sm">
            <span className="text-sm font-bold text-white/70 flex items-center gap-2 px-2">
              <Languages className="w-4 h-4 text-emerald-400" /> Language / भाषा
            </span>
            <div className="flex gap-2">
              <button onClick={() => setLang('en')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${lang === 'en' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>EN</button>
              <button onClick={() => setLang('hi')} className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${lang === 'hi' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>हिंदी</button>
            </div>
          </div>
        )}

        {/* QUESTION CARD */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex-1 animate-fade-in mb-6 flex flex-col">
          <h2 className={`text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed tracking-tight ${isHi ? 'font-serif' : ''}`}>
            {qText}
          </h2>
          
          <div className="flex flex-col gap-3 mt-auto">
            {opts.map((opt: string, i: number) => {
              const isSelected = answers[q.id] === i;
              return (
                <div 
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  className={`group flex items-start gap-5 p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-emerald-500/50 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                      : 'border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                    isSelected 
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-inner' 
                      : 'border-white/20 bg-white/5 text-white/50 group-hover:border-emerald-400/50 group-hover:text-emerald-400'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className={`pt-1 text-base md:text-lg font-medium text-white/90 ${isHi ? 'font-serif' : ''}`}>
                    {opt}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* NAVIGATION CONTROLS */}
        <div className="flex gap-4 animate-fade-in">
          {currentQ > 0 && (
            <button onClick={() => setCurrentQ(prev => prev - 1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm">
              <ChevronLeft className="w-5 h-5" /> Prev
            </button>
          )}
          
          {currentQ < totalQs - 1 ? (
            <button 
              onClick={() => {
                if (answers[q.id] === undefined) { alert('Please select an option to continue.'); return; }
                setCurrentQ(prev => prev + 1);
              }}
              className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-bold py-4.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Final Quiz'} <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ABANDON ACTION */}
        <div className="mt-8 text-center pb-8">
          <button 
            onClick={() => { if (confirm('Abandon this quiz? Progress will be lost.')) window.location.href = '/dashboard'; }} 
            className="text-[11px] font-bold text-white/30 hover:text-rose-400 transition-colors uppercase tracking-widest border-b border-transparent hover:border-rose-400 pb-1"
          >
            Abandon Quiz
          </button>
        </div>
      </div>
    </div>
  );
}