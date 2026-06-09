'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Loader2, Search, Landmark, Globe,
  Scale, TrendingUp, Microscope, Leaf, Newspaper, Calculator,
  Lightbulb, PlayCircle, Clock, FileText, Award, Layers,
  BookOpen, FolderOpen
} from 'lucide-react';

interface Quiz {
  id: string; title: string; category: string; section: string;
  time_limit: number; questions: any[]; is_paid: boolean; price: number;
}
interface Attempt { quiz_id: string; score: number; }

const SUBJECT_CONFIG = [
  { id: 'History',       group: 'GS',    icon: Landmark,   iconBg: '#FFFBEB', iconColor: '#D97706', accent: '#F59E0B' },
  { id: 'Geography',     group: 'GS',    icon: Globe,      iconBg: '#EFF6FF', iconColor: '#2563EB', accent: '#3B82F6' },
  { id: 'Polity',        group: 'GS',    icon: Scale,      iconBg: '#F5F3FF', iconColor: '#7C3AED', accent: '#8B5CF6' },
  { id: 'Economy',       group: 'GS',    icon: TrendingUp, iconBg: '#ECFDF5', iconColor: '#059669', accent: '#10B981' },
  { id: 'Science & Tech',group: 'GS',    icon: Microscope, iconBg: '#EEF2FF', iconColor: '#4F46E5', accent: '#6366F1' },
  { id: 'Environment',   group: 'GS',    icon: Leaf,       iconBg: '#F0FDF4', iconColor: '#16A34A', accent: '#22C55E' },
  { id: 'Current Affairs',group:'Other', icon: Newspaper,  iconBg: '#FFF1F2', iconColor: '#E11D48', accent: '#F43F5E' },
  { id: 'Maths',         group: 'Other', icon: Calculator, iconBg: '#F0F9FF', iconColor: '#0284C7', accent: '#0EA5E9' },
  { id: 'Reasoning',     group: 'Other', icon: Lightbulb,  iconBg: '#FEFCE8', iconColor: '#CA8A04', accent: '#EAB308' },
];

export default function StudentQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');
      const [{ data: qData }, { data: aData }] = await Promise.all([
        supabase.from('quizzes').select('*').eq('active', true).order('created_at', { ascending: false }),
        supabase.from('attempts').select('quiz_id, score').eq('user_id', session.user.id)
      ]);
      if (qData) setQuizzes(qData);
      if (aData) setAttempts(aData);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const getAttempt = (quizId: string) => attempts.find(a => a.quiz_id === quizId);
  const getQuizCount = (subjectId: string) => quizzes.filter(q => q.category === subjectId).length;

  const filteredQuizzes = quizzes.filter(q => {
    if (!activeSubject) return false;
    return q.category === activeSubject && q.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const groupedQuizzes = filteredQuizzes.reduce((acc, quiz) => {
    const sub = quiz.section && quiz.section !== quiz.category ? quiz.section : 'General Topics';
    if (!acc[sub]) acc[sub] = [];
    acc[sub].push(quiz);
    return acc;
  }, {} as Record<string, Quiz[]>);

  const activeConfig = SUBJECT_CONFIG.find(s => s.id === activeSubject);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>

      {/* Top nav */}
      <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0' }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#6366F1' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold" style={{ color: '#0F172A' }}>CivilPrep</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { label: 'Dashboard', path: '/dashboard', active: false },
              { label: 'Mock Tests', path: '/quizzes', active: true },
              { label: 'Resources', path: '/resources', active: false },
            ].map(({ label, path, active }) => (
              <button key={path} onClick={() => router.push(path)}
                className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                style={{ background: active ? '#EEF2FF' : 'transparent', color: active ? '#6366F1' : '#64748B' }}>
                {label}
              </button>
            ))}
          </nav>
          <button onClick={() => router.push('/dashboard')}
            className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-20 animate-fade-in">

        {/* Page header */}
        <div className="mb-8">
          {activeSubject && (
            <button
              onClick={() => setActiveSubject(null)}
              className="flex items-center gap-1 text-sm font-medium mb-3 transition-colors"
              style={{ color: '#64748B' }}
            >
              <ChevronLeft className="w-4 h-4" /> All subjects
            </button>
          )}
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>
            {activeSubject ? `${activeSubject} Modules` : 'Test Series'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            {activeSubject ? 'Select a chapter test to begin' : 'Choose a subject to view available mock tests'}
          </p>
        </div>

        {/* VIEW 1: Subject folders */}
        {!activeSubject && (
          <div className="space-y-8">
            {['GS', 'Other'].map(group => {
              const subjects = SUBJECT_CONFIG.filter(s => s.group === group);
              return (
                <section key={group}>
                  <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: '#94A3B8' }}>
                    <FolderOpen className="w-3.5 h-3.5" />
                    {group === 'GS' ? 'General Studies' : 'Other Sections'}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subjects.map(({ id, icon: Icon, iconBg, iconColor, accent }) => {
                      const count = getQuizCount(id);
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveSubject(id)}
                          className="panel p-4 text-left transition-all hover:shadow-md hover:-translate-y-0.5 group"
                          style={{ borderBottom: `3px solid ${accent}` }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
                              <Icon className="w-5 h-5" style={{ color: iconColor }} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>
                              {count}
                            </span>
                          </div>
                          <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{id}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* VIEW 2: Quizzes in subject */}
        {activeSubject && (
          <div>
            {/* Search */}
            <div className="search-wrap mb-6">
              <Search className="search-icon w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeSubject} chapters…`}
                className="form-input"
                style={{ paddingLeft: '2.25rem', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {Object.keys(groupedQuizzes).length === 0 ? (
              <div className="panel p-12 text-center" style={{ borderStyle: 'dashed' }}>
                <FileText className="w-8 h-8 mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No modules found for {activeSubject}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedQuizzes).map(([subsection, sectionQuizzes]) => (
                  <div key={subsection}>
                    <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <Layers className="w-4 h-4" style={{ color: activeConfig?.iconColor || '#6366F1' }} />
                      <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>{subsection}</h2>
                      <span className="text-xs" style={{ color: '#94A3B8' }}>{sectionQuizzes.length} tests</span>
                    </div>

                    <div className="space-y-2">
                      {sectionQuizzes.map(quiz => {
                        const pastAttempt = getAttempt(quiz.id);
                        return (
                          <div
                            key={quiz.id}
                            className="panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-shadow hover:shadow-md"
                          >
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold" style={{ color: '#0F172A' }}>{quiz.title}</h3>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                                  <Clock className="w-3 h-3" /> {quiz.time_limit}m
                                </span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: '#94A3B8' }}>
                                  <FileText className="w-3 h-3" /> {quiz.questions?.length || 0} Qs
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {pastAttempt ? (
                                <div
                                  className="px-4 py-2 rounded text-sm font-semibold flex items-center gap-2"
                                  style={{ background: '#ECFDF5', color: '#059669' }}
                                >
                                  <Award className="w-4 h-4" /> {pastAttempt.score}%
                                </div>
                              ) : (
                                <button
                                  onClick={() => router.push(`/quiz/${quiz.id}`)}
                                  className="btn btn-primary flex items-center gap-1.5"
                                >
                                  <PlayCircle className="w-4 h-4" /> Start
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}