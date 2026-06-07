'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { History, Trophy, ChevronRight, ArrowLeft, Loader2, Award } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          window.location.href = '/'; 
          return;
        }

        const { data } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false });

        if (data) {
          setAttempts(data);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 md:p-3 bg-white hover:bg-gray-100 rounded-xl transition-colors shadow-sm border border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950 flex items-center gap-3 font-serif">
            <History className="w-6 h-6 md:w-8 md:h-8 text-blue-500" /> 
            My Test History
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Review your past performance and check your answers.</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white overflow-hidden divide-y divide-gray-100/80">
        {attempts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No tests taken yet!</h3>
            <p className="text-gray-500 text-sm mb-6">Your completed quizzes and scores will appear here.</p>
            <button 
              onClick={() => router.push('/quizzes')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Explore Mock Tests
            </button>
          </div>
        ) : (
          attempts.map((attempt) => {
            const isPassing = attempt.score >= 40; // Adjust threshold if needed
            
            return (
              <div key={attempt.id} className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/80 transition-colors group">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-2xl shrink-0 ${isPassing ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-1">{attempt.quiz_title}</h4>
                    <div className="flex items-center gap-3 mt-1.5 text-sm font-medium text-gray-500">
                      <span>{new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-emerald-600">{attempt.correct} Correct</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-rose-500">{attempt.wrong} Wrong</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full md:w-auto gap-6 md:pl-4 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                  <div className="text-left md:text-right">
                    <p className={`text-3xl font-black tracking-tight ${isPassing ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {attempt.score}%
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/quiz/${attempt.quiz_id}/result`)}
                    className="px-5 py-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold rounded-xl transition-all flex items-center gap-2 group-hover:shadow-md"
                  >
                    Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}