'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  PlayCircle, Clock, BookOpen, Award, 
  Sparkles, Loader2, ArrowRight, Layers, 
  FileText, Target, CheckCircle, LogOut, ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [latestQuizzes, setLatestQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ quizzes: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/';
          return;
        }
        
        // 1. Fetch User Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (profile) setUser(profile);

        // If they are an admin, kick them to the admin panel
        if (profile?.role === 'admin' || session.user.email === 'kshitiz2007@gmail.com') {
          window.location.href = '/admin';
          return;
        }

        // 2. Fetch Dashboard Content
        const { data: quizzesData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(4);

        const { data: attemptsData } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', session.user.id);

        // 3. Fetch Platform Totals for the Stats Cards
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
          
        const { count: resourceCount } = await supabase
          .from('resources')
          .select('*', { count: 'exact', head: true });

        if (quizzesData) setLatestQuizzes(quizzesData);
        if (attemptsData) setAttempts(attemptsData);
        setPlatformStats({ quizzes: quizCount || 0, resources: resourceCount || 0 });
        
      } catch (error) {
        console.error("Dashboard crashed while loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Derived Stats Calculations
  const totalAttempted = attempts.length;
  const averageScore = totalAttempted > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempted) 
    : 0;

  const getAttemptForQuiz = (quizId: string) => attempts.find(a => a.quiz_id === quizId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 space-y-8 animate-fade-in">
      
      {/* 1. HEADER SECTION WITH LOGOUT */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tight font-serif">
            Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar'}! 👋
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2 font-medium">
            Ready to continue your preparation today?
          </p>
        </div>
        
        {/* NEW LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="p-3 md:px-5 md:py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition-colors shadow-sm flex items-center gap-2 border border-rose-100 font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline text-sm tracking-wide">Sign Out</span>
        </button>
      </div>

      {/* 2. EXPANDED BENTO GRID (NOW INTERACTIVE) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Stat 1: Tests Taken (Clickable -> Goes to History) */}
        <button 
          onClick={() => router.push('/history')}
          className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:shadow-lg hover:border-blue-200 transition-all group text-left w-full relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
          <div className="flex justify-between items-start w-full mb-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-blue-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalAttempted}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 group-hover:text-blue-700 transition-colors">Tests Taken</div>
          </div>
        </button>

        {/* Stat 2: Avg Score (Non-clickable but responsive visually) */}
        <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50/50 rounded-full -z-10"></div>
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl w-fit mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{averageScore}%</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Avg Score</div>
          </div>
        </div>

        {/* Stat 3: Total Available Tests (Clickable -> Goes to Quizzes) */}
        <button 
          onClick={() => router.push('/quizzes')}
          className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:shadow-lg hover:border-emerald-200 transition-all group text-left w-full relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50/50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
          <div className="flex justify-between items-start w-full mb-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Target className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{platformStats.quizzes}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 group-hover:text-emerald-700 transition-colors">Live Modules</div>
          </div>
        </button>

        {/* Stat 4: Total Study Files (Clickable -> Goes to Resources) */}
        <button 
          onClick={() => router.push('/resources')}
          className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:shadow-lg hover:border-purple-200 transition-all group text-left w-full relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50/50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
          <div className="flex justify-between items-start w-full mb-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl w-fit group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <ChevronRight className="w-5 h-5 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{platformStats.resources}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 group-hover:text-purple-700 transition-colors">Study Files</div>
          </div>
        </button>

        {/* Action 1: Mock Tests Explorer */}
        <button 
          onClick={() => router.push('/quizzes')}
          className="col-span-2 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2rem] p-6 border border-emerald-500/50 shadow-xl shadow-emerald-900/20 relative overflow-hidden group text-left flex flex-col justify-between hover:scale-[1.02] transition-transform min-h-[160px]"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          <div className="p-3 bg-white/20 rounded-2xl w-fit backdrop-blur-md mb-2 shadow-sm border border-white/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Mock Tests</h3>
              <p className="text-xs font-medium text-emerald-100">Subject-wise mock exams →</p>
            </div>
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm group-hover:translate-x-2 transition-transform">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>

        {/* Action 2: Study Materials Explorer */}
        <button 
          onClick={() => router.push('/resources')}
          className="col-span-2 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-6 border border-blue-500/50 shadow-xl shadow-blue-900/20 relative overflow-hidden group text-left flex flex-col justify-between hover:scale-[1.02] transition-transform min-h-[160px]"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          <div className="p-3 bg-white/20 rounded-2xl w-fit backdrop-blur-md mb-2 shadow-sm border border-white/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Study Materials</h3>
              <p className="text-xs font-medium text-blue-100">PDFs, Notes, and Links →</p>
            </div>
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm group-hover:translate-x-2 transition-transform">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>

      </div>

      {/* 3. LATEST QUIZZES SECTION */}
      <section className="pt-4">
        <div className="flex items-end justify-between mb-6 px-2">
          <div>
            <h2 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Newest Test Modules
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">The latest practice tests added to the platform.</p>
          </div>
          <button 
            onClick={() => router.push('/quizzes')}
            className="hidden md:flex text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {latestQuizzes.length === 0 ? (
            <div className="col-span-2 glass-card p-12 text-center border-dashed border-2 border-emerald-900/10 rounded-[2rem]">
              <h3 className="text-lg font-bold text-gray-800 mb-1">No modules available yet</h3>
              <p className="text-sm text-gray-500">Check back later for new test series.</p>
            </div>
          ) : (
            latestQuizzes.map((quiz) => {
              const pastAttempt = getAttemptForQuiz(quiz.id);
              
              return (
                <div key={quiz.id} className="bg-white/40 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/60 shadow-sm flex flex-col justify-between gap-4 hover:bg-white/70 transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border border-emerald-200">
                        {quiz.category || 'General'}
                      </span>
                      {pastAttempt && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-emerald-950 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> {quiz.time_limit}m
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/60">
                    {pastAttempt ? (
                      <button 
                        onClick={() => router.push(`/quiz/${quiz.id}/result`)}
                        className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      >
                        Score: {pastAttempt.score}% • Review Answers
                      </button>
                    ) : (
                      <button 
                        onClick={() => router.push(`/quiz/${quiz.id}`)}
                        className="w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-950 hover:bg-emerald-800 text-white transition-colors shadow-sm"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}