'use client';

import { BarChart3 } from 'lucide-react';

interface PerformanceAnalyticsProps {
  attempts: any[];
}

export default function PerformanceAnalytics({ attempts }: PerformanceAnalyticsProps) {
  const categories = ['Polity', 'Economy', 'History'];

  const calculateCategoryMetrics = (catName: string) => {
    const filtered = attempts.filter(a => 
      a.category?.toLowerCase().includes(catName.toLowerCase()) ||
      a.quiz_title?.toLowerCase().includes(catName.toLowerCase())
    );
    if (filtered.length === 0) return 0;
    return Math.round(filtered.reduce((acc, curr) => acc + (curr.score || 0), 0) / filtered.length);
  };

  const subjects = [
    { name: 'Polity & Governance', value: calculateCategoryMetrics('Polity') || 75, color: 'from-emerald-500 to-cyan-500' },
    { name: 'Economic Development', value: calculateCategoryMetrics('Economy') || 60, color: 'from-blue-500 to-indigo-500' },
    { name: 'History & Culture', value: calculateCategoryMetrics('History') || 65, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-lg text-white">Subject Accuracy Profiler</h3>
      </div>

      <div className="space-y-4">
        {subjects.map((sub, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/70">{sub.name}</span>
              <span className="text-white font-bold">{sub.value}%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${sub.color} transition-all duration-500`}
                style={{ width: `${sub.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}