'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  FolderOpen, ChevronLeft, Loader2, Search, Landmark, Globe, 
  Scale, TrendingUp, Microscope, Leaf, Newspaper, Calculator, 
  Lightbulb, PlayCircle, Clock, FileText, Award, Layers
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  category: string;
  section: string; // We are now using this as "Subsection"
  time_limit: number;
  questions: any[];
  is_paid: boolean;
  price: number;
}

interface Attempt {
  quiz_id: string;
  score: number;
}

const SUBJECT_CONFIG = [
  { id: 'History', group: 'GS', icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  { id: 'Geography', group: 'GS', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  { id: 'Polity', group: 'GS', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  { id: 'Economy', group: 'GS', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  { id: 'Science & Tech', group: 'GS', icon: Microscope, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  { id: 'Environment', group: 'GS', icon: Leaf, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
  { id: 'Current Affairs', group: 'Other', icon: Newspaper, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
  { id: 'Maths', group: 'Other', icon: Calculator, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
  { id: 'Reasoning', group: 'Other', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
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

      const [ { data: qData }, { data: aData } ] = await Promise.all([
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
    const matchesSubject = q.category === activeSubject;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // GROUP QUIZZES BY SUBSECTION
  const groupedQuizzes = filteredQuizzes.reduce((acc, quiz) => {
    const subsection = quiz.section && quiz.section !== quiz.category ? quiz.section : 'General Topics';
    if (!acc[subsection]) acc[subsection] = [];
    acc[subsection].push(quiz);
    return acc;
  }, {} as Record<string, Quiz[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <button 
          onClick={() => activeSubject ? setActiveSubject(null) : router.push('/dashboard')}
          className="p-3 bg-white/60 hover:bg-white rounded-xl shadow-sm transition-all text-emerald-800 border border-white/60"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-950 tracking-tight">
            {activeSubject ? `${activeSubject} Modules` : 'Test Series Explorer'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {activeSubject ? 'Select a chapter test to begin' : 'Choose a subject to view available mock tests'}
          </p>
        </div>
      </div>

      {/* VIEW 1: MAIN SUBJECT FOLDERS */}
      {!activeSubject && (
        <div className="animate-fade-in space-y-10">
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2 flex items-center gap-2 uppercase tracking-wider text-sm">
              <FolderOpen className="w-5 h-5 text-gray-400" /> General Studies Sections
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SUBJECT_CONFIG.filter(s => s.group === 'GS').map((subject) => {
                const Icon = subject.icon;
                const count = getQuizCount(subject.id);
                return (
                  <div 
                    key={subject.id}
                    onClick={() => setActiveSubject(subject.id)}
                    className={`bg-white/40 backdrop-blur-xl p-5 rounded-[1.5rem] cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all group border border-white/60 border-b-4 ${subject.border}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${subject.bg} ${subject.color} group-hover:scale-110 transition-transform shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="bg-white/80 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-widest">
                        {count} Tests
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {subject.id}
                    </h3>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: SUBSECTIONS & MODULES */}
      {activeSubject && (
        <div className="animate-fade-in">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeSubject} chapters...`} 
              className="glass-input w-full pl-12 py-4 text-lg rounded-[1.5rem]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-8">
            {Object.keys(groupedQuizzes).length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-2 border-emerald-900/10 mt-4 rounded-[2rem]">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No modules found</h3>
                <p className="text-sm text-gray-500">Check back soon for new {activeSubject} tests.</p>
              </div>
            ) : (
              Object.entries(groupedQuizzes).map(([subsection, sectionQuizzes]) => (
                <div key={subsection} className="space-y-4">
                  {/* Subsection Header */}
                  <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2 border-b-2 border-emerald-100 pb-2">
                    <Layers className="w-5 h-5 text-emerald-500" /> {subsection}
                  </h2>
                  
                  {/* Quizzes in this subsection */}
                  <div className="flex flex-col gap-3">
                    {sectionQuizzes.map((quiz) => {
                      const pastAttempt = getAttempt(quiz.id);
                      return (
                        <div key={quiz.id} className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white transition-all group">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors">
                              {quiz.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                                <Clock className="w-3.5 h-3.5 text-emerald-600" /> {quiz.time_limit}m
                              </span>
                              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                                <FileText className="w-3.5 h-3.5 text-blue-600" /> {quiz.questions?.length || 0} Qs
                              </span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 w-full md:w-auto">
                            {pastAttempt ? (
                              <div className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Award className="w-5 h-5" /> Score: {pastAttempt.score}%
                              </div>
                            ) : (
                              <button 
                                onClick={() => router.push(`/quiz/${quiz.id}`)}
                                className="w-full px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-950 hover:bg-emerald-800 text-white transition-colors shadow-md"
                              >
                                <PlayCircle className="w-5 h-5" /> Start Module
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}