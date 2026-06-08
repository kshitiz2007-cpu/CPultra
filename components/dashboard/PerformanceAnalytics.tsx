'use client';

import {
  TrendingUp,
  Target,
  Award,
  BarChart3,
} from 'lucide-react';

interface SubjectPerformance {
  subject: string;
  score: number;
}

interface PerformanceAnalyticsProps {
  data: SubjectPerformance[];
}

export default function PerformanceAnalytics({
  data,
}: PerformanceAnalyticsProps) {
  const overallAverage =
    data.length > 0
      ? Math.round(
          data.reduce((acc, item) => acc + item.score, 0) /
            data.length
        )
      : 0;

  const strongest =
    data.length > 0
      ? [...data].sort((a, b) => b.score - a.score)[0]
      : null;

  const weakest =
    data.length > 0
      ? [...data].sort((a, b) => a.score - b.score)[0]
      : null;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8">

      {/* Glow */}
      <div className="absolute -right-20 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Performance Analytics
            </h2>

            <p className="text-white/50 text-sm">
              Subject-wise performance insights
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <Target className="w-6 h-6 text-emerald-400 mb-3" />

            <div className="text-3xl font-black text-white">
              {overallAverage}%
            </div>

            <div className="text-white/50 text-sm mt-1">
              Overall Average
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <Award className="w-6 h-6 text-yellow-400 mb-3" />

            <div className="text-lg font-bold text-white">
              {strongest?.subject || '--'}
            </div>

            <div className="text-white/50 text-sm mt-1">
              Strongest Subject
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-3" />

            <div className="text-lg font-bold text-white">
              {weakest?.subject || '--'}
            </div>

            <div className="text-white/50 text-sm mt-1">
              Needs Improvement
            </div>
          </div>

        </div>

        {/* Subject Performance */}
        <div className="space-y-4">

          {data.map((item) => (
            <div
              key={item.subject}
              className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >

              <div className="flex justify-between items-center mb-3">

                <span className="font-semibold text-white">
                  {item.subject}
                </span>

                <span className="text-emerald-300 font-bold">
                  {item.score}%
                </span>

              </div>

              <div className="h-3 rounded-full bg-white/10 overflow-hidden">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                  style={{
                    width: `${item.score}%`,
                  }}
                />

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}