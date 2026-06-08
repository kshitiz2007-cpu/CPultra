'use client';

import {
  Trophy,
  Medal,
  TrendingUp,
  Crown,
  Sparkles,
} from 'lucide-react';

interface LeaderboardHeroProps {
  userRank: number;
  averageScore: number;
  totalTests: number;
  percentile?: number;
}

export default function LeaderboardHero({
  userRank,
  averageScore,
  totalTests,
  percentile = 0,
}: LeaderboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-3xl p-6 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">

      {/* Aurora Background */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-500/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10">

        {/* Premium Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-bold mb-6">
          <Sparkles className="w-4 h-4" />
          CivilPrep Rankings
        </div>

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">

          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Leaderboard
            </h1>

            <p className="mt-3 text-white/60 text-base md:text-lg max-w-2xl">
              Track your rank, compare your performance,
              and compete with aspirants across India.
            </p>
          </div>

          {/* Rank Card */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20 rounded-[1.75rem] px-8 py-6 min-w-[220px]">

            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-6 h-6 text-yellow-400" />

              <span className="text-yellow-300 font-semibold">
                Your Rank
              </span>
            </div>

            <div className="text-5xl font-black text-white">
              #{userRank}
            </div>

          </div>

        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-3 gap-5 mt-10">

          {/* Average Score */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <TargetIcon />

            <div className="mt-4 text-4xl font-black text-white">
              {averageScore}%
            </div>

            <div className="text-white/50 mt-2 text-sm">
              Average Score
            </div>

          </div>

          {/* Tests Taken */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <Medal className="w-7 h-7 text-blue-400" />

            <div className="mt-4 text-4xl font-black text-white">
              {totalTests}
            </div>

            <div className="text-white/50 mt-2 text-sm">
              Tests Attempted
            </div>

          </div>

          {/* Percentile */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <TrendingUp className="w-7 h-7 text-emerald-400" />

            <div className="mt-4 text-4xl font-black text-white">
              {percentile}%
            </div>

            <div className="text-white/50 mt-2 text-sm">
              Percentile
            </div>

          </div>

        </div>

        {/* Motivation Banner */}
        <div className="mt-8 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-5 py-4">

          <div className="flex items-center gap-3">

            <Trophy className="w-5 h-5 text-yellow-400" />

            <p className="text-white/80 font-medium">
              Every mock test improves your ranking.
              Stay consistent and climb the leaderboard.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}

function TargetIcon() {
  return (
    <Trophy className="w-7 h-7 text-purple-400" />
  );
}