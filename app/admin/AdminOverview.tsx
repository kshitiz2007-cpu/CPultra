'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Loader2, 
  Users, 
  BookOpen, 
  Layers, 
  Activity, 
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface AttemptRow {
  id: string | number;
  user_name: string;
  quiz_title: string;
  score_percentage: number;
  created_at?: string;
}

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

interface ChartDataItem {
  day: string;
  'Submissions': number;
  'Avg Score': number;
}

interface AdminOverviewProps {
  setActiveTab: (tabId: string) => void;
}

export default function AdminOverview({ setActiveTab }: AdminOverviewProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data Cache Array
  const [rawAttempts, setRawAttempts] = useState<AttemptRow[]>([]);

  // Derived Real-Time States
  const [registeredStudents, setRegisteredStudents] = useState<number>(0);
  const [activeQuizzes, setActiveQuizzes] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [subjects, setSubjects] = useState<SubjectMetric[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  // 1. Fetch initial dataset
  useEffect(() => {
    async function fetchInitialDashboardMetrics() {
      try {
        setLoading(true);
        setError(null);

        const { data: attemptsData, error: attemptsError } = await supabase
          .from('attempts')
          .select('*');

        if (attemptsError) throw attemptsError;

        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const uniqueFromAttempts = attemptsData ? new Set(attemptsData.map(r => r.user_name || 'Student')) : new Set();
        setRegisteredStudents(studentCount || uniqueFromAttempts.size);

        const { count: quizCount } = await supabase
          .from('quizzes')
          .select('*', { count: 'exact', head: true });
        
        setActiveQuizzes(quizCount || 21); 

        if (attemptsData) {
          setRawAttempts(attemptsData as AttemptRow[]);
        }
      } catch (err: any) {
        console.error('SaaS KPI Initial Sync Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialDashboardMetrics();
  }, []);

  // 2. Recalculate metrics whenever rawAttempts updates
  useEffect(() => {
    if (rawAttempts.length === 0) return;

    setTotalAttempts(rawAttempts.length);

    // Recent Activity Feed
    const latestLogs = rawAttempts.slice(-4).reverse().map(row => ({
      name: row.user_name || 'Unknown Student',
      subject: row.quiz_title || 'General Test',
      score: row.score_percentage ?? 0
    }));
    setRecentActivities(latestLogs);

    // Subject Averages
    const rawSubjectGroups: { [key: string]: { total: number; count: number } } = {};
    rawAttempts.forEach((row) => {
      const currentSubject = row.quiz_title || 'General Test';
      const currentScore = row.score_percentage ?? 0;
      if (!rawSubjectGroups[currentSubject]) {
        rawSubjectGroups[currentSubject] = { total: 0, count: 0 };
      }
      rawSubjectGroups[currentSubject].total += currentScore;
      rawSubjectGroups[currentSubject].count += 1;
    });
    setSubjects(Object.keys(rawSubjectGroups).map(sub => ({
      subject: sub,
      average: Math.round(rawSubjectGroups[sub].total / rawSubjectGroups[sub].count)
    })));

    // Leaderboard High Scores
    const highScoresPerStudent: { [key: string]: number } = {};
    rawAttempts.forEach((row) => {
      const name = row.user_name || 'Unknown Student';
      const score = row.score_percentage ?? 0;
      if (!highScoresPerStudent[name] || score > highScoresPerStudent[name]) {
        highScoresPerStudent[name] = score;
      }
    });
    setPerformers(Object.keys(highScoresPerStudent).map(name => ({
      name,
      score: highScoresPerStudent[name]
    })).sort((a, b) => b.score - a.score).slice(0, 3));

    // Weekly Time Series Matrix Array
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const tempChartMap = daysOfWeek.map(day => ({ day, count: 0, totalScore: 0 }));
    
    rawAttempts.forEach(row => {
      const dateField = row.created_at || new Date().toISOString();
      const dayIndex = new Date(dateField).getDay();
      tempChartMap[dayIndex].count += 1;
      tempChartMap[dayIndex].totalScore += row.score_percentage ?? 0;
    });
    setChartData(tempChartMap.map(item => ({
      day: item.day,
      'Submissions': item.count,
      'Avg Score': item.count > 0 ? Math.round(item.totalScore / item.count) : 0
    })));

  }, [rawAttempts]);

  // 3. Listen live to real-time events
  useEffect(() => {
    const liveChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attempts' },
        (payload) => {
          setRawAttempts((prev) => [...prev, payload.new as AttemptRow]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(liveChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-white/40">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
        <p className="text-xs font-semibold uppercase tracking-widest">Opening Real-Time Sockets Pipeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-3xl p-6 flex items-center gap-3 text-sm">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <div><span className="font-bold">Sync Interrupt:</span> {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-white">
      
      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex justify-between items-start transition-all hover:border-white/20">
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Registered Students</p>
            <h3 className="text-4xl font-black tracking-tight text-white">{registeredStudents}</h3>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Total enrolled learners
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex justify-between items-start transition-all hover:border-white/20">
          <div className="space-y-2">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Active Quizzes</p>
            <h3 className="text-4xl font-black tracking-tight text-white">{activeQuizzes}</h3>
            <p className="text-xs text-cyan-400 font-medium">Published syllabus modules</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex justify-between items-start transition-all hover:border-white/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Attempts</p>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-4xl font-black tracking-tight text-white">{totalAttempts}</h3>
            <p className="text-xs text-purple-400 font-medium">Streaming telemetry live</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* RECHART AREA */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
        <div className="mb-6">
          <h2 className="text-lg font-bold">Activity & Score Velocity</h2>
          <p className="text-xs text-white/40">Real-time time series graph mapping metrics and score distribution shifts</p>
        </div>

        <div className="h-72 w-full text-xs font-medium">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }} />
              <Area type="monotone" dataKey="Submissions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSubmissions)" />
              <Area type="monotone" dataKey="Avg Score" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LOG PANEL */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Recent Activity Ticker</h2>
              <p className="text-xs text-white/40">Live transaction listener running on database channel pipelines</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5 space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((log, index) => (
              <div key={index} className="flex items-center justify-between pt-4 first:pt-0 group animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-emerald-400 border border-white/5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">{log.name}</p>
                    <p className="text-xs text-white/40">Completed quiz under <span className="text-cyan-400 font-medium">{log.subject}</span></p>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    log.score >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {log.score}% Score
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-white/30 text-sm">No activity caught inside the stream logs yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}