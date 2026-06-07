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

    // Optional: Set up an interval to refresh data every 30 seconds for a truly "live" feel
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Syncing live database...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-serif">Admin Overview</h2>
        <p className="text-sm md:text-base text-gray-500 mt-1">Real-time metrics and recent student activities.</p>
      </header>

      {/* DASHBOARD STATS - Now Clickable & Responsive! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        
        {/* Quizzes Stat Card */}
        <button 
          onClick={() => setActiveTab && setActiveTab('quizzes')}
          className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Active Quizzes</div>
            <FileQuestion className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="text-4xl font-black text-gray-900 mb-1">{stats.quizzes}</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Manage Quizzes <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Students Stat Card */}
        <button 
          onClick={() => setActiveTab && setActiveTab('students')}
          className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 group relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150 -z-10"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider group-hover:text-blue-700 transition-colors">Registered Students</div>
            <Users className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-4xl font-black text-gray-900 mb-1">{stats.students}</div>
          <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View Directory <ChevronRight className="w-3 h-3" />
          </div>
        </button>

        {/* Submissions Stat Card (Spans full width on small mobile, 1 col on larger) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-amber-500 sm:col-span-2 md:col-span-1 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full -z-10"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Submissions</div>
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-4xl font-black text-gray-900">{stats.submissions}</div>
        </div>
      </div>

      {/* LIVE ACTIVITY TRACKING */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <p className="text-xs text-gray-500 font-medium">Latest quiz submissions from your students</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No recent activity found.</p>
              <p className="text-sm mt-1">Student submissions will appear here automatically.</p>
            </div>
          ) : (
            recentActivities.map((activity) => {
              const date = new Date(activity.completed_at);
              const isPassing = activity.score >= 40; // Adjust passing threshold if needed

              return (
                <div key={activity.id} className="p-4 md:p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 font-bold text-gray-600 text-sm">
                      {activity.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {activity.user_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-gray-700">{activity.quiz_title}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:pl-4">
                    <div className="text-left sm:text-right">
                      <p className={`text-lg font-black ${isPassing ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {activity.score}%
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                    </div>
                    
                    <div className="text-right whitespace-nowrap">
                      <p className="text-xs font-semibold text-gray-700">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
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