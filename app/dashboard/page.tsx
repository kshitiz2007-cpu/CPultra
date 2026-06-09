'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

import HeroSection from '@/components/dashboard/HeroSection';
import StatsCards from '@/components/dashboard/StatsCards';
import ContinueLearning from '@/components/dashboard/ContinueLearning';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentQuizzes from '@/components/dashboard/RecentQuizzes';
import RecommendedResources from '@/components/dashboard/RecommendedResources';
import PerformanceAnalytics from '@/components/dashboard/PerformanceAnalytics';
import AchievementPanel from '@/components/dashboard/AchievementPanel';

export default function StudentDashboardPage() {
  const [studentSession, setStudentSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. INITIAL REST FULFILMENT DATA FETCH
  useEffect(() => {
    async function initDashboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/';
          return;
        }
        setStudentSession(session);

        // Fetch profile metrics
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);

        // Fetch student's test history
        const { data: attemptsData } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', session.user.id) // Fallback or direct check matching your analytics schema
          .order('completed_at', { ascending: false });
        setAttempts(attemptsData || []);

        // Fetch latest active learning materials
        const { data: resourcesData } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setResources(resourcesData || []);

      } catch (err) {
        console.error('Dashboard boot initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  // 2. SUPABASE REALTIME MULTI-CHANNEL LISTENERS
  useEffect(() => {
    if (!studentSession?.user?.id) return;

    // Listen to changes across all tables impacting the student interface
    const dashboardChannel = supabase
      .channel('student_workspace_stream')
      
      // Listen for new admin-added resources
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'resources' }, (payload) => {
        setResources((prev) => [payload.new, ...prev.slice(0, 4)]);
      })
      
      // Listen for deleted resources
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'resources' }, (payload) => {
        setResources((prev) => prev.filter(r => r.id !== payload.old.id));
      })

      // Listen for profile/stat updates (e.g., automated rank changes or administrative corrections)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${studentSession.user.id}` }, (payload) => {
        setProfile(payload.new);
      })

      // Listen for new test attempts processing in real-time
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attempts', filter: `user_id=eq.${studentSession.user.id}` }, (payload) => {
        setAttempts((prev) => [payload.new, ...prev]);
      })
      
      .subscribe();

    return () => {
      supabase.removeChannel(dashboardChannel);
    };
  }, [studentSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-emerald-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium text-white/70 text-sm">Synchronizing dashboard matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden p-4 md:p-8 font-sans antialiased">
      {/* Visual Alignment Layer Matching Admin Ambience Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        
        {/* Module Area Header */}
        <HeroSection userName={profile?.name || studentSession?.user?.email?.split('@')[0]} />

        {/* 4-KPI Analytics Grid Layout linked to live database attributes */}
        <StatsCards attempts={attempts} profile={profile} />

        {/* Structural Sub-grid Partition Assemblies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ContinueLearning userId={studentSession?.user?.id} />
              <QuickActions />
            </div>
            <RecentQuizzes attempts={attempts} />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <PerformanceAnalytics attempts={attempts} />
            <AchievementPanel attempts={attempts} />
            <RecommendedResources resources={resources} />
          </div>
        </div>

      </div>
    </div>
  );
}