'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trophy, CheckCircle2, XCircle, MinusCircle, Home, RotateCcw, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function QuizResultPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/';
          return;
        }

        const { data, error } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('quiz_id', quizId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (error || !data) {
          console.error("Could not fetch result:", error);
        } else {
          setAttempt(data);
        }
      } catch (err) {
        console.error("Error loading result:", err);
      } finally {
        setLoading(false); 
      }
    }

    fetchResult();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[#020617]">
        <h1 className="text-2xl font-bold text-white mb-2">Result not found</h1>
        <p className="text-white/50 mb-6">We couldn't load your quiz result.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition-colors">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const isPassing = attempt.score >= 40; 

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex flex-col selection:bg-emerald-500/30">
      
      {/* 1. GLOWING AURORA BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[25rem] h-[25rem] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto relative z-10 w-full">
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 animate-fade-in text-white">
          
          {/* HEADER & SCORE CARD (Glass Panel) */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 mb-8 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isPassing ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-rose-500'}`}></div>
            
            <div className="flex justify-start mb-4">
              <button onClick={() => router.push('/dashboard')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center border-2 ${isPassing ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <Trophy className="w-12 h-12" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white font-serif mb-2 tracking-tight drop-shadow-sm">
              {attempt.quiz_title}
            </h1>
            <p className="text-white/50 font-medium mb-10 text-lg">Quiz completed successfully!</p>

            <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 md:p-6 md:min-w-[140px] col-span-2 md:col-span-1 shadow-inner">
                <div className="text-5xl font-black text-emerald-400 mb-1 drop-shadow-md">{attempt.score}%</div>
                <div className="text-xs font-bold text-emerald-300/60 uppercase tracking-[0.2em]">Final Score</div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 md:p-6 min-w-[120px] shadow-inner">
                <div className="text-3xl font-black text-blue-400 mb-1">{attempt.correct}</div>
                <div className="text-xs font-bold text-blue-300/60 uppercase tracking-[0.2em]">Correct</div>
              </div>

              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 md:p-6 min-w-[120px] shadow-inner">
                <div className="text-3xl font-black text-rose-400 mb-1">{attempt.wrong}</div>
                <div className="text-xs font-bold text-rose-300/60 uppercase tracking-[0.2em]">Wrong</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 min-w-[120px] shadow-inner">
                <div className="text-3xl font-black text-white/70 mb-1">{attempt.skipped}</div>
                <div className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Skipped</div>
              </div>
            </div>
          </div>

          {/* DETAILED ANALYSIS */}
          <h2 className="text-2xl font-black text-white/90 font-serif mb-6 flex items-center gap-3">
            Detailed Review <ChevronRight className="w-5 h-5 text-emerald-400" />
          </h2>

          <div className="space-y-5">
            {attempt.details && attempt.details.map((item: any, index: number) => {
              
              let statusColor = "bg-white/5 border-white/10";
              let Icon = MinusCircle;
              let iconColor = "text-white/30";
              let ansBg = "bg-white/5 border-white/10 text-white/70";
              
              if (item.isCorrect) {
                statusColor = "bg-emerald-500/10 border-emerald-500/20";
                Icon = CheckCircle2;
                iconColor = "text-emerald-400";
                ansBg = "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
              } else if (item.selected_answer !== 'Skipped') {
                statusColor = "bg-rose-500/10 border-rose-500/20";
                Icon = XCircle;
                iconColor = "text-rose-400";
                ansBg = "bg-rose-500/20 border-rose-500/30 text-rose-300";
              }

              return (
                <div key={index} className={`p-5 md:p-6 rounded-3xl backdrop-blur-md border ${statusColor} shadow-lg transition-all`}>
                  <div className="flex gap-4 items-start">
                    <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${iconColor}`} />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-5 leading-relaxed">{item.question}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        
                        {/* Student's Answer */}
                        <div className={`p-4 rounded-2xl border ${ansBg} shadow-inner`}>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] block mb-1.5 opacity-70">Your Answer</span>
                          <span className="font-semibold text-base">
                            {item.selected_answer}
                          </span>
                        </div>
                        
                        {/* Correct Answer (Only shows if student was wrong/skipped) */}
                        {!item.isCorrect && (
                          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                            <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.2em] block mb-1.5">Correct Answer</span>
                            <span className="font-semibold text-emerald-300 text-base">
                              {item.correct_answer}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Explanation Box */}
                      {item.explanation && (
                        <div className="mt-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-sm text-blue-200">
                          <span className="font-bold text-blue-300 block mb-1">Explanation:</span>
                          {item.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Home className="w-5 h-5" /> Back to Dashboard
            </button>
            <button 
              onClick={() => window.location.href = `/quiz/${quizId}`}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <RotateCcw className="w-5 h-5" /> Retake Quiz
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}