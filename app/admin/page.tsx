'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, FileQuestion, Users, FileText,
  CreditCard, Sparkles, CalendarClock, TableProperties,
  LogOut, BookOpen, ChevronRight
} from 'lucide-react';

import AdminOverview   from './AdminOverview';
import AiQuizBuilder   from './AiQuizBuilder';
import ResourceManager from './ResourceManager';
import CsvImporter     from './CsvImporter';
import PaymentsManager from './PaymentsManager';
import StudentsManager from './StudentsManager';
import QuizManager     from './QuizManager';

const NAV = [
  { id: 'overview',   label: 'Overview',    icon: LayoutDashboard, group: 'platform' },
  { id: 'students',   label: 'Students',    icon: Users,           group: 'platform' },
  { id: 'quizzes',    label: 'Quizzes',     icon: FileQuestion,    group: 'platform' },
  { id: 'payments',   label: 'Payments',    icon: CreditCard,      group: 'platform' },
  { id: 'resources',  label: 'Resources',   icon: FileText,        group: 'content'  },
  { id: 'aigen',      label: 'AI Builder',  icon: Sparkles,        group: 'content'  },
  { id: 'csvimport',  label: 'CSV Import',  icon: TableProperties, group: 'content'  },
  { id: 'scheduled',  label: 'Scheduled',   icon: CalendarClock,   group: 'content'  },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }

      // Populate user info for sidebar footer
      setAdminEmail(session.user.email || '');
      setAdminName(session.user.user_metadata?.full_name?.split(' ')[0] || 'Admin');

      if (session.user.email === 'kshitiz2007@gmail.com' || session.user.email === 'admin@civilprep.in') {
        setLoading(false); return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') { router.push('/dashboard'); }
      else { setLoading(false); }
    }
    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const currentNav = NAV.find(n => n.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':  return <AdminOverview />;
      case 'students':  return <StudentsManager />;
      case 'quizzes':   return <QuizManager />;
      case 'payments':  return <PaymentsManager />;
      case 'resources': return <ResourceManager />;
      case 'aigen':     return <AiQuizBuilder />;
      case 'csvimport': return <CsvImporter />;
      case 'scheduled': return <ScheduledPlaceholder />;
      default:          return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>

      {/* ── Sidebar ── */}
      <aside
        className="sidebar-texture flex flex-col shrink-0 h-full border-r"
        style={{ width: 220, borderColor: '#1E293B' }}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b" style={{ borderColor: '#1E293B' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: '#A5B4FC' }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">CivilPrep</div>
              <div className="text-[10px]" style={{ color: '#475569' }}>Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {['platform', 'content'].map(group => (
            <div key={group}>
              <div className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: '#334155' }}>
                {group === 'platform' ? 'Platform' : 'Content'}
              </div>
              {NAV.filter(n => n.group === group).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`nav-item w-full text-left ${activeTab === id ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t p-3" style={{ borderColor: '#1E293B' }}>
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="avatar w-7 h-7 text-xs shrink-0"
              style={{ background: '#6366F1', color: 'white' }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{adminName}</div>
              <div className="text-[10px] truncate" style={{ color: '#475569' }}>{adminEmail}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 p-1 rounded transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="h-12 flex items-center justify-between px-6 border-b shrink-0"
          style={{ background: 'white', borderColor: '#E2E8F0' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>{currentNav?.label}</span>
          </div>
          <div
            className="text-xs font-medium px-2 py-1 rounded"
            style={{ background: '#F1F5F9', color: '#64748B' }}
          >
            Gyankunj Academy · Betul
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function ScheduledPlaceholder() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Scheduled Events</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Manage live, time-gated All India Mock Tests.</p>
      </div>
      <div
        className="panel p-16 flex flex-col items-center justify-center text-center"
        style={{ borderStyle: 'dashed' }}
      >
        <CalendarClock className="w-10 h-10 mb-4" style={{ color: '#CBD5E1' }} />
        <h3 className="text-sm font-semibold mb-1" style={{ color: '#475569' }}>Live Events Module</h3>
        <p className="text-xs max-w-xs" style={{ color: '#94A3B8' }}>
          This module will handle the logic for setting up live, time-gated "All India Mock Tests". Coming soon.
        </p>
      </div>
    </div>
  );
}