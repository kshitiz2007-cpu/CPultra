'use client';

import { Clock, CheckCircle2 } from 'lucide-react';

interface RecentQuizzesProps {
  attempts: any[];
}

export default function RecentQuizzes({ attempts }: RecentQuizzesProps) {
  const targetHistorySlice = attempts.slice(0, 4);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 bg-white/[0.01]">
        <h3 className="font-bold text-lg text-white">Recent Evaluation Records</h3>
      </div>
      <div className="overflow-x-auto">
        {targetHistorySlice.length === 0 ? (
          <div className="p-12 text-center text-white/30 text-xs font-medium">
            No completed diagnostic evaluation runs detected for this account profile.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-white/40 font-bold border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Module Parameters</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Accuracy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {targetHistorySlice.map((run, i) => {
                const accuracy = run.score || 0;
                
                // Format completion timestamp strings beautifully
                const timestampFormatted = run.completed_at
                  ? new Date(run.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Recent';

                return (
                  <tr key={run.id || i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white tracking-wide text-xs md:text-sm">
                        {run.quiz_title || 'Unnamed Diagnostic Block'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-white/40 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-white/20" /> {timestampFormatted}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {accuracy}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}