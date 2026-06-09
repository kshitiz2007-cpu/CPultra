'use client';

import { Play, BookOpen } from 'lucide-react';

interface ContinueLearningProps {
  userId?: string;
}

export default function ContinueLearning({ userId }: ContinueLearningProps) {
  // Static state tracking fallback variables matching your dynamic screenshot display
  const currentTopic = {
    title: 'Indian Polity - Constitutional Framework',
    subtitle: 'M. LAXMIKANTH CORE SERIES',
    coverage: 45
  };

  const launchLectureStream = () => {
    alert(`Initializing player context for module: ${currentTopic.title}`);
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl flex flex-col justify-between gap-6 shadow-md">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-lg text-white tracking-tight">Resume Curriculum</h3>
      </div>

      <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-5 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">
            {currentTopic.subtitle}
          </span>
          <h4 className="font-bold text-base text-white mt-1">
            {currentTopic.title}
          </h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white/50">
            <span>Module Coverage</span>
            <span className="text-white font-bold">{currentTopic.coverage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              style={{ width: `${currentTopic.coverage}%` }}
            />
          </div>
        </div>
      </div>

      <button 
        onClick={launchLectureStream}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 py-3.5 text-xs font-black uppercase tracking-widest text-emerald-400 transition-all active:scale-[0.99]"
      >
        <Play className="h-3.5 w-3.5 fill-current" /> Initialize Lecture Player
      </button>
    </div>
  );
}