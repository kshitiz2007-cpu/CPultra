'use client';

import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Loader2, CheckCircle2 } from 'lucide-react';

// SAFE IMPORT
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          window.location.href = '/'; 
          return;
        }

        const email = session.user.email || '';
        
        // SUPER ADMIN OVERRIDE
        if (email === 'kshitiz2007@gmail.com' || email === 'admin@civilprep.in') {
          setAdminEmail(email);
          setLoading(false);
          return;
        }

        // Standard Admin check
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role !== 'admin') {
          window.location.href = '/dashboard';
          return;
        }

        setAdminEmail(email);
        setLoading(false);

      } catch (err) {
        console.error("Admin check failed:", err);
        window.location.href = '/dashboard'; 
      }
    }

    checkAdmin();
  }, []); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 border-b border-emerald-900/50">
          <h1 className="text-2xl font-black font-serif tracking-wide text-emerald-50">CivilPrep</h1>
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-900/50 text-emerald-100 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
        </nav>

        <div className="p-4 border-t border-emerald-900/50">
          <div className="text-xs text-emerald-400 mb-3 px-2 truncate">
            Logged in as:<br/>
            <span className="text-white font-semibold">{adminEmail}</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-serif">Admin Overview</h2>
            <p className="text-gray-500 mt-1">Manage content and monitor student performance.</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Panel Restored!</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            The infinite loop has been fixed. You can now safely access your admin tools.
          </p>
        </div>
      </main>
    </div>
  );
}