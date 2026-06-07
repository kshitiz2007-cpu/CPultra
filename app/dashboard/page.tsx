'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  PlayCircle, Clock, BookOpen, Award, 
  Sparkles, Loader2, ArrowRight, Layers, 
  FileText, Target, CheckCircle, LogOut, ChevronRight,
  LayoutDashboard, History
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

        // 3. Fetch Platform Totals
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const totalAttempted = attempts.length;
  const averageScore = totalAttempted > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempted) 
    : 0;
  const getAttemptForQuiz = (quizId: string) => attempts.find(a => a.quiz_id === quizId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex selection:bg-emerald-500/30">
      
      {/* ==================================================
          1. GLOWING AURORA BACKGROUND (Behind everything)
      ================================================== */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[25rem] h-[25rem] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>


      {/* ==================================================
          2. DESKTOP GLASS SIDEBAR
      ================================================== */}
      <aside className="hidden md:flex w-72 h-screen flex-col bg-white/[0.02] border-r border-white/10 backdrop-blur-2xl relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        
        {/* Brand/Logo Area */}
        <div className="p-8 pb-6">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 font-serif">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Gyankunj
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-5 py-4 space-y-3">
          {/* Active Tab */}
          <button className="w-full flex items-center gap-4 px-4 py-4 bg-white/10 text-emerald-300 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          {/* Inactive Tabs */}
          <button onClick={() => router.push('/quizzes')} className="w-full flex items-center gap-4 px-4 py-4 text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <Layers className="w-5 h-5 group-hover:text-emerald-300 transition-colors" /> Mock Tests
          </button>
          
          <button onClick={() => router.push('/resources')} className="w-full flex items-center gap-4 px-4 py-4 text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <FileText className="w-5 h-5 group-hover:text-blue-300 transition-colors" /> Study Files
          </button>
          
          <button onClick={() => router.push('/history')} className="w-full flex items-center gap-4 px-4 py-4 text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <History className="w-5 h-5 group-hover:text-amber-300 transition-colors" /> My Results
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-5 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mb-4 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner border border-white/20">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate drop-shadow-sm">{user?.name || 'Student'}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 truncate">Pro Member</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl transition-colors font-bold border border-rose-500/20">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>


      {/* ==================================================
          3. MOBILE FLOATING GLASS DOCK
      ================================================== */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl z-50 flex justify-between px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button className="flex flex-col items-center p-2 text-emerald-300 relative">
          <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
          <LayoutDashboard className="w-6 h-6 mb-1 relative z-10" />
          <span className="text-[10px] font-bold relative z-10">Home</span>
        </button>
        <button onClick={() => router.push('/quizzes')} className="flex flex-col items-center p-2 text-white/50 hover:text-white transition-colors">
          <Layers className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Tests</span>
        </button>
        <button onClick={() => router.push('/resources')} className="flex flex-col items-center p-2 text-white/50 hover:text-white transition-colors">
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Files</span>
        </button>
        <button onClick={() => router.push('/history')} className="flex flex-col items-center p-2 text-white/50 hover:text-white transition-colors">
          <History className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">History</span>
        </button>
      </nav>


      {/* ==================================================
          4. MAIN CONTENT AREA
      ================================================== */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-5 md:p-8 pb-32 md:pb-12 space-y-8 animate-fade-in text-white">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4 md:mt-0">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white/90 drop-shadow-sm font-serif">
                Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar'}! <span className="animate-wave inline-block">👋</span>
              </h1>
              <p className="text-sm md:text-base text-emerald-100/70 mt-2 font-medium tracking-wide">
                Ready to continue your preparation today?
              </p>
            </div>
            {/* Mobile Logout (Desktop is in sidebar) */}
            <button onClick={handleLogout} className="md:hidden w-fit p-3 bg-white/10 text-rose-300 backdrop-blur-md rounded-2xl shadow-lg flex items-center gap-2 border border-white/10 font-bold">
              <LogOut className="w-4 h-4" /> <span className="text-sm">Sign Out</span>
            </button>
          </div>

          {/* Premium Glass Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            {/* Glass Card 1 */}
            <button 
              onClick={() => router.push('/history')}
              className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col justify-between hover:-translate-y-2 hover:bg-white/20 hover:border-emerald-400/50 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform -z-10"></div>
              <div className="flex justify-between items-start w-full mb-4">
                <div className="p-3 bg-white/10 text-emerald-300 rounded-2xl w-fit group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors border border-white/10">
                  <BookOpen className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-300/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <div className="text-4xl font-black text-white drop-shadow-md">{totalAttempted}</div>
                <div className="text-[11px] font-bold text-emerald-100/60 uppercase tracking-[0.2em] mt-2 group-hover:text-emerald-200 transition-colors">Tests Taken</div>
              </div>
            </button>

            {/* Glass Card 2 */}
            <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden">
               <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -z-10"></div>
              <div className="p-3 bg-white/10 text-amber-300 rounded-2xl w-fit mb-4 border border-white/10">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-4xl font-black text-white drop-shadow-md">{averageScore}%</div>
                <div className="text-[11px] font-bold text-amber-100/60 uppercase tracking-[0.2em] mt-2">Avg Score</div>
              </div>
            </div>

            {/* Action Card (Mock Tests) */}
            <button 
              onClick={() => router.push('/quizzes')}
              className="col-span-2 bg-gradient-to-br from-emerald-500/80 to-teal-700/80 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/30 shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] relative overflow-hidden group text-left flex flex-col justify-between hover:scale-[1.02] transition-transform min-h-[180px]"
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors"></div>
              <div className="p-4 bg-white/20 rounded-2xl w-fit backdrop-blur-md mb-2 shadow-inner border border-white/30">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Mock Tests</h3>
                  <p className="text-sm font-medium text-emerald-100/80">Subject-wise mock exams →</p>
                </div>
                <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm group-hover:translate-x-3 transition-transform border border-white/20">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </button>
          </div>

          {/* Latest Quizzes Section */}
          <section className="pt-8">
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-black text-white/90 flex items-center gap-3 tracking-tight">
                  <Sparkles className="w-6 h-6 text-amber-400" /> Newest Test Modules
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {latestQuizzes.length === 0 ? (
                <div className="col-span-2 bg-white/5 backdrop-blur-xl p-12 text-center border-dashed border-2 border-white/20 rounded-[2rem]">
                  <h3 className="text-lg font-bold text-white/70 mb-1">No modules available yet</h3>
                </div>
              ) : (
                latestQuizzes.map((quiz) => {
                  const pastAttempt = getAttemptForQuiz(quiz.id);
                  
                  return (
                    <div key={quiz.id} className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-lg flex flex-col justify-between gap-6 hover:bg-white/15 transition-all group">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-white/10 text-emerald-300 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-white/10">
                            {quiz.category || 'General'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-tight">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400/70" /> {quiz.time_limit}m
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        {pastAttempt ? (
                          <button 
                            onClick={() => router.push(`/quiz/${quiz.id}/result`)}
                            className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                          >
                            Score: {pastAttempt.score}% • Review
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push(`/quiz/${quiz.id}`)}
                            className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                          >
                            <PlayCircle className="w-5 h-5" /> Start Now
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
      </main>
    </div>
  );
}