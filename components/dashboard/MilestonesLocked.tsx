'use client';

import { Trophy, Flame, Target } from 'lucide-react';

interface MilestoneProps {
  attempts: any[];
}

export default function MilestonesLocked({ attempts }: MilestoneProps) {
  // 1. Accumulate total evaluated questions directly out of rows
  const calculatedTotalMCQs = attempts.reduce((sum, run) => sum + (run.total_questions || 10), 0);

  // 2. Compute true consecutive run days based on unique calendar date timestamps
  const calculateTrueStreak = () => {
    if (attempts.length === 0) return 0;
    
    const chronologicalDates = attempts
      .map(a => a.completed_at ? new Date(a.completed_at).toDateString() : null)
      .filter(Boolean);
      
    const uniqueDaysCount = new Set(chronologicalDates).size;
    return uniqueDaysCount > 0 ? uniqueDaysCount : 0;
  };

  const trueDayStreak = calculateTrueStreak();
  const targetedNextTier = calculatedTotalMCQs >= 250 ? 500 : 250;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl flex flex-col justify-between gap-6 shadow-xl w-full">
      <div className="flex items-center gap-3">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h3 className="font-bold text-lg text-white tracking-tight">Milestones Locked</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Flame Run Tracking Block */}
        <div className="bg-[#090d22]/40 border border-white/5 p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:bg-white/5">
          <Flame className="h-6 w-6 text-orange-500 mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.25)]" />
          <div className="text-2xl font-black text-white tracking-tight">{trueDayStreak} Days</div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mt-1">Consecutive Run</p>
        </div>

        {/* Real MCQ Evaluation Metrics Block */}
        <div className="bg-[#090d22]/40 border border-white/5 p-5 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:bg-white/5">
          <Target className="h-6 w-6 text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.25)]" />
          <div className="text-2xl font-black text-white tracking-tight">{calculatedTotalMCQs} MCQs</div>
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mt-1">Evaluated Overall</p>
        </div>
      </div>

      {/* Target Progress Box Banner */}
      <div className="text-center text-xs text-white/60 font-semibold px-2 py-3 border border-white/5 rounded-xl bg-white/[0.01]">
        🏅 Next Tier Upgrade at <span className="text-amber-400 font-black">{targetedNextTier} MCQs</span>
      </div>
    </div>
  );
}