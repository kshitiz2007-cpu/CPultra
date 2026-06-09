'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, TrendingUp, Award, Activity } from 'lucide-react';

interface SubjectMetric {
  subject: string;
  average: number;
}

interface Performer {
  name: string;
  score: number;
}

interface AdminOverviewProps {
  setActiveTab: (tabId: string) => void;
}

export default function AdminOverview({ setActiveTab }: AdminOverviewProps) {
  const [subjects, setSubjects] = useState<SubjectMetric[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveMetrics() {
      try {
        setLoading(true);
        
        // Target your exact table from the SQL editor: 'quiz_attempts'
        const { data, error: dbError } = await supabase
          .from('quiz_attempts')
          .select('student_name, subject, score_percentage');

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          // 1. COMPUTE SUBJECT AVERAGES
          const rawSubjectGroups: { [key: string]: { total: number; count: number } } = {};
          
          data.forEach((row) => {
            if (!rawSubjectGroups[row.subject]) {
              rawSubjectGroups[row.subject] = { total: 0, count: 0 };
            }
            rawSubjectGroups[row.subject].total += row.score_percentage;
            rawSubjectGroups[row.subject].count += 1;
          });

          const calculatedSubjects = Object.keys(rawSubjectGroups).map((sub) => ({
            subject: sub,
            average: Math.round(rawSubjectGroups[sub].total / rawSubjectGroups[sub].count),
          }));
          
          setSubjects(calculatedSubjects);

          // 2. COMPUTE TOP PERFORMERS (Highest score achieved per student)
          const highScoresPerStudent: { [key: string]: number } = {};
          data.forEach((row) => {
            if (!highScoresPerStudent[row.student_name] || row.score_percentage > highScoresPerStudent[row.student_name]) {
              highScoresPerStudent[row.student_name] = row.score_percentage;
            }
          });

          const sortedPerformers = Object.keys(highScoresPerStudent)
            .map((name) => ({
              name,
              score: highScoresPerStudent[name],
            }))
            .sort((a, b) => b.score - a.score) // Highest first
            .slice(0, 3); // Top 3 spots

          setPerformers(sortedPerformers);
        }
      } catch (err: any) {
        console.error('Failed processing dashboard queries:', err);
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
        <p className="text-sm font-medium tracking-wide">Syncing realtime data metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-[2rem] p-6 text-center">
        <p className="font-bold">Database Sync Error</p>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SUBJECT ANALYTICS CARD */}
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
              <p className="text-white/40 text-sm">No quiz attempts logged in database.</p>
            )}
          </div>
        </div>

        {/* TOP PERFORMERS CARD */}
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
              <p className="text-white/40 text-sm">No student leaderboard details available.</p>
            )}
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY BLOCK */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
        </div>
        <p className="text-sm text-white/50">Realtime live system logs and security logs will stream here...</p>
      </div>

    </div>
  );
}