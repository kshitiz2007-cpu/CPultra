'use client';

import { FileCheck, Hourglass, BarChart3, Award } from 'lucide-react';

interface StatsCardsProps {
  attempts: any[];
  profile: any;
}

export default function StatsCards({ attempts, profile }: StatsCardsProps) {
  // Aggregate real-time statistics out of live attempt feeds
  const totalAttempted = attempts.length;
  
  const averageAccuracy = totalAttempted > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalAttempted)
    : 0;

  // Derive simple approximation proxy for estimation metrics
  const estimatedHours = Math.round(totalAttempted * 0.7); 

  const cardConfig = [
    { label: 'Modules Cleared', value: totalAttempted, subtitle: 'Active evaluation runs', icon: FileCheck, color: 'text-emerald-400' },
    { label: 'Execution Time', value: `${estimatedHours}h`, subtitle: 'High-intent analytics focus', icon: Hourglass, color: 'text-blue-400' },
    { label: 'Average Accuracy', value: `${averageAccuracy}%`, subtitle: 'Target threshold target 80%', icon: BarChart3, color: 'text-amber-400' },
    { label: 'Platform Ranking', value: profile?.global_rank || '#1,422', subtitle: 'Live mock baseline index', icon: Award, color: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {cardConfig.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05] hover:border-white/20 shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                {card.label}
              </span>
              <div className="rounded-xl bg-white/5 p-2.5 group-hover:bg-white/10 transition-colors">
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="text-3xl font-black tracking-tight text-white">
                {card.value}
              </div>
              <p className="text-xs text-white/40 font-medium">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}