'use client';

import { Sparkles, Calendar, GraduationCap } from 'lucide-react';

interface HeroProps {
  userName: string;
  attempts: any[];
}

export default function HeroSection({ userName, attempts }: HeroProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Dynamically calculate the completion metric safely
  const completedCount = attempts.length;
  const targetMilestoneMax = 50; 
  const prepPercentage = Math.min(Math.round((completedCount / targetMilestoneMax) * 100), 100) || 0;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6 md:p-8 backdrop-blur-2xl shadow-xl">
      <div className="absolute -right-20 -top-20 pointer-events-none h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 uppercase border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" /> UPSC Preparation Engine Active
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mt-2">
              Welcome Back, <span className="text-emerald-400">{userName}</span>
            </h1>
            <p className="text-sm text-white/50 max-w-xl">
              Continue your UPSC preparation journey and move one step closer to your dream service.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-white/40 border-l border-white/10 pl-4 h-fit">
            <Calendar className="h-4 w-4 text-emerald-400" /> {currentDate}
          </div>
        </div>

        {/* LIVE PROGRESS COMPLIANCE METRIC BAR */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-xs font-bold tracking-wider text-white/40 uppercase">
            <span>Preparation Progress</span>
            <span className="text-emerald-400 font-black text-sm tracking-normal">{prepPercentage}%</span>
          </div>
          <div className="h-3 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden p-[2px]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all duration-700 ease-out"
              style={{ width: `${prepPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}