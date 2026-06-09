'use client';

import { BarChart3 } from 'lucide-react';

interface AccuracyProps {
  attempts: any[];
}

export default function SubjectAccuracyProfiler({ attempts }: AccuracyProps) {
  
  // Aggregate real-world database accuracy percentage metrics dynamically
  const parseSubjectAccuracy = (targetKeyword: string) => {
    const subset = attempts.filter(item => {
      const matchSource = `${item.category || ''} ${item.quiz_title || ''}`.toLowerCase();
      return matchSource.includes(targetKeyword.toLowerCase());
    });

    if (subset.length === 0) return 0;

    const aggregateScore = subset.reduce((total, run) => total + (run.score || 0), 0);
    return Math.round(aggregateScore / subset.length);
  };

  const polityScore = parseSubjectAccuracy('polity');
  const economyScore = parseSubjectAccuracy('econ');
  const historyScore = parseSubjectAccuracy('history');

  const subjects = [
    { name: 'Polity & Governance', value: polityScore || 0, color: 'from-cyan-500 to-blue-500' },
    { name: 'Economic Development', value: economyScore || 0, color: 'from-indigo-500 to-purple-500' },
    { name: 'History & Culture', value: historyScore || 0, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl space-y-6 shadow-xl w-full">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-lg text-white tracking-tight">Subject Accuracy Profiler</h3>
      </div>

      <div className="space-y-4.5">
        {subjects.map((sub, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold tracking-wide">
              <span className="text-white/60">{sub.name}</span>
              <span className="text-white font-black">{sub.value}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden p-[1px]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${sub.color} transition-all duration-1000 ease-out`}
                style={{ width: `${sub.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}