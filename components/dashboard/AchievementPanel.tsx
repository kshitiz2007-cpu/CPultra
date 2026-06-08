'use client';

import {
  Award,
  Trophy,
  Flame,
  Target,
  Star,
  Crown,
  CheckCircle2,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon?: React.ReactNode;
}

interface AchievementPanelProps {
  achievements: Achievement[];
}

export default function AchievementPanel({
  achievements,
}: AchievementPanelProps) {
  const unlockedCount = achievements.filter(
    (a) => a.unlocked
  ).length;

  const completionPercentage =
    achievements.length > 0
      ? Math.round(
          (unlockedCount / achievements.length) * 100
        )
      : 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8">

      {/* Glow Effects */}
      <div className="absolute -left-24 top-0 w-80 h-80 bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute right-0 bottom-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">

          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Achievements
            </h2>

            <p className="text-white/50 text-sm">
              Track your preparation milestones
            </p>
          </div>

        </div>

        {/* Progress Overview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">

          <div className="flex justify-between items-center mb-3">

            <span className="text-white/70 font-medium">
              Achievement Progress
            </span>

            <span className="text-yellow-400 font-bold">
              {completionPercentage}%
            </span>

          </div>

          <div className="h-3 rounded-full bg-white/10 overflow-hidden">

            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 transition-all duration-700"
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>

          <div className="mt-3 text-sm text-white/50">
            {unlockedCount} of {achievements.length} achievements unlocked
          </div>

        </div>

        {/* Achievement Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`
                rounded-2xl border p-5 transition-all duration-300
                ${
                  achievement.unlocked
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-white/5 border-white/10'
                }
              `}
            >

              <div className="flex items-start justify-between">

                <div
                  className={`
                    p-3 rounded-xl
                    ${
                      achievement.unlocked
                        ? 'bg-yellow-500/20'
                        : 'bg-white/5'
                    }
                  `}
                >
                  {achievement.icon || (
                    <Award
                      className={`
                        w-5 h-5
                        ${
                          achievement.unlocked
                            ? 'text-yellow-400'
                            : 'text-white/40'
                        }
                      `}
                    />
                  )}
                </div>

                {achievement.unlocked && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}

              </div>

              <h3
                className={`
                  mt-4 font-bold
                  ${
                    achievement.unlocked
                      ? 'text-white'
                      : 'text-white/50'
                  }
                `}
              >
                {achievement.title}
              </h3>

              <p
                className={`
                  mt-2 text-sm
                  ${
                    achievement.unlocked
                      ? 'text-white/70'
                      : 'text-white/40'
                  }
                `}
              >
                {achievement.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}