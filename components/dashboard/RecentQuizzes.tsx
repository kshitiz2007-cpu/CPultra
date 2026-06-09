'use client';

import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RecentQuizzesProps {
  attempts: any[];
}

export default function RecentQuizzes({ attempts }: RecentQuizzesProps) {
  const displayRuns = attempts.slice(0, 4); // Keep top 4 evaluations visible

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-white/5 bg-white/[0.01]">
        <h3 className="font-bold text-lg text-white">Recent Evaluation Records</h3>
      </div>
      <div className="overflow-x-auto">
        {displayRuns.length === 0 ? (
          <div className="p-8 text-center text-white/30 text-xs font-medium">
            No evaluation runs logged inside this database matrix pipeline yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-white/40 font-bold border-b border-white/5">
              <tr>
                <th className="px-6 py-3.5">Module Parameters</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Accuracy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayRuns.map((run) => {
                const isPassing = (run.score || 0) >= 60;
                const formattedDate = run.completed_at 
                  ? new Date(run.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : 'Recent';

                return (
                  <tr key={run.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white line-clamp-1 text-xs md:text-sm">
                        {run.quiz_title || 'Unnamed Diagnostic Block'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-white/50 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-white/30" /> {formattedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isPassing 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {isPassing ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                        {run.score}%
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