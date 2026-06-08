'use client';

import { ArrowRight, Clock, BookOpen } from 'lucide-react';

interface ContinueLearningProps {
  quizTitle: string;
  category: string;
  progress: number;
  questions: number;
  onResume?: () => void;
}

export default function ContinueLearning({
  quizTitle,
  category,
  progress,
  questions,
  onResume,
}: ContinueLearningProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8">

      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10">

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Continue Learning
            </h2>

            <p className="text-white/50 text-sm">
              Resume where you left off
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">

          <div className="flex items-center justify-between gap-4">

            <div>
              <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold mb-3">
                {category}
              </div>

              <h3 className="text-xl font-bold text-white">
                {quizTitle}
              </h3>

              <div className="flex items-center gap-2 text-white/50 mt-3 text-sm">
                <Clock className="w-4 h-4" />
                {questions} Questions
              </div>
            </div>

            <button
              onClick={onResume}
              className="group px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all flex items-center gap-2"
            >
              Resume
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

          <div className="mt-6">

            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">
                Completion
              </span>

              <span className="text-emerald-300 font-bold">
                {progress}%
              </span>
            </div>

            <div className="h-3 bg-white/10 rounded-full overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}