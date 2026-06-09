'use client';

import { Clock, CheckCircle2 } from 'lucide-react';

interface RecordsProps {
  attempts: any[];
}

export default function RecentEvaluationRecords({ attempts }: RecordsProps) {
  const currentAttemptsList = attempts.slice(0, 4);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-2xl w-full">
      <div className="p-6 border-b border-white/5 bg-white/[0.01]">
        <h3 className="font-bold text-lg text-white tracking-tight">Recent Evaluation Records</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-white/[0.01] text-[10px] uppercase tracking-widest text-white/30 font-black border-b border-white/5">
            <tr>
              <th className="px-6 py-4 tracking-wider">Module Parameters</th>
              <th className="px-6 py-4 tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-right tracking-wider">Accuracy Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {currentAttemptsList.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-white/30 text-xs font-semibold tracking-wide">
                  No evaluation records streamed from database array pipeline.
                </td>
              </tr>
            ) : (
              currentAttemptsList.map((row, idx) => {
                const quizHeading = row.quiz_title || 'General Studies Diagnostic Run';
                
                // Identify Hindi text strings to apply precise typography scaling
                const containsHindiScript = /[\u0900-\u097F]/.test(quizHeading);
                const scoreMetric = row.score ?? 0;

                const processedTimestamp = row.completed_at
                  ? new Date(row.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Recent';

                return (
                  <tr key={row.id || idx} className="hover:bg-white/[0.01] transition-colors duration-150">
                    <td className="px-6 py-5">
                      <div className={`text-white tracking-wide ${
                        containsHindiScript 
                          ? 'font-serif font-bold text-white/90 text-base md:text-lg' 
                          : 'font-bold text-xs md:text-sm'
                      }`}>
                        {quizHeading}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-xs text-white/40 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-white/20" /> {processedTimestamp}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {scoreMetric}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}