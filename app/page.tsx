'use client';
// Force Next.js to bypass static prerendering for this route
export const dynamic = 'force-dynamic'; 

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUserRoleAndRedirect = async (session: any) => {
      // 1. SAFEGUARD: Ensure session and user exist before accessing properties
      if (!session?.user?.email) {
        if (mounted) setCheckingAuth(false);
        return;
      }

      // SUPER ADMIN OVERRIDE - Using window.location.href for guaranteed redirects
      if (session.user.email === 'kshitiz2007@gmail.com' || session.user.email === 'admin@civilprep.in') {
        window.location.href = '/admin';
        return;
      }

      // Normal database check for everyone else
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
          window.location.href = '/dashboard'; // Fallback hard redirect
          return;
        }

        if (mounted) {
          if (data?.role === 'admin') {
            window.location.href = '/admin'; // Hard redirect to admin
          } else {
            window.location.href = '/dashboard'; // Hard redirect to dashboard
          }
        }
      } catch (err) {
        console.error('Unexpected error checking role:', err);
        window.location.href = '/dashboard';
      }
    };

    // 2. SAFEGUARD: Handle the initial session fetch inside a robust async function
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          await checkUserRoleAndRedirect(session);
        } else {
          if (mounted) setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (mounted) setCheckingAuth(false);
      }
    };

    initSession();

    // 3. SAFEGUARD: Catch auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkUserRoleAndRedirect(session);
      }
    });

    return () => {
      mounted = false;
      // 4. SAFEGUARD: Optional chaining to prevent crashes on unmount
      authListener?.subscription?.unsubscribe();
    };
  }, []); // <-- Empty dependency array prevents infinite loops!

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 5. SAFEGUARD: Ensure window is defined
          redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        }
      });

      if (error) throw error;
    } catch (error: any) {
      alert("Error logging in: " + error.message);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* 1. GLOWING AURORA BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[25rem] h-[25rem] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* 2. PREMIUM GLASS LOGIN CARD */}
      <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] max-w-md w-full z-10 text-center relative animate-fade-in mx-4">
        
        {/* Logo Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-[1.5rem] mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white font-serif tracking-tight mb-3 drop-shadow-sm">Gyankunj Academy</h1>
        <p className="text-sm md:text-base text-white/60 font-medium mb-10 leading-relaxed">Sign in to access your premium study materials and live mock tests.</p>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all group overflow-hidden hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400/50" />
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] text-center">
            Secure authentication by Supabase & Google
          </p>
        </div>
      </div>
    </div>
  );
}