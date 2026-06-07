'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Library, 
  History, 
  Trophy, 
  LogOut, 
  Loader2, 
  GraduationCap, 
  Target, 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle
} from 'lucide-react';

// Sidebar Tabs
const STUDENT_TABS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quizzes', label: 'Available Quizzes', icon: Library },
  { id: 'history', label: 'My Results', icon: History },
];

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Student Data States
  const [stats, setStats] = useState({ taken: 0, avgScore: 0, highestScore: 0 });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);

  // Authenticate and Fetch Data
  useEffect(() => {
    async function initDashboard() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          window.location.href = '/'; 
          return;
        }

        const userId = session.user.id;
        
        // 1. Get User Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        // If they are an admin, kick them to the admin panel
        if (profile?.role === 'admin' || session.user.email === 'kshitiz2007@gmail.com') {
          window.location.href = '/admin';
          return;
        }

        setUserName(profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student');

        // 2. Fetch Student's Quiz Attempts
        const { data: attempts } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false });

        if (attempts && attempts.length > 0) {
          const totalTaken = attempts.length;
          const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
          const highest = Math.max(...attempts.map(a => a.score));
          
          setStats({
            taken: totalTaken,
            avgScore: Math.round(totalScore / totalTaken),
            highestScore: highest
          });
          setRecentAttempts(attempts.slice(0, 5)); // Grab last 5
        }

        // 3. Fetch Available Quizzes
        const { data: quizzes } = await supabase
          .from('quizzes')
          .select('id, title, category, time_limit')
          .order('created_at', { ascending: false });

        if (quizzes) setAvailableQuizzes(quizzes);

        setLoading(false);

      } catch (err) {
        console.error("Dashboard load failed:", err);
        window.location.href = '/'; 
      }
    }

    initDashboard();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 border-emerald-500 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-gray-50/50">

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-white/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-gray-200 p-4 md:p-6 flex flex-col shrink-0 shadow-sm z-10">
        
        <div className="mb-4 md:mb-10 flex justify-between items-center md:block animate-fade-in">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-950 font-serif tracking-tight">Student Portal</h1>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">Gyankunj Academy</p>
          </div>
          
          <button onClick={handleLogout} className="md:hidden p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-fade-in">
          {STUDENT_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all duration-300 text-sm md:text-base ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                    : 'text-gray-500 hover:bg-white/60 hover:text-emerald-700'
                }`}
              >
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-emerald-300' : ''}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden md:block mt-auto pt-6 border-t border-gray-200 animate-fade-in">
          <div className="text-xs text-emerald-600 mb-3 px-2 truncate font-medium">
            Welcome back,<br/><span className="text-emerald-950 font-bold text-sm">{userName}</span>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden animate-fade-in">
        <div className="max-w-6xl mx-auto w-full">

          {/* ==========================================
              TAB: OVERVIEW
          ========================================== */}
          {activeTab === 'overview' && (
            <>
              <header className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">Hello, {userName}!</h2>
                <p className="text-sm md:text-base text-gray-500 mt-1">Ready to continue your preparation?</p>
              </header>

              {/* STAT CARDS (CLICKABLE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                
                {/* Clickable Tests Taken Card -> Goes to History */}
                <button 
                  onClick={() => setActiveTab('history')}
                  className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 group relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-700 transition-colors">Tests Taken</div>
                    <CheckCircle2 className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-1">{stats.taken}</div>
                  <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    View Results <ChevronRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Non-clickable Average Score Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-500 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full -z-10"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Average Score</div>
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-4xl font-black text-gray-900">{stats.avgScore}%</div>
                </div>

                {/* Clickable Highest Score -> Goes to Quizzes to beat it! */}
                <button 
                  onClick={() => setActiveTab('quizzes')}
                  className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-amber-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-200 group relative overflow-hidden sm:col-span-2 md:col-span-1"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-amber-700 transition-colors">Highest Score</div>
                    <Trophy className="w-5 h-5 text-amber-400 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-1">{stats.highestScore}%</div>
                  <div className="text-xs text-amber-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Take New Quiz <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              </div>

              {/* QUICK ACTION: RECENT ATTEMPTS */}
              <h3 className="text-xl font-bold text-gray-900 font-serif mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-500" /> Recent Activity
              </h3>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {recentAttempts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium">You haven't taken any quizzes yet.</p>
                    <button onClick={() => setActiveTab('quizzes')} className="mt-4 text-emerald-600 font-bold hover:underline">
                      Explore available quizzes
                    </button>
                  </div>
                ) : (
                  recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-gray-900">{attempt.quiz_title}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          {new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className={`px-4 py-1.5 rounded-lg font-black text-lg ${attempt.score >= 40 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                          {attempt.score}%
                        </div>
                        <button 
                          onClick={() => window.location.href = `/quiz/${attempt.quiz_id}/result`}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ==========================================
              TAB: AVAILABLE QUIZZES
          ========================================== */}
          {activeTab === 'quizzes' && (
            <div className="animate-fade-in">
              <header className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif flex items-center gap-2">
                  <Library className="w-6 h-6 text-emerald-500" /> Quiz Library
                </h2>
                <p className="text-sm md:text-base text-gray-500 mt-1">Select a topic and test your knowledge.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableQuizzes.length === 0 ? (
                  <p className="text-gray-500 col-span-full p-8 text-center bg-white rounded-2xl border border-gray-200">
                    No quizzes are currently available. Check back soon!
                  </p>
                ) : (
                  availableQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 bg-emerald-50 inline-block px-2 py-1 rounded-md w-fit">
                        {quiz.category}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight flex-1">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.time_limit} mins</span>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/quiz/${quiz.id}`}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow active:scale-[0.98]"
                      >
                        <PlayCircle className="w-5 h-5" /> Start Quiz
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: MY RESULTS (HISTORY)
          ========================================== */}
          {activeTab === 'history' && (
            <div className="animate-fade-in">
              <header className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif flex items-center gap-2">
                  <History className="w-6 h-6 text-blue-500" /> Detailed History
                </h2>
                <p className="text-sm md:text-base text-gray-500 mt-1">Review your past performance and answers.</p>
              </header>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                {stats.taken === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="font-medium text-lg">Your trophy case is empty!</p>
                    <p className="text-sm mt-2">Take a quiz to start building your history.</p>
                  </div>
                ) : (
                  // Uses the same attempts we fetched for the overview, but we show all of them here (or at least the fetched list)
                  recentAttempts.map((attempt) => (
                    <div key={attempt.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{attempt.quiz_title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
                          <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-emerald-600 font-bold">{attempt.correct} Correct</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-rose-500 font-bold">{attempt.wrong} Wrong</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-center">
                          <p className={`text-2xl font-black ${attempt.score >= 40 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {attempt.score}%
                          </p>
                        </div>
                        <button 
                          onClick={() => window.location.href = `/quiz/${attempt.quiz_id}/result`}
                          className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors flex items-center gap-2"
                        >
                          Review Answers <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}