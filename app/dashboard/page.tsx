'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, Clock, FileText, ChevronRight, CheckCircle } from 'lucide-react';

// Interfaces based on your Supabase schema
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  section: string;
  time_limit: number;
  questions: any[];
  is_paid: boolean;
  price: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeSection, setActiveSection] = useState('All');
  const [quizFilter, setQuizFilter] = useState<'available' | 'completed'>('available');

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Fetch Session & Profile
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      setUser(profile);

      // 2. Fetch Quizzes and Attempts[cite: 1]
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', session.user.id);

      if (quizzesData) setQuizzes(quizzesData);
      if (attemptsData) setAttempts(attemptsData);
      
      setLoading(false);
    }

    loadDashboardData();
  }, [router]);

  // Derived Stats[cite: 1]
  const totalAttempted = attempts.length;
  const avgScore = totalAttempted > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempted) 
    : 0;

  // Formatting Date
  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Filter Logic[cite: 1]
  const attemptedIds = new Set(attempts.map(a => a.quiz_id));
  const filteredQuizzes = quizzes.filter(q => {
    const matchStatus = quizFilter === 'available' ? !attemptedIds.has(q.id) : attemptedIds.has(q.id);
    const matchSection = activeSection === 'All' ? true : (q.section || 'GS') === activeSection;
    return matchStatus && matchSection;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      {/* Greeting Section[cite: 1] */}
      <div className="mb-8 animate-fade-in">
        <p className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-1">Good day,</p>
        <h1 className="text-3xl font-bold text-emerald-950 font-serif">{user?.name || 'Student'}</h1>
        <p className="text-sm text-gray-500 mt-1">{todayDate}</p>
      </div>

      {/* Stats Grid[cite: 1] */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <BookOpen className="w-8 h-8 text-emerald-600 mb-3 opacity-80" />
          <div className="text-4xl font-bold text-emerald-900 font-serif">{totalAttempted}</div>
          <div className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Quizzes Taken</div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <Award className="w-8 h-8 text-orange-500 mb-3 opacity-80" />
          <div className="text-4xl font-bold text-emerald-900 font-serif">{totalAttempted > 0 ? `${avgScore}%` : '-'}</div>
          <div className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Avg. Score</div>
        </div>
      </div>

      {/* Section Tabs[cite: 1] */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide animate-fade-in" style={{ animationDelay: '200ms' }}>
        {['All', 'Maths', 'Reasoning', 'GS', 'CA'].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`whitespace-nowrap px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
              activeSection === section 
                ? 'bg-emerald-800 text-white shadow-emerald-900/20' 
                : 'bg-white/50 text-gray-600 hover:bg-white/80 border border-white/60 backdrop-blur-sm'
            }`}
          >
            {section === 'CA' ? 'Curr. Affairs' : section}
          </button>
        ))}
      </div>

      {/* Available / Completed Toggle[cite: 1] */}
      <div className="flex gap-3 mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <button 
          onClick={() => setQuizFilter('available')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${quizFilter === 'available' ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200' : 'bg-transparent text-gray-500 border-2 border-transparent hover:bg-white/40'}`}
        >
          Available
        </button>
        <button 
          onClick={() => setQuizFilter('completed')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${quizFilter === 'completed' ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-200' : 'bg-transparent text-gray-500 border-2 border-transparent hover:bg-white/40'}`}
        >
          Completed
        </button>
      </div>

      {/* Quiz List[cite: 1] */}
      <div className="flex flex-col gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
        {filteredQuizzes.length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-900/20">
            <CheckCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">No quizzes here</h3>
            <p className="text-sm text-gray-500">Check back later for new material.</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div 
              key={quiz.id} 
              onClick={() => router.push(`/quiz/${quiz.id}`)}
              className="glass-card p-5 flex items-center justify-between cursor-pointer hover:-translate-y-1 hover:shadow-2xl transition-all group"
            >
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-950 mb-2 group-hover:text-emerald-700 transition-colors">{quiz.title}</h3>
                
                <div className="flex items-center flex-wrap gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {quiz.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white/60 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" /> {quiz.time_limit}m
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-white/60 px-2 py-1 rounded-md">
                    <FileText className="w-3 h-3" /> {quiz.questions?.length || 0} Qs
                  </span>
                  {quiz.is_paid && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
                      ₹{quiz.price}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors ml-4 shrink-0">
                <ChevronRight className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}