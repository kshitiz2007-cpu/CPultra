'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Activity, Users, BookOpen, Target, 
  Clock, Loader2, Award, TrendingUp 
} from 'lucide-react';

// Helper function to format timestamps into "2 hours ago", "Just now", etc.
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ students: 0, quizzes: 0, attempts: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      // 1. Fetch Global Stats (Counts)
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'admin');
        
      const { count: quizCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true });
        
      const { count: attemptCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true });

      setStats({
        students: studentCount || 0,
        quizzes: quizCount || 0,
        attempts: attemptCount || 0
      });

      // 2. Fetch Recent Activities (Latest Attempts)
      const { data: activities } = await supabase
        .from('attempts')
        .select(`
          id, score, created_at,
          profiles:user_id (name, email),
          quizzes:quiz_id (title)
        `)
        .order('created_at', { ascending: false })
        .limit(8);

      if (activities) setRecentActivity(activities);
      setLoading(false);
    }
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Syncing Platform Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 font-serif tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-emerald-600" /> Platform Overview
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Real-time insights and recent student activities.
          </p>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/80 shadow-sm flex items-center gap-6 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{stats.students}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Students</div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/80 shadow-sm flex items-center gap-6 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{stats.quizzes}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Active Modules</div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/80 shadow-sm flex items-center gap-6 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{stats.attempts}</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Tests Attempted</div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/60 bg-white/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Live Activity Feed
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-1">The latest test submissions from your students.</p>
          </div>
        </div>
        
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">No recent activity found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="flex items-start gap-4 group">
                  <div className="mt-1 relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 flex items-center justify-center border border-emerald-200 z-10 relative">
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    {/* Visual connecting line for the feed */}
                    {index !== recentActivity.length - 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-emerald-100"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 bg-white/50 p-4 rounded-2xl border border-white/80 shadow-sm group-hover:bg-white transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-bold text-gray-900">{activity.profiles?.name || 'A student'}</span> completed{' '}
                          <span className="font-bold text-emerald-800">{activity.quizzes?.title || 'a module'}</span>
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {timeAgo(activity.created_at)}
                        </p>
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-900 uppercase">Score:</span>
                        <span className={`text-sm font-black ${activity.score >= 75 ? 'text-emerald-600' : activity.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {activity.score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}