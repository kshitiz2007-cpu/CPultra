'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileQuestion, CreditCard,
  FolderOpen, Sparkles, Upload, LogOut, BookOpen, ChevronRight
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import StudentsManager from './StudentsManager';
import QuizManager from './QuizManager';
import PaymentsManager from './PaymentsManager';
import ResourceManager from './ResourceManager';
import AiQuizBuilder from './AiQuizBuilder';
import CsvImporter from './CsvImporter';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',     icon: LayoutDashboard, group: 'main' },
  { id: 'students',  label: 'Students',     icon: Users,           group: 'main' },
  { id: 'quizzes',   label: 'Quizzes',      icon: FileQuestion,    group: 'main' },
  { id: 'payments',  label: 'Payments',     icon: CreditCard,      group: 'main' },
  { id: 'resources', label: 'Resources',    icon: FolderOpen,      group: 'content' },
  { id: 'ai-builder',label: 'AI Builder',   icon: Sparkles,        group: 'content' },
  { id: 'csv-import',label: 'CSV Import',   icon: Upload,          group: 'content' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminName, setAdminName] = useState('Admin');
  const [adminEmail, setAdminEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminEmail(user.email || '');
        setAdminName(user.user_metadata?.full_name?.split(' ')[0] || 'Admin');
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const currentNav = NAV_ITEMS.find(n => n.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':   return <AdminOverview />;
      case 'students':   return <StudentsManager />;
      case 'quizzes':    return <QuizManager />;
      case 'payments':   return <PaymentsManager />;
      case 'resources':  return <ResourceManager />;
      case 'ai-builder': return <AiQuizBuilder />;
      case 'csv-import': return <CsvImporter />;
      default:           return <AdminOverview />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className="sidebar-texture flex flex-col w-[220px] shrink-0 h-full border-r"
        style={{ borderColor: '#1E293B' }}
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
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white leading-tight truncate">CivilPrep</div>
              <div className="text-[10px] truncate" style={{ color: '#475569' }}>Admin Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-1">
            <div
              className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase mb-1"
              style={{ color: '#334155' }}
            >
              Platform
            </div>
            {NAV_ITEMS.filter(n => n.group === 'main').map(({ id, label, icon: Icon }) => (
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

          <div className="mt-3">
            <div
              className="px-2 py-1 text-[9px] font-bold tracking-widest uppercase mb-1"
              style={{ color: '#334155' }}
            >
              Content
            </div>
            {NAV_ITEMS.filter(n => n.group === 'content').map(({ id, label, icon: Icon }) => (
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
        </nav>

        {/* User footer */}
        <div className="border-t p-3" style={{ borderColor: '#1E293B' }}>
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#6366F1', color: 'white' }}
            >
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{adminName}</div>
              <div className="text-[10px] truncate" style={{ color: '#475569' }}>{adminEmail}</div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="shrink-0 p-1 rounded transition-colors"
              style={{ color: '#475569' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="h-12 flex items-center justify-between px-6 border-b shrink-0"
          style={{ background: 'white', borderColor: '#E2E8F0' }}
        >
          <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
            <span>Admin</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>{currentNav?.label}</span>
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded" style={{ background: '#F1F5F9', color: '#64748B' }}>
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