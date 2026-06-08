'use client';

import {
  PlayCircle,
  BookOpen,
  Newspaper,
  Trophy,
  Brain,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface QuickActionsProps {
  onStartQuiz?: () => void;
  onResources?: () => void;
  onCurrentAffairs?: () => void;
  onLeaderboard?: () => void;
  onAiQuiz?: () => void;
  onNotes?: () => void;
}

export default function QuickActions({
  onStartQuiz,
  onResources,
  onCurrentAffairs,
  onLeaderboard,
  onAiQuiz,
  onNotes,
}: QuickActionsProps) {
  const actions = [
    {
      title: 'Start Mock Test',
      subtitle: 'Practice UPSC MCQs',
      icon: PlayCircle,
      color: 'emerald',
      action: onStartQuiz,
    },
    {
      title: 'Resources',
      subtitle: 'Study materials',
      icon: BookOpen,
      color: 'blue',
      action: onResources,
    },
    {
      title: 'Current Affairs',
      subtitle: 'Daily updates',
      icon: Newspaper,
      color: 'orange',
      action: onCurrentAffairs,
    },
    {
      title: 'Leaderboard',
      subtitle: 'Check rankings',
      icon: Trophy,
      color: 'yellow',
      action: onLeaderboard,
    },
    {
      title: 'AI Quiz',
      subtitle: 'Generate quizzes',
      icon: Brain,
      color: 'purple',
      action: onAiQuiz,
    },
    {
      title: 'Notes',
      subtitle: 'Revision content',
      icon: FileText,
      color: 'cyan',
      action: onNotes,
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8">

      {/* Aurora Glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10">

        <div className="mb-6">
          <h2 className="text-2xl font-black text-white">
            Quick Actions
          </h2>

          <p className="text-white/50 text-sm mt-1">
            Jump directly to your most-used features.
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">

          {actions.map((item, index) => {
            const Icon = item.icon;

            return (
              <button
                key={index}
                onClick={item.action}
                className="group text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">

                  <div
                    className={`
                      p-3 rounded-xl
                      ${
                        item.color === 'emerald'
                          ? 'bg-emerald-500/10'
                          : item.color === 'blue'
                          ? 'bg-blue-500/10'
                          : item.color === 'orange'
                          ? 'bg-orange-500/10'
                          : item.color === 'yellow'
                          ? 'bg-yellow-500/10'
                          : item.color === 'purple'
                          ? 'bg-purple-500/10'
                          : 'bg-cyan-500/10'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5
                        ${
                          item.color === 'emerald'
                            ? 'text-emerald-400'
                            : item.color === 'blue'
                            ? 'text-blue-400'
                            : item.color === 'orange'
                            ? 'text-orange-400'
                            : item.color === 'yellow'
                            ? 'text-yellow-400'
                            : item.color === 'purple'
                            ? 'text-purple-400'
                            : 'text-cyan-400'
                        }
                      `}
                    />
                  </div>

                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />

                </div>

                <h3 className="mt-4 text-white font-bold text-base">
                  {item.title}
                </h3>

                <p className="mt-1 text-sm text-white/50">
                  {item.subtitle}
                </p>
              </button>
            );
          })}

        </div>

      </div>
    </section>
  );
}