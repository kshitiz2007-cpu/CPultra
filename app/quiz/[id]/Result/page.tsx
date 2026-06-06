'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle, XCircle, Target, 
  Clock, ArrowLeft, BarChart, AlertCircle
} from 'lucide-react';

export default function StudentQuizResult({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResult() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');

      // Notice we are now fetching the new 'responses' column!
      const { data, error } = await supabase
        .from('attempts')
        .select(`
          score,
          created_at,
          responses,
          quizzes (title, category)
        `)
        .eq('quiz_id', params.id)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) setAttempt(data);
      setLoading(false);
    }
    fetchResult();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!attempt) return <div className="p-8 text-center font-bold text-gray-500">No results found.</div>;

  const isPassing = attempt.score >= 50;
  // Parse responses if they exist, otherwise default to empty array
  const responses = attempt.responses || [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2 text-gray-600 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> Dashboard
        </button>
        <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-emerald-200">
          {attempt.quizzes?.category || 'Mock Test'}
        </div>
      </div>

      {/* 2. MAIN SCORE CARD */}
      <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white shadow-xl text-center relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${isPassing ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
        
        <h1 className="text-2xl md:text-3xl font-black text-emerald-950 mb-2 font-serif">
          {attempt.quizzes?.title}
        </h1>
        <p className="text-gray-500 font-medium mb-8 flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" /> Submitted on {new Date(attempt.created_at).toLocaleDateString()}
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-gray-100" strokeWidth="12" fill="none" />
              <circle cx="80" cy="80" r="70" className={`transition-all duration-1000 ${isPassing ? 'stroke-emerald-500' : 'stroke-rose-500'}`} strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * attempt.score) / 100} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-gray-900">{attempt.score}%</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Target className="w-6 h-6" /></div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</div>
                <div className={`text-lg font-black ${isPassing ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isPassing ? 'Qualified' : 'Needs Review'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILED QUESTION REVIEW */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm p-6 md:p-8">
        <h3 className="text-xl font-black text-emerald-950 mb-6 flex items-center gap-2">
          <BarChart className="w-6 h-6 text-emerald-600" /> Question Breakdown
        </h3>
        
        {responses.length === 0 ? (
          <div className="text-center py-10 opacity-60">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h4 className="font-bold text-gray-800">No detailed data available for this attempt.</h4>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Older tests taken before the analytics update only saved the final score. Take a new test to see the detailed breakdown!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((res: any, index: number) => (
              <div key={index} className={`p-5 rounded-2xl border ${res.isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                
                {/* Question Text */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white font-black text-gray-700 shadow-sm border border-gray-200">
                    {index + 1}
                  </span>
                  <p className="font-bold text-gray-900 leading-relaxed pt-1">{res.question}</p>
                </div>

                {/* Answers Comparison */}
                <div className="ml-11 space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0 mt-0.5 w-20">You Chose:</span>
                    <span className={`font-semibold flex items-center gap-2 ${res.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {res.isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {res.selected_answer || 'Skipped / No Answer'}
                    </span>
                  </div>

                  {!res.isCorrect && (
                    <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0 mt-0.5 w-20">Correct:</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        {res.correct_answer}
                      </span>
                    </div>
                  )}

                  {/* Optional Explanation Block */}
                  {res.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 text-blue-900 text-sm rounded-xl border border-blue-100">
                      <span className="font-bold block mb-1">Explanation:</span>
                      {res.explanation}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}