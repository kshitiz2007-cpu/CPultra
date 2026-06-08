'use client';

import {
  BookOpen,
  Target,
  Flame,
  Trophy,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface StatsCardsProps {
  testsTaken: number;
  averageScore: number;
  streakDays: number;
  rank?: number;
  studyHours?: number;
  improvement?: number;
}

export default function StatsCards({
  testsTaken,
  averageScore,
  streakDays,
  rank = 0,
  studyHours = 0,
  improvement = 0,
}: StatsCardsProps) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">

      <StatCard
        title="Tests Taken"
        value={testsTaken}
        icon={
          <BookOpen className="w-6 h-6 text-emerald-400" />
        }
        color="emerald"
      />

      <StatCard
        title="Avg Score"
        value={`${averageScore}%`}
        icon={
          <Target className="w-6 h-6 text-blue-400" />
        }
        color="blue"
      />

      <StatCard
        title="Day Streak"
        value={streakDays}
        icon={
          <Flame className="w-6 h-6 text-orange-400" />
        }
        color="orange"
      />

      <StatCard
        title="Rank"
        value={rank ? `#${rank}` : '--'}
        icon={
          <Trophy className="w-6 h-6 text-yellow-400" />
        }
        color="yellow"
      />

      <StatCard
        title="Study Hours"
        value={`${studyHours}h`}
        icon={
          <Clock className="w-6 h-6 text-purple-400" />
        }
        color="purple"
      />

      <StatCard
        title="Growth"
        value={`${improvement}%`}
        icon={
          <TrendingUp className="w-6 h-6 text-cyan-400" />
        }
        color="cyan"
      />

    </section>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-1 hover:bg-white/[0.07] transition-all duration-300">

      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

      <div className="relative z-10">

        <div className="mb-5">
          {icon}
        </div>

        <div className="text-3xl md:text-4xl font-black text-white tracking-tight">
          {value}
        </div>

        <div className="mt-2 text-[11px] uppercase tracking-[0.2em] font-bold text-white/50">
          {title}
        </div>

      </div>
    </div>
  );
}