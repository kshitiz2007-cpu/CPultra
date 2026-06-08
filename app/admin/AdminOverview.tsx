'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, FileQuestion, CheckCircle2, Activity, Clock, ChevronRight, Loader2 } from 'lucide-react';

export default function AdminOverview({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [stats, setStats] = useState({ quizzes: 0, students: 0, submissions: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Fetch total active quizzes
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true });

        // 2. Fetch total registered students
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        // 3. Fetch total quiz submissions
        const { count: attemptCount } = await supabase
          .from('attempts')
          .select('*', { count: 'exact', head: true });

        setStats({
          quizzes: quizCount || 0,
          students: studentCount || 0,
          submissions: attemptCount || 0,
        });

        // 4. Fetch the 5 most recent activities (attempts)
        const { data: attempts } = await supabase
          .from('attempts')
          .select('id, user_name, quiz_title, score, completed_at')
          .order('completed_at', { ascending: false })
          .limit(5);

        setRecentActivities(attempts || []);

      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();

    // Refresh data every 30 seconds for a truly "live" feel
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse text-white/70">Syncing live database...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-white font-serif tracking-tight drop-shadow-sm">Admin Overview</h2>
        <p className="text-sm md:text-base text-emerald-100/70 mt-2 font-medium tracking-wide">Real-time metrics and recent student activities.</p>
      </header>

      {/* DASHBOARD STATS - Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        
        {/* Quizzes Stat Card */}
        <button 
          onClick={() => setActiveTab && setActiveTab('quizzes')}
          className="text-left bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:bg-white/20 hover:border-emerald-400/50 group relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full transition-transform group-hover:scale-150 blur-2xl -z-10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 text-emerald-300 rounded-2xl w-fit group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors border border-white/10">
              <FileQuestion className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-300/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-4xl font-black text-white drop-shadow-md">{stats.quizzes}</div>
            <div className="text-[11px] font-bold text-emerald-100/60 uppercase tracking-[0.2em] mt-2 group-hover:text-emerald-200 transition-colors">Active Quizzes</div>
          </div>
        </button>

        {/* Students Stat Card */}
        <button 
          onClick={() => setActiveTab && setActiveTab('students')}
          className="text-left bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-lg hover:-translate-y-2 hover:bg-white/20 hover:border-blue-400/50 group relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-400/20 rounded-full transition-transform group-hover:scale-150 blur-2xl -z-10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 text-blue-300 rounded-2xl w-fit group-hover:bg-blue-400 group-hover:text-blue-950 transition-colors border border-white/10">
              <Users className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-blue-300/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <div className="text-4xl font-black text-white drop-shadow-md">{stats.students}</div>
            <div className="text-[11px] font-bold text-blue-100/60 uppercase tracking-[0.2em] mt-2 group-hover:text-blue-200 transition-colors">Registered Students</div>
          </div>
        </button>

        {/* Submissions Stat Card */}
        <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] sm:col-span-2 md:col-span-1 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -z-10"></div>
          <div className="p-3 bg-white/10 text-amber-300 rounded-2xl w-fit mb-4 border border-white/10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-4xl font-black text-white drop-shadow-md">{stats.submissions}</div>
            <div className="text-[11px] font-bold text-amber-100/60 uppercase tracking-[0.2em] mt-2">Total Submissions</div>
          </div>
        </div>
      </div>

      {/* LIVE ACTIVITY TRACKING - Glass Panel */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity</h3>
              <p className="text-xs text-white/50 font-medium">Latest quiz submissions from students</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {recentActivities.length === 0 ? (
            <div className="p-12 text-center text-white/50">
              <Clock className="w-10 h-10 text-white/30 mx-auto mb-4" />
              <p className="font-bold text-lg text-white mb-1">No recent activity found.</p>
              <p className="text-sm">Student submissions will appear here automatically.</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const date = new Date(activity.completed_at);
              const isPassing = activity.score >= 40; // Adjust passing threshold if needed

              return (
                <div key={activity.id} className="p-5 md:p-6 hover:bg-white/5 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                  
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 font-black text-white text-lg shadow-inner group-hover:border-emerald-500/30 transition-colors">
                      {activity.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-white truncate drop-shadow-sm">
                        {activity.user_name}
                      </p>
                      <p className="text-sm text-white/60 truncate flex items-center gap-1 mt-0.5 font-medium">
                        {activity.quiz_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <div className="text-left sm:text-right">
                      <p className={`text-2xl font-black tracking-tight drop-shadow-md ${isPassing ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {activity.score}%
                      </p>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5">Score</p>
                    </div>
                    
                    <div className="text-right whitespace-nowrap bg-white/5 p-3 rounded-xl border border-white/10">
                      <p className="text-sm font-bold text-white/90">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}