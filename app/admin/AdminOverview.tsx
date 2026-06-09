'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Loader2, 
  TrendingUp, 
  Award, 
  Activity, 
  Users, 
  Layers, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

interface SubjectMetric {
  subject: string;
  average: number;
}

interface Performer {
  name: string;
  score: number;
}

interface RecentActivityItem {
  name: string;
  subject: string;
  score: number;
}

interface AdminOverviewProps {
  setActiveTab: (tabId: string) => void;
}

export default function AdminOverview({ setActiveTab }: AdminOverviewProps) {
  const [subjects, setSubjects] = useState<SubjectMetric[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // New Summary Card States
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [toughestSubject, setToughestSubject] = useState<{ name: string; avg: number } | null>(null);

  useEffect(() => {
    async function fetchLiveMetrics() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: dbError } = await supabase
          .from('attempts')
          .select('*');

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          // Dynamic database column mapping fallback helpers
          const getStudentName = (row: any) => row.student_name || row.user_name || row.email || row.student_id || 'Student';
          const getSubject = (row: any) => row.subject || row.category || row.quiz_title || 'General';
          const getScore = (row: any) => {
            const val = row.score_percentage ?? row.score ?? row.percentage ?? row.marks;
            return typeof val === 'number' ? val : parseInt(val) || 0;
          };

          // 1. STATS OVERVIEW COMPUTATIONS
          setTotalAttempts(data.length);

          const uniqueStudents = new Set(data.map(row => getStudentName(row)));
          setTotalStudents(uniqueStudents.size);

          // 2. COMPUTE SUBJECT AVERAGES & TOUGHEST SUBJECT
          const rawSubjectGroups: { [key: string]: { total: number; count: number } } = {};
          
          data.forEach((row) => {
            const currentSubject = getSubject(row);
            const currentScore = getScore(row);

            if (!rawSubjectGroups[currentSubject]) {
              rawSubjectGroups[currentSubject] = { total: 0, count: 0 };
            }
            rawSubjectGroups[currentSubject].total += currentScore;
            rawSubjectGroups[currentSubject].count += 1;
          });

          const calculatedSubjects = Object.keys(rawSubjectGroups).map((sub) => ({
            subject: sub,
            average: Math.round(rawSubjectGroups[sub].total / rawSubjectGroups[sub].count),
          }));
          
          setSubjects(calculatedSubjects);

          // Find lowest average subject
          if (calculatedSubjects.length > 0) {
            const sortedByLowest = [...calculatedSubjects].sort((a, b) => a.average - b.average);
            setToughestSubject({ name: sortedByLowest[0].subject, avg: sortedByLowest[0].average });
          }

          // 3. COMPUTE TOP PERFORMERS
          const highScoresPerStudent: { [key: string]: number } = {};
          data.forEach((row) => {
            const studentName = getStudentName(row);
            const currentScore = getScore(row);

            if (!highScoresPerStudent[studentName] || currentScore > highScoresPerStudent[studentName]) {
              highScoresPerStudent[studentName] = currentScore;
            }
          });

          const sortedPerformers = Object.keys(highScoresPerStudent)
            .map((name) => ({
              name,
              score: highScoresPerStudent[name],
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

          setPerformers(sortedPerformers);

          // 4. MAP REAL RECENT ACTIVITY LOGS (Last 4 row entries)
          const latestLogs = data.slice(-4).reverse().map(row => ({
            name: getStudentName(row),
            subject: getSubject(row),
            score: getScore(row)
          }));
          setRecentActivities(latestLogs);
        }
      } catch (err: any) {
        console.error('Failed processing administrative data dashboards:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center text-white/50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-medium tracking-wide">Assembling dynamic metrics engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-[2rem] p-6 text-center">
        <p className="font-bold">Database Synchronize Failure</p>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* NEW HEADER METRIC HIGHLIGHT ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Total Quiz Submissions</p>
            <p className="text-3xl font-black text-white mt-1">{totalAttempts}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Active Student Base</p>
            <p className="text-3xl font-black text-white mt-1">{totalStudents}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Critical Weak Spot</p>
            <p className="text-lg font-bold text-rose-400 mt-1.5 truncate max-w-[180px]">
              {toughestSubject ? `${toughestSubject.name} (${toughestSubject.avg}%)` : 'None'}
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* CORE GRAPHICAL ANALYTICS COLUMN ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SUBJECT ANALYTICS */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Subject Analytics</h2>
          </div>

          <div className="space-y-6">
            {subjects.length > 0 ? (
              subjects.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/70 font-semibold tracking-wide">{item.subject}</span>
                    <span className="text-cyan-400 font-bold">{item.average}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${item.average}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/40 text-sm">No attempts records currently available.</p>
            )}
          </div>
        </div>

        {/* TOP PERFORMERS LEADERBOARD */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Top Performers</h2>
          </div>

          <div className="space-y-4">
            {performers.length > 0 ? (
              performers.map((player, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-300 hover:border-white/10 group"
                >
                  <span className="text-white/80 font-medium tracking-wide flex items-center gap-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                      'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                    }`}>
                      #{idx + 1}
                    </span>
                    {player.name}
                  </span>
                  <span className="text-emerald-400 font-black text-xl group-hover:scale-105 transition-transform duration-300">
                    {player.score}%
                  </span>
                </div>
              ))
            ) : (
              <p className="text-white/40 text-sm">No student ranking logs available.</p>
            )}
          </div>
        </div>

      </div>

      {/* REPLACED RECENT ACTIVITY STREAM */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Recent Activity Stream</h2>
        </div>

        <div className="divide-y divide-white/5 space-y-3.5">
          {recentActivities.length > 0 ? (
            recentActivities.map((log, index) => (
              <div key={index} className="flex items-center justify-between pt-3.5 first:pt-0 group">
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{log.name}</p>
                    <p className="text-xs text-white/40">Completed quiz module under <span className="text-cyan-400/80">{log.subject}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    log.score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                    log.score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  }`}>
                    {log.score}% Verified
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/40 text-sm">No recent quiz submissions incoming.</p>
          )}
        </div>
      </div>

    </div>
  );
}