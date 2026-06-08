'use client';

import {
  Crown,
  Medal,
  Trophy,
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  testsTaken: number;
}

interface TopThreeProps {
  first?: LeaderboardUser;
  second?: LeaderboardUser;
  third?: LeaderboardUser;
}

export default function TopThree({
  first,
  second,
  third,
}: TopThreeProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-10">

      {/* Aurora Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[140px]" />

      <div className="relative z-10">

        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Top Performers
          </h2>

          <p className="text-white/50 mt-2">
            Highest scoring aspirants this week
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-end">

          {/* SECOND PLACE */}
          <PodiumCard
            position={2}
            user={second}
            height="h-[260px]"
            borderColor="border-slate-400/30"
            icon={
              <Medal className="w-8 h-8 text-slate-300" />
            }
          />

          {/* FIRST PLACE */}
          <PodiumCard
            position={1}
            user={first}
            height="h-[320px]"
            borderColor="border-yellow-500/30"
            icon={
              <Crown className="w-10 h-10 text-yellow-400" />
            }
            featured
          />

          {/* THIRD PLACE */}
          <PodiumCard
            position={3}
            user={third}
            height="h-[220px]"
            borderColor="border-orange-500/30"
            icon={
              <Trophy className="w-8 h-8 text-orange-400" />
            }
          />

        </div>

      </div>
    </section>
  );
}

interface PodiumCardProps {
  position: number;
  user?: LeaderboardUser;
  height: string;
  borderColor: string;
  icon: React.ReactNode;
  featured?: boolean;
}

function PodiumCard({
  position,
  user,
  height,
  borderColor,
  icon,
  featured = false,
}: PodiumCardProps) {
  return (
    <div
      className={`
        ${height}
        relative
        rounded-[2rem]
        border
        ${borderColor}
        bg-white/5
        backdrop-blur-xl
        flex
        flex-col
        justify-center
        items-center
        text-center
        p-6
        transition-all
        duration-300
        hover:-translate-y-2
      `}
    >

      {featured && (
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10">

        <div className="mb-4 flex justify-center">
          {icon}
        </div>

        <div className="text-sm text-white/50 font-semibold">
          Rank #{position}
        </div>

        <div className="mt-3 w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center text-2xl font-black text-white">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        <h3 className="mt-4 text-lg font-bold text-white">
          {user?.name || 'Student'}
        </h3>

        <div className="mt-2 text-4xl font-black text-white">
          {user?.score || 0}%
        </div>

        <div className="mt-2 text-sm text-white/50">
          {user?.testsTaken || 0} Tests
        </div>

      </div>

    </div>
  );
}