'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Play, BookOpen, Loader2 } from 'lucide-react';

interface ContinueLearningProps {
  userId?: string;
}

export default function ContinueLearning({ userId }: ContinueLearningProps) {
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState({
    title: 'Indian Polity - Constitutional Framework',
    category: 'M. Laxmikanth Core Series',
    progress: 45,
  });

  useEffect(() => {
    if (!userId) return;

    async function fetchLastActiveProgress() {
      // Fetch the last paused topic or mock progression from your database tracking table
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setActiveModule({
          title: data.topic_title || 'General Studies Focus',
          category: data.subject_category || 'UPSC Core Module',
          progress: data.completion_percentage || 0,
        });
      }
      setLoading(false);
    }

    fetchLastActiveProgress();

    // Listen for real-time progress state adjustments made by external triggers or completions
    const progressChannel = supabase
      .channel(`live_progress_${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'student_progress', filter: `user_id=eq.${userId}` }, (payload) => {
        setActiveModule({
          title: payload.new.topic_title,
          category: payload.new.subject_category,
          progress: payload.new.completion_percentage,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl flex items-center justify-center min-h-[220px]">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl flex flex-col justify-between gap-6 shadow-md transition-all">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-lg text-white">Resume Curriculum</h3>
      </div>

      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
            {activeModule.category}
          </span>
          <h4 className="font-bold text-sm text-white mt-0.5 line-clamp-1">
            {activeModule.title}
          </h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white/60">
            <span>Module Coverage</span>
            <span className="text-white font-bold">{activeModule.progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${activeModule.progress}%` }}
            />
          </div>
        </div>
      </div>

      <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/30 transition-all">
        <Play className="h-3.5 w-3.5 fill-current" /> Initialize Lecture Player
      </button>
    </div>
  );
}