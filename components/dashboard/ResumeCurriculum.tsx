'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Play, Loader2 } from 'lucide-react';

interface ResumeCurriculumProps {
  userId?: string;
}

export default function ResumeCurriculum({ userId }: ResumeCurriculumProps) {
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState({
    series: 'GENERAL STUDIES TRACK',
    title: 'Select a Quiz Module to Begin',
    coverage: 0
  });

  useEffect(() => {
    if (!userId) return;

    async function fetchLiveProgress() {
      try {
        // Try fetching the explicit paused progress record first
        const { data: progressData } = await supabase
          .from('student_progress')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (progressData) {
          setActiveModule({
            series: (progressData.subject_category || 'UPSC Core Series').toUpperCase(),
            title: progressData.topic_title || 'Untitled Module',
            coverage: progressData.completion_percentage || 0
          });
          setLoading(false);
          return;
        }

        // Fallback: If no progress record exists, grab their latest completed quiz attempt
        const { data: latestAttempt } = await supabase
          .from('attempts')
          .select('quiz_title, category')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestAttempt) {
          setActiveModule({
            series: `${(latestAttempt.category || 'General Studies')}`.toUpperCase(),
            title: latestAttempt.quiz_title || 'Review Last Session',
            coverage: 100
          });
        }
      } catch (err) {
        console.error('Error fetching structural curriculum data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveProgress();

    // Wire Realtime engine listener to push progress state mutations instantly
    const progressChannel = supabase
      .channel(`live_curriculum_stream_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_progress', filter: `user_id=eq.${userId}` }, (payload: any) => {
        if (payload.new) {
          setActiveModule({
            series: (payload.new.subject_category || 'UPSC Core Series').toUpperCase(),
            title: payload.new.topic_title || 'In-Progress Module',
            coverage: payload.new.completion_percentage || 0
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [userId]);

  const handleLaunchPlayer = () => {
    alert(`Initializing platform media module context for: ${activeModule.title}`);
  };

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl flex items-center justify-center min-h-[290px] w-full">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl flex flex-col justify-between gap-6 shadow-xl w-full">
      <div className="flex items-center gap-3">
        <BookOpen className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold text-lg text-white tracking-tight">Resume Curriculum</h3>
      </div>

      <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-5 space-y-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
            {activeModule.series}
          </span>
          <h4 className="font-black text-base text-white mt-1安全 leading-tight line-clamp-2">
            {activeModule.title}
          </h4>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-white/40">
            <span>Module Coverage</span>
            <span className="text-white font-bold">{activeModule.coverage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 border border-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${activeModule.coverage}%` }}
            />
          </div>
        </div>
      </div>

      <button 
        onClick={handleLaunchPlayer}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 py-3.5 text-xs font-black uppercase tracking-widest text-emerald-400 transition-all active:scale-[0.99]"
      >
        <Play className="h-3.5 w-3.5 fill-current" /> Initialize Lecture Player
      </button>
    </div>
  );
}