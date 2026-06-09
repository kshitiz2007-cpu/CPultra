'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface SubjectMetric {
  subject: string;
  average: number;
}

interface Performer {
  name: string;
  score: number;
}

export default function AdminAnalytics() {
  const [subjects, setSubjects] = useState<SubjectMetric[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardMetrics() {
      try {
        setLoading(true);
        
        // Fetch all quiz score rows to aggregate locally
        const { data, error: dbError } = await supabase
          .from('quiz_attempts')
          .select('student_name, subject, score_percentage');

        if (dbError) throw dbError;

        if (data) {
          // --- 1. PROCESS SUBJECT ANALYTICS (Averages) ---
          const subjectGroups: { [key: string]: { total: number; count: number } } = {};
          
          data.forEach((row) => {
            if (!subjectGroups[row.subject]) {
              subjectGroups[row.subject] = { total: 0, count: 0 };
            }
            subjectGroups[row.subject].total += row.score_percentage;
            subjectGroups[row.subject].count += 1;
          });

          const formattedSubjects = Object.keys(subjectGroups).map((sub) => ({
            subject: sub,
            average: Math.round(subjectGroups[sub].total / subjectGroups[sub].count),
          }));
          
          setSubjects(formattedSubjects);

          // --- 2. PROCESS TOP PERFORMERS (Highest Scores) ---
          // Group by student to find their highest overall score achieved
          const studentScores: { [key: string]: number } = {};
          data.forEach((row) => {
            if (!studentScores[row.student_name] || row.score_percentage > studentScores[row.student_name]) {
              studentScores[row.student_name] = row.score_percentage;
            }
          });

          const formattedPerformers = Object.keys(studentScores)
            .map((name) => ({
              name,
              score: studentScores[name],
            }))
            .sort((a, b) => b.score - a.score) // Sort descending
            .slice(0, 3); // Grab top 3

          setPerformers(formattedPerformers);
        }
      } catch (err: any) {
        console.error('Error loading dashboard metrics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Syncing live dashboard metrics...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      
      {/* SUBJECT ANALYTICS CARD */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-cyan-400 text-xl">📊</span>
          <h2 className="text-white font-bold text-lg">Subject Analytics</h2>
        </div>
        
        <div className="space-y-5">
          {subjects.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-300">{item.subject}</span>
                <span className="text-slate-100">{item.average}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${item.average}%` }}
                />
              </div>
            </div>
          ))}
          {subjects.length === 0 && <p className="text-sm text-slate-500">No subject logs available.</p>}
        </div>
      </div>

      {/* TOP PERFORMERS CARD */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-amber-400 text-xl">🏆</span>
          <h2 className="text-white font-bold text-lg">Top Performers</h2>
        </div>

        <div className="space-y-3">
          {performers.map((player, idx) => (
            <div 
              key={idx} 
              className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 transition-all hover:border-slate-700"
            >
              <span className="text-slate-300 font-medium">
                #{idx + 1} {player.name}
              </span>
              <span className="text-emerald-400 font-bold text-lg">
                {player.score}%
              </span>
            </div>
          ))}
          {performers.length === 0 && <p className="text-sm text-slate-500">No score records found yet.</p>}
        </div>
      </div>

    </div>
  );
}