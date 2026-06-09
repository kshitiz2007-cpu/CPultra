'use client';

import { BarChart3 } from 'lucide-react';

interface PerformanceAnalyticsProps {
  attempts: any[];
}

export default function PerformanceAnalytics({ attempts }: PerformanceAnalyticsProps) {
  
  // Dynamic functional accuracy aggregation based on live category matching
  const getMetricsForCategory = (keyword: string) => {
    const relevantAttempts = attempts.filter(attempt => 
      attempt.category?.toLowerCase().includes(keyword.toLowerCase()) ||
      attempt.quiz_title?.toLowerCase().includes(keyword.toLowerCase())
    );

    if (relevantAttempts.length === 0) return 0;

    const totalScore = relevantAttempts.reduce((sum, item) => sum + (item.score || 0), 0);
    return Math.round(totalScore / relevantAttempts.length);
  };

  // Compute live scores or fall back safely to base levels if the student hasn't taken a test yet
  const subjects = [
    { name: 'Polity & Governance', value: getMetricsForCategory('Polity') || 75, color: 'from-emerald-500 to-cyan-500' },
    { name: 'Economic Development', value: getMetricsForCategory('Economy') || 60, color: 'from-blue-500 to-indigo-500' },
    { name: 'History & Culture', value: getMetricsForCategory('History') || 88, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl space-y-6 shadow-xl">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-lg text-white">Subject Accuracy Profiler</h3>
      </div>

      <div className="space-y-4">
        {subjects.map((sub, idx) => (
          <div key={idx} className="space-y-1.5 animate-fade-in">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/70">{sub.name}</span>
              <span className="text-white font-black">{sub.value}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
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