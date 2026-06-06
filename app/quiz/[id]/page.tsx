'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, Languages } from 'lucide-react';

// 1. Normal, safe import! (No more Webpack minification bugs)
import { getSupabase } from '@/lib/supabaseClient';

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

  // BUILD-SAFE INITIALIZATION WITH SAFETY NET
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function initQuiz() {
      try {
        const supabase = getSupabase();

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

  // THE FULL DATABASE SUBMISSION
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

      const supabase = getSupabase();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
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
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 min-h-screen flex flex-col">
      <div className="glass-card p-5 mb-6 animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{quiz.category}</p>
            <h1 className="text-xl md:text-2xl font-bold text-emerald-950 font-serif">
              Question {currentQ + 1} of {totalQs}
            </h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-mono font-bold shadow-sm ${
            isTimeWarning ? 'border-red-400 text-red-600 bg-red-50 animate-pulse' : 'border-emerald-200 text-emerald-800 bg-emerald-50'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{timeString}</span>
          </div>
        </div>

        <div className="w-full bg-gray-200/50 rounded-full h-2.5 mb-2 overflow-hidden">
          <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between text-xs font-semibold text-gray-500">
          <span>{currentQ} answered</span>
          <span>{totalQs - currentQ} remaining</span>
        </div>
      </div>

      {hasHi && (
        <div className="flex items-center justify-between bg-orange-50/80 border border-orange-200 p-3 rounded-xl mb-4 backdrop-blur-sm animate-fade-in">
          <span className="text-sm font-semibold text-orange-800 flex items-center gap-2">
            <Languages className="w-4 h-4" /> Language / भाषा
          </span>
          <div className="flex gap-2">
            <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-700/60 hover:bg-orange-100/50'}`}>EN</button>
            <button onClick={() => setLang('hi')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${lang === 'hi' ? 'bg-white text-orange-600 shadow-sm' : 'text-orange-700/60 hover:bg-orange-100/50'}`}>हिंदी</button>
          </div>
        </div>
      )}

      <div className="glass-card p-6 md:p-8 flex-1 animate-fade-in mb-6">
        <h2 className={`text-lg md:text-xl font-medium text-gray-900 mb-8 leading-relaxed ${isHi ? 'font-serif' : ''}`}>
          {qText}
        </h2>
        <div className="flex flex-col gap-3">
          {opts.map((opt: string, i: number) => {
            const isSelected = answers[q.id] === i;
            return (
              <div 
                key={i}
                onClick={() => handleSelectOption(i)}
                className={`group flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                    : 'border-white/60 bg-white/40 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border-2 text-sm font-bold transition-colors ${
                  isSelected 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-gray-300 text-gray-500 group-hover:border-emerald-400 group-hover:text-emerald-600'
                }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <div className={`pt-1 text-base text-gray-800 ${isHi ? 'font-serif' : ''}`}>
                  {opt}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 animate-fade-in">
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(prev => prev - 1)} className="flex-1 bg-white/60 hover:bg-white border-2 border-emerald-100 text-emerald-800 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" /> Prev
          </button>
        )}
        
        {currentQ < totalQs - 1 ? (
          <button 
            onClick={() => {
              if (answers[q.id] === undefined) { alert('Please select an option to continue.'); return; }
              setCurrentQ(prev => prev + 1);
            }}
            className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Next <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'} <CheckCircle2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <button onClick={() => { if (confirm('Abandon this quiz? Progress will be lost.')) window.location.href = '/dashboard'; }} className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider">
          Abandon Quiz
        </button>
      </div>
    </div>
  );
}