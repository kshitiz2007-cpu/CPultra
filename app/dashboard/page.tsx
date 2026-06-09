'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, LogOut, LayoutDashboard } from 'lucide-react';

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

  useEffect(() => {
    async function initDashboard() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          window.location.href = '/';
          return;
        }
        setStudentSession(session);

        // Fetch user profile metrics
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        
        setProfile(profileData || { name: 'Aspirant', global_rank: '#1,422' });

        // Fetch student's test history
        const { data: attemptsData } = await supabase
          .from('attempts')
          .select('*')
          .eq('user_id', session.user.id)
          .order('completed_at', { ascending: false });
        
        setAttempts(attemptsData || []);

        // Fetch latest resources visible to all users
        const { data: resourcesData } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        setResources(resourcesData || []);

      } catch (err) {
        console.error('Dashboard recovery failed:', err);
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, []);

  // REAL-TIME DATA STREAM HOOKS
  useEffect(() => {
    if (!studentSession?.user?.id) return;

    const studentChannel = supabase
      .channel('live_student_feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, async () => {
        const { data } = await supabase.from('resources').select('*').order('created_at', { ascending: false }).limit(5);
        if (data) setResources(data);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attempts', filter: `user_id=eq.${studentSession.user.id}` }, (payload) => {
        setAttempts((prev) => [payload.new, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${studentSession.user.id}` }, (payload) => {
        setProfile(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(studentChannel);
    };
  }, [studentSession]);

  // LOGOUT HANDLER PIPELINE
  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error logging out client session:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-emerald-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm text-white/60">Updating authorization state...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden p-4 md:p-8 font-sans antialiased">
      {/* Background Ambience Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-8 relative z-10">
        
        {/* TOP INTERACTIVE GLASS BAR WITH LOGOUT CONTROL */}
        <div className="w-full bg-[#090d1f]/60 backdrop-blur-2xl border border-white/10 rounded-3xl px-6 py-4 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-black tracking-wider uppercase text-white/80">Student Workspace</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
        
        {/* Main Content Sections */}
        <HeroSection userName={profile?.name || studentSession?.user?.email?.split('@')[0]} attempts={attempts} />
        
        <StatsCards attempts={attempts} profile={profile} />

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