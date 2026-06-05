'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import AiQuizBuilder from './AiQuizBuilder';
import { 
  LayoutDashboard, FileQuestion, Users, FileText, 
  CreditCard, Sparkles, CalendarClock, TableProperties, 
  Trash2, Eye, EyeOff, Plus
} from 'lucide-react';

// Define the tabs based on your original admin navigation[cite: 1]
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ quizzes: 0, students: 0, attempts: 0, revenue: 0 });
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      // 1. Authenticate and verify Admin role[cite: 1]
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.email !== 'admin@civilprep.in') {
        router.push('/');
        return;
      }

      // 2. Fetch Dashboard Overview Stats[cite: 1]
      const [
        { count: quizCount }, 
        { count: studentCount }, 
        { count: attemptCount },
        { data: payments },
        { data: quizzesData }
      ] = await Promise.all([
        supabase.from('quizzes').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
        supabase.from('attempts').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'verified'),
        supabase.from('quizzes').select('*').order('created_at', { ascending: false })
      ]);

      const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        quizzes: quizCount || 0,
        students: studentCount || 0,
        attempts: attemptCount || 0,
        revenue: totalRevenue
      });

      if (quizzesData) setQuizzes(quizzesData);
      setLoading(false);
    }

    loadAdminData();
  }, [router]);

  // Quiz Actions[cite: 1]
  const toggleQuizStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('quizzes').update({ active: !currentStatus }).eq('id', id);
    if (!error) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, active: !currentStatus } : q));
    } else {
      alert('Failed to update quiz status.');
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (!error) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    } else {
      alert('Failed to delete quiz.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <div className="mb-6 px-2">
          <h1 className="text-2xl font-bold text-emerald-950 font-serif">Admin Panel</h1>
          <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mt-1">Gyankunj Academy</p>
        </div>
        
        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20' 
                    : 'bg-white/40 text-gray-600 hover:bg-white/70 border border-white/50 backdrop-blur-sm'
                }`}
              >
                <Icon className={`w-5 h-5 ${tab.id === 'aigen' && !isActive ? 'text-orange-500' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 animate-fade-in">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-emerald-700 font-serif">{stats.quizzes}</div>
                <div className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Total Quizzes</div>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-blue-700 font-serif">{stats.students}</div>
                <div className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Students</div>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-purple-700 font-serif">{stats.attempts}</div>
                <div className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Responses</div>
              </div>
              <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-orange-600 font-serif">₹{stats.revenue}</div>
                <div className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-wider">Revenue</div>
              </div>
            </div>
            
            <div className="glass-card p-8 text-center mt-8 border-dashed border-2 border-emerald-900/20">
              <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to the New Admin Dashboard</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Navigate using the sidebar to manage quizzes, view student responses, verify UPI payments, or generate new quizzes instantly using Google Gemini AI.
              </p>
            </div>
          </div>
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-emerald-950 font-serif">Manage Quizzes</h2>
              <button className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all">
                <Plus className="w-4 h-4" /> New Quiz
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {quizzes.length === 0 ? (
                <div className="glass-card p-8 text-center text-gray-500 text-sm font-semibold">No quizzes found. Create one to get started.</div>
              ) : (
                quizzes.map(quiz => (
                  <div key={quiz.id} className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{quiz.title}</h3>
                      {quiz.title_hi && <p className="text-sm text-gray-500 font-serif">{quiz.title_hi}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{quiz.category}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{quiz.section || 'GS'}</span>
                        {quiz.is_paid 
                          ? <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md">Paid (₹{quiz.price})</span>
                          : <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Free</span>
                        }
                        <span className={`px-2 py-1 rounded-md ${quiz.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {quiz.active ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => toggleQuizStatus(quiz.id, quiz.active)}
                        className="p-2 bg-white/60 hover:bg-white border border-gray-200 rounded-lg text-gray-700 transition-colors tooltip"
                        title={quiz.active ? 'Unpublish' : 'Publish'}
                      >
                        {quiz.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteQuiz(quiz.id)}
                        className="p-2 bg-white/60 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-lg text-gray-700 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

       {activeTab === 'aigen' && (
          <AiQuizBuilder/>
        )}

        
        {['resources', 'students', 'payments', 'scheduled', 'csvimport'].includes(activeTab) && (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-emerald-900/20">
            <h3 className="text-xl font-bold text-emerald-900 mb-2 capitalize font-serif">{activeTab}</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md">
              This module handles the dedicated logic for {activeTab}.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}