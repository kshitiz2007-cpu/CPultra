'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Trophy, CheckCircle2, XCircle, MinusCircle, Home, RotateCcw, ChevronRight } from 'lucide-react';

// NORMAL, SAFE IMPORT (Just like we did on the quiz page)
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
        // 1. Get User
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/';
          return;
        }

        // 2. Fetch the most recent attempt for this specific quiz by this user
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
        // This ensures the spinner ALWAYS stops, even if there's an error
        setLoading(false); 
      }
    }

    fetchResult();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Result not found</h1>
        <p className="text-gray-500 mb-6">We couldn't load your quiz result.</p>
        <button onClick={() => window.location.href = '/dashboard'} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const isPassing = attempt.score >= 40; // Assuming 40% is passing

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 animate-fade-in">
      
      {/* HEADER & SCORE CARD */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-gray-100 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
        
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${isPassing ? 'text-amber-500' : 'text-gray-400'}`} />
        
        <h1 className="text-3xl md:text-4xl font-black text-emerald-950 font-serif mb-2">
          {attempt.quiz_title}
        </h1>
        <p className="text-gray-500 font-medium mb-8">Quiz completed successfully!</p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <div className="bg-emerald-50 rounded-2xl p-4 md:p-6 min-w-[120px]">
            <div className="text-4xl font-black text-emerald-700 mb-1">{attempt.score}%</div>
            <div className="text-xs font-bold text-emerald-900/60 uppercase tracking-wider">Final Score</div>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-4 md:p-6 min-w-[100px]">
            <div className="text-3xl font-black text-blue-700 mb-1">{attempt.correct}</div>
            <div className="text-xs font-bold text-blue-900/60 uppercase tracking-wider">Correct</div>
          </div>

          <div className="bg-rose-50 rounded-2xl p-4 md:p-6 min-w-[100px]">
            <div className="text-3xl font-black text-rose-700 mb-1">{attempt.wrong}</div>
            <div className="text-xs font-bold text-rose-900/60 uppercase tracking-wider">Wrong</div>
          </div>

          <div className="bg-gray-100 rounded-2xl p-4 md:p-6 min-w-[100px]">
            <div className="text-3xl font-black text-gray-700 mb-1">{attempt.skipped}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Skipped</div>
          </div>
        </div>
      </div>

      {/* DETAILED ANALYSIS */}
      <h2 className="text-2xl font-bold text-emerald-950 font-serif mb-6 flex items-center gap-2">
        Detailed Review <ChevronRight className="w-5 h-5 text-emerald-500" />
      </h2>

      <div className="space-y-4">
        {attempt.details && attempt.details.map((item: any, index: number) => {
          
          let statusColor = "bg-gray-50 border-gray-200";
          let Icon = MinusCircle;
          let iconColor = "text-gray-400";
          
          if (item.isCorrect) {
            statusColor = "bg-emerald-50/50 border-emerald-200";
            Icon = CheckCircle2;
            iconColor = "text-emerald-500";
          } else if (item.selected_answer !== 'Skipped') {
            statusColor = "bg-rose-50/50 border-rose-200";
            Icon = XCircle;
            iconColor = "text-rose-500";
          }

          return (
            <div key={index} className={`p-5 md:p-6 rounded-2xl border-2 transition-all ${statusColor}`}>
              <div className="flex gap-4 items-start">
                <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${iconColor}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{item.question}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Your Answer</span>
                      <span className={`font-semibold ${item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {item.selected_answer}
                      </span>
                    </div>
                    
                    {!item.isCorrect && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                        <span className="text-xs font-bold text-emerald-600/70 uppercase block mb-1">Correct Answer</span>
                        <span className="font-semibold text-emerald-800">
                          {item.correct_answer}
                        </span>
                      </div>
                    )}
                  </div>

                  {item.explanation && (
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-blue-900">
                      <span className="font-bold block mb-1">Explanation:</span>
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
      <div className="mt-10 flex gap-4">
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="flex-1 bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-500 hover:text-emerald-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Home className="w-5 h-5" /> Dashboard
        </button>
        <button 
          onClick={() => window.location.href = `/quiz/${quizId}`}
          className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <RotateCcw className="w-5 h-5" /> Retake Quiz
        </button>
      </div>

    </div>
  );
}
