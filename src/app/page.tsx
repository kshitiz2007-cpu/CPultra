'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      alert('Login failed: ' + error.message);
    } else {
      // Direct to admin or student based on role
      if (email === 'admin@civilprep.in') router.push('/admin');
      else router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Decorative glass elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2 font-serif">CivilPrep</h1>
          <p className="text-xs font-bold text-emerald-700 tracking-widest uppercase">By Gyankunj Academy</p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Sign In ✨
          </button>
        </form>
      </div>
    </div>
  );
}