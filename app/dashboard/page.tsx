'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  PlayCircle, Clock, BookOpen, Award,
  Sparkles, Loader2, ArrowRight, Layers,
  FileText, Target, CheckCircle, LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [latestQuizzes, setLatestQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ quizzes: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (profile) setUser(profile);

        const { data: quizzesData } = await supabase.from('quizzes').select('*').eq('active', true).order('created_at', { ascending: false }).limit(4);
        const { data: attemptsData } = await supabase.from('attempts').select('*').eq('user_id', session.user.id);
        const { count: quizCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true }).eq('active', true);
        const { count: resourceCount } = await supabase.from('resources').select('*', { count: 'exact', head: true });

        if (quizzesData) setLatestQuizzes(quizzesData);
        if (attemptsData) setAttempts(attemptsData);
        setPlatformStats({ quizzes: quizCount || 0, resources: resourceCount || 0 });
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const totalAttempted = attempts.length;
  const averageScore = totalAttempted > 0
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempted)
    : 0;
  const getAttemptForQuiz = (quizId: string) => attempts.find(a => a.quiz_id === quizId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const statsCards = [
    { label: 'Tests Taken',   value: totalAttempted,          icon: BookOpen, iconBg: '#EEF2FF', iconColor: '#6366F1' },
    { label: 'Avg Score',     value: `${averageScore}%`,      icon: Award,    iconBg: '#FFFBEB', iconColor: '#F59E0B' },
    { label: 'Live Modules',  value: platformStats.quizzes,   icon: Target,   iconBg: '#FEF2F2', iconColor: '#EF4444' },
    { label: 'Study Files',   value: platformStats.resources, icon: FileText, iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>

      {/* Top nav */}
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: '#6366F1' }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>CivilPrep</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { label: 'Dashboard', path: '/dashboard', active: true },
              { label: 'Mock Tests', path: '/quizzes', active: false },
              { label: 'Resources', path: '/resources', active: false },
            ].map(({ label, path, active }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                style={{
                  background: active ? '#EEF2FF' : 'transparent',
                  color: active ? '#6366F1' : '#64748B',
                }}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded transition-colors"
            style={{ color: '#64748B' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-20 space-y-8 animate-fade-in">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Scholar'} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Ready to continue your preparation today?
          </p>
        </div>

        {/* KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statsCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div key={label} className="kpi-card">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
              <div className="text-xl font-bold" style={{ color: '#0F172A' }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/quizzes')}
            className="relative overflow-hidden rounded-xl p-6 text-left transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', minHeight: 140 }}
          >
            <div
              className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20"
              style={{ background: 'white' }}
            />
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Mock Tests</h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>Subject-wise mock exams</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white opacity-70" />
            </div>
          </button>

          <button
            onClick={() => router.push('/resources')}
            className="relative overflow-hidden rounded-xl p-6 text-left transition-transform hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #0284C7, #0369A1)', minHeight: 140 }}
          >
            <div
              className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20"
              style={{ background: 'white' }}
            />
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Study Materials</h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>PDFs, notes & links</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white opacity-70" />
            </div>
          </button>
        </div>

        {/* Latest quizzes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#0F172A' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#F59E0B' }} />
                Newest Modules
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Latest test series added to the platform</p>
            </div>
            <button
              onClick={() => router.push('/quizzes')}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: '#6366F1' }}
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {latestQuizzes.length === 0 ? (
            <div
              className="panel p-12 text-center"
              style={{ borderStyle: 'dashed' }}
            >
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No modules available yet. Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestQuizzes.map((quiz) => {
                const pastAttempt = getAttemptForQuiz(quiz.id);
                return (
                  <div
                    key={quiz.id}
                    className="panel p-5 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
                    style={{ minHeight: 140 }}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="badge"
                          style={{ background: '#EEF2FF', color: '#6366F1' }}
                        >
                          {quiz.category || 'General'}
                        </span>
                        {pastAttempt && (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Done
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold mt-2 line-clamp-2" style={{ color: '#0F172A' }}>
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#94A3B8' }}>
                        <Clock className="w-3.5 h-3.5" /> {quiz.time_limit}m
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                      {pastAttempt ? (
                        <div
                          className="w-full py-2 rounded text-center text-sm font-semibold"
                          style={{ background: '#F1F5F9', color: '#64748B' }}
                        >
                          Score: <span style={{ color: pastAttempt.score >= 75 ? '#059669' : pastAttempt.score >= 50 ? '#B45309' : '#DC2626' }}>
                            {pastAttempt.score}%
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => router.push(`/quiz/${quiz.id}`)}
                          className="btn btn-primary w-full justify-center"
                        >
                          <PlayCircle className="w-4 h-4" /> Start Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}