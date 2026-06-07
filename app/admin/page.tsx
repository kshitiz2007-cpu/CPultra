'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

// All your custom Admin Modules!
import AdminOverview from './AdminOverview';
import AiQuizBuilder from './AiQuizBuilder';
import ResourceManager from './ResourceManager';
import CsvImporter from './CsvImporter';
import PaymentsManager from './PaymentsManager';
import StudentsManager from './StudentsManager';
import QuizManager from './QuizManager';

import {
  LayoutDashboard, FileQuestion, Users, FileText,
  CreditCard, Sparkles, CalendarClock, TableProperties,
  LogOut
} from 'lucide-react';

// Sidebar Navigation Configuration
const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
  { id: 'aigen', label: 'AI Generate', icon: Sparkles },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'scheduled', label: 'Scheduled', icon: CalendarClock },
  { id: 'csvimport', label: 'CSV Import', icon: TableProperties },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Authenticate and Verify Admin Privileges
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

        // Stop the loading spinner!
        setLoading(false);

      } catch (err) {
        console.error("Admin check failed:", err);
        window.location.href = '/dashboard'; 
      }
    }

    checkAdmin();
  }, []); // <-- This empty array is crucial to prevent the infinite loop!

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-gray-50/50">

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-white/40 backdrop-blur-xl border-b md:border-b-0 md:border-r border-gray-200 p-4 md:p-6 flex flex-col shrink-0">
        
        {/* Header - Stays left on mobile, block on desktop */}
        <div className="mb-4 md:mb-10 flex justify-between items-center md:block animate-fade-in">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-950 font-serif tracking-tight">Admin Panel</h1>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">Gyankunj Academy</p>
          </div>
          
          {/* Mobile Logout Button (Hidden on Desktop) */}
          <button 
            onClick={handleLogout}
            className="md:hidden p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Horizontal scroll on mobile, Vertical stack on desktop */}
        <nav 
          className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] animate-fade-in" 
          style={{ animationDelay: '100ms' }}
        >
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all duration-300 text-sm md:text-base ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                    : 'text-gray-500 hover:bg-white/60 hover:text-emerald-700'
                }`}
              >
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-emerald-300' : ''}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Logout Button (Hidden on Mobile) */}
        <div className="hidden md:block mt-auto pt-6 border-t border-gray-200 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-x-hidden">
        
        {/* Limit max width on large screens to keep content readable */}
        <div className="max-w-7xl mx-auto w-full">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && <AdminOverview />}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && <QuizManager />}

          {/* AI GENERATE TAB */}
          {activeTab === 'aigen' && <AiQuizBuilder />}

          {/* RESOURCES TAB */}
          {activeTab === 'resources' && <ResourceManager />}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && <StudentsManager />}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && <PaymentsManager />}

          {/* CSV IMPORT TAB */}
          {activeTab === 'csvimport' && <CsvImporter />}

          {/* SCHEDULED TAB */}
          {activeTab === 'scheduled' && (
            <div className="bg-white/50 backdrop-blur-sm p-8 md:p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-900/20 rounded-2xl md:rounded-[2rem] w-full mt-4">
              <CalendarClock className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-bold text-emerald-950 mb-2 font-serif">Live Events Module</h3>
              <p className="text-xs md:text-sm text-gray-500 mb-6 max-w-md">
                This module will handle the logic for setting up live, time-gated "All India Mock Tests".
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}