'use client';

import {
  Sparkles,
  Trophy,
  Flame,
  Target,
  ArrowRight,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

interface HeroSectionProps {
  userName: string;
  testsTaken: number;
  averageScore: number;
  streakDays?: number;
  rank?: number;
  onContinue?: () => void;
}

export default function HeroSection({
  userName,
  testsTaken,
  averageScore,
  streakDays = 0,
  rank = 0,
  onContinue,
}: HeroSectionProps) {
  const progress = Math.min(
    100,
    Math.round((testsTaken / 100) * 100)
  );

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';

    return 'Good Night';
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-6 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">

      {/* Aurora Effects */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

      <div className="relative z-10">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          CivilPrep Premium
        </div>

        {/* Main Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

          <div>
            <p className="text-emerald-300 text-sm font-semibold mb-3 tracking-wide">
              {getGreeting()}
            </p>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Welcome Back,
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                {userName}
              </span>
            </h1>

            <p className="mt-4 text-white/60 max-w-2xl text-base md:text-lg">
              Continue your UPSC preparation journey and move one step
              closer to your dream service.
            </p>
          </div>

          <button
            onClick={onContinue}
            className="group self-start xl:self-center px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition-all duration-300 font-bold text-white flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          >
            Continue Learning
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

        {/* Progress */}
        <div className="mt-10">

          <div className="flex justify-between items-center mb-3">
            <span className="text-white/70 font-semibold">
              Preparation Progress
            </span>

            <span className="text-emerald-300 font-bold">
              {progress}%
            </span>
          </div>

          <div className="h-4 rounded-full bg-white/10 overflow-hidden border border-white/10">

            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-1000"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            <BookOpen className="w-6 h-6 text-emerald-400 mb-3" />
            <div className="text-3xl font-black text-white">
              {testsTaken}
            </div>
            <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">
              Tests Taken
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            <Target className="w-6 h-6 text-blue-400 mb-3" />
            <div className="text-3xl font-black text-white">
              {averageScore}%
            </div>
            <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">
              Average Score
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            <Flame className="w-6 h-6 text-orange-400 mb-3" />
            <div className="text-3xl font-black text-white">
              {streakDays}
            </div>
            <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">
              Day Streak
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
            <Trophy className="w-6 h-6 text-yellow-400 mb-3" />
            <div className="text-3xl font-black text-white">
              {rank ? `#${rank}` : '--'}
            </div>
            <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">
              Rank
            </div>
          </div>

        </div>

        {/* Motivation Strip */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 px-5 py-4">

          <TrendingUp className="w-5 h-5 text-emerald-400" />

          <p className="text-sm md:text-base text-white/80 font-medium">
            Consistency beats intensity. Complete one more mock test today
            to strengthen your preparation momentum.
          </p>

        </div>

      </div>
    </section>
  );
}