'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Loader2, BookOpen, Target, Users, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserRoleAndRedirect = async (session: any) => {
      if (session.user.email === 'kshitiz2007@gmail.com' || session.user.email === 'admin@civilprep.in') {
        router.push('/admin');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (data?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserRoleAndRedirect(session);
      } else {
        setCheckingAuth(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkUserRoleAndRedirect(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      alert("Error logging in: " + error.message);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6366F1' }} />
      </div>
    );
  }

  const features = [
    { icon: Target, label: 'AI-powered mock tests', desc: 'Auto-generated MCQs for every subject' },
    { icon: BookOpen, label: 'Curated study resources', desc: 'PDFs, notes & current affairs' },
    { icon: Users, label: 'Progress tracking', desc: 'Leaderboards & detailed analytics' },
    { icon: Zap, label: 'Instant results', desc: 'Score breakdowns after every test' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F5F9' }}>

      {/* ── Left panel: brand & features ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[520px] shrink-0"
        style={{ background: '#0F172A', color: 'white' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}
          >
            <BookOpen className="w-5 h-5" style={{ color: '#A5B4FC' }} />
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">CivilPrep</div>
            <div className="text-xs" style={{ color: '#64748B' }}>by Gyankunj Academy</div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-4"
            style={{ color: '#6366F1' }}
          >
            UPSC · MPPSC · SSC Preparation
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ color: '#F8FAFC' }}>
            Your complete<br />exam prep platform.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
            From AI-generated mock tests to curated study material — everything a serious civil services aspirant needs, in one place.
          </p>

          <div className="mt-10 space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div
                  className="mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: '#818CF8' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>{label}</div>
                  <div className="text-xs" style={{ color: '#475569' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#334155' }}>
          © 2025 Gyankunj Academy, Betul, Madhya Pradesh
        </p>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#6366F1' }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#0F172A' }}>CivilPrep · Gyankunj Academy</span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: '#0F172A' }}>Sign in</h2>
          <p className="text-sm mb-8" style={{ color: '#64748B' }}>
            Access your study dashboard and mock tests.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: 'white',
              border: '1px solid #E2E8F0',
              color: '#0F172A',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366F1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#6366F1' }} />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-center text-xs mt-6" style={{ color: '#94A3B8' }}>
            By continuing, you agree to Gyankunj Academy's Terms of Service and Privacy Policy.
          </p>

          <div className="mt-10 pt-6" style={{ borderTop: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-center gap-4 text-xs" style={{ color: '#94A3B8' }}>
              <span>🔒 Google OAuth</span>
              <span>·</span>
              <span>Secured by Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}