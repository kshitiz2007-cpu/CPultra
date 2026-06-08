'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  FileQuestion,
  CheckCircle2,
  Activity,
  Clock,
  ChevronRight,
  Loader2,
  Sparkles,
  Trophy,
  BarChart3
} from 'lucide-react';

export default function AdminOverview({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) {
  const [stats, setStats] = useState({
    quizzes: 0,
    students: 0,
    submissions: 0,
    aiGenerated: 148,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true });

        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student');

        const { count: attemptCount } = await supabase
          .from('attempts')
          .select('*', { count: 'exact', head: true });

        const { data: attempts } = await supabase
          .from('attempts')
          .select('id,user_name,quiz_title,score,completed_at')
          .order('completed_at', { ascending: false })
          .limit(5);

        setStats({
          quizzes: quizCount || 0,
          students: studentCount || 0,
          submissions: attemptCount || 0,
          aiGenerated: 148,
        });

        setRecentActivities(attempts || []);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  const subjectData = [
    { name: 'Polity', value: 84 },
    { name: 'History', value: 72 },
    { name: 'Economy', value: 91 },
    { name: 'Geography', value: 77 },
  ];

  const leaders = [
    { name: 'Rahul', score: 94 },
    { name: 'Ananya', score: 92 },
    { name: 'Kshitiz', score: 91 },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-black text-white">
          Welcome Back, Admin
        </h1>
        <p className="text-white/60 mt-2">
          CivilPrep Analytics Center
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <button
          onClick={() => setActiveTab('quizzes')}
          className="text-left bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:-translate-y-1 transition-all"
        >
          <FileQuestion className="w-7 h-7 text-emerald-400 mb-4" />
          <div className="text-4xl font-black text-white">{stats.quizzes}</div>
          <div className="text-white/50 mt-2">Active Quizzes</div>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className="text-left bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:-translate-y-1 transition-all"
        >
          <Users className="w-7 h-7 text-blue-400 mb-4" />
          <div className="text-4xl font-black text-white">{stats.students}</div>
          <div className="text-white/50 mt-2">Students</div>
        </button>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <CheckCircle2 className="w-7 h-7 text-amber-400 mb-4" />
          <div className="text-4xl font-black text-white">{stats.submissions}</div>
          <div className="text-white/50 mt-2">Submissions</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <Sparkles className="w-7 h-7 text-purple-400 mb-4" />
          <div className="text-4xl font-black text-white">{stats.aiGenerated}</div>
          <div className="text-white/50 mt-2">AI Generated</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-xl text-white">Subject Analytics</h3>
          </div>

          <div className="space-y-5">
            {subjectData.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between mb-2 text-sm">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>

                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-xl text-white">Top Performers</h3>
          </div>

          <div className="space-y-4">
            {leaders.map((leader, index) => (
              <div
                key={leader.name}
                className="flex items-center justify-between bg-white/5 rounded-xl p-4"
              >
                <div>
                  #{index + 1} {leader.name}
                </div>
                <div className="font-bold text-emerald-400">
                  {leader.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-xl font-bold">Recent Activity</h3>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-10 text-center text-white/50">
            <Clock className="w-8 h-8 mx-auto mb-3" />
            No recent activity.
          </div>
        ) : (
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-5 border-b border-white/5 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{activity.user_name}</div>
                <div className="text-sm text-white/50">
                  {activity.quiz_title}
                </div>
              </div>

              <div className="font-black text-emerald-400">
                {activity.score}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
