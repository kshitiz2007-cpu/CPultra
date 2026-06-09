'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  FileQuestion, Loader2, Trash2, 
  ToggleLeft, ToggleRight, FolderOpen, LayoutGrid
} from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  category: string;
  time_limit: number;
  active: boolean;
  created_at: string;
}

const CATEGORIES = [
  'History', 'Geography', 'Polity', 'Economy',
  'Science & Tech', 'Environment', 'Current Affairs',
  'Maths', 'Reasoning', 'GS'
];

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setQuizzes(data);
    setLoading(false);
  };

  const handleUpdateCategory = async (id: string, newCat: string) => {
    setActionLoadingId(id);
    const { error } = await supabase.from('quizzes').update({ category: newCat }).eq('id', id);
    if (!error) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, category: newCat } : q));
      showSuccess(id);
    } else alert("Failed to update category.");
    setActionLoadingId(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setActionLoadingId(id);
    const newStatus = !currentStatus;
    const { error } = await supabase.from('quizzes').update({ active: newStatus }).eq('id', id);
    if (!error) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, active: newStatus } : q));
      showSuccess(id);
    } else alert("Failed to update status.");
    setActionLoadingId(null);
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz forever? This will also delete all student attempts for this quiz!')) return;
    setActionLoadingId(id);
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (!error) {
      setQuizzes(quizzes.filter(q => q.id !== id));
    } else alert("Failed to delete quiz.");
    setActionLoadingId(null);
  };

  const showSuccess = (id: string) => {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full pb-20 text-white">
      <div>
        <h1 className="text-4xl font-black text-white">Manage Quizzes</h1>
        <p className="text-white/60 mt-2">Organize existing modules and manage platform visibility</p>
      </div>

      <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-6 border-b border-white/10 bg-white/[0.02]">
           <h3 className="font-black flex items-center gap-2 text-xl text-white">
             <FileQuestion className="w-6 h-6 text-emerald-400" /> Organize Existing Quizzes
           </h3>
           <p className="text-sm text-white/50 mt-1">Instantly move old quizzes to valid subject folders and toggle visibility.</p>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-white/[0.04] text-xs uppercase text-white/40 border-b border-white/10 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Subject Folder (Move)</th>
                  <th className="px-6 py-4 text-center">Visibility</th>
                  <th className="px-6 py-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-transparent">
                {quizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-white line-clamp-1">{q.title}</div>
                      <div className="text-[10px] text-emerald-400 mt-1 font-bold uppercase tracking-widest">{q.time_limit} mins</div>
                    </td>

                    {/* Category Dropdown */}
                    <td className="px-6 py-4">
                      <select 
                        className={`p-2.5 rounded-xl text-sm font-bold border transition-colors outline-none cursor-pointer bg-[#0f172a] text-white ${successId === q.id ? 'border-emerald-500 text-emerald-400' : 'border-white/10 hover:border-white/20'}`}
                        value={q.category || ''}
                        onChange={(e) => handleUpdateCategory(q.id, e.target.value)}
                        disabled={actionLoadingId === q.id}
                      >
                        {!CATEGORIES.includes(q.category) && <option value={q.category} className="bg-[#0f172a]">{q.category} (Old)</option>}
                        {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#0f172a]">{cat}</option>)}
                      </select>
                    </td>

                    {/* Active/Draft Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleActive(q.id, q.active)}
                        disabled={actionLoadingId === q.id}
                        className={`flex items-center justify-center w-28 mx-auto gap-2 p-2 rounded-xl border transition-all ${q.active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}
                      >
                        {q.active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-white/20" />}
                        <span className="text-xs font-bold uppercase">{q.active ? 'Active' : 'Draft'}</span>
                      </button>
                    </td>

                    {/* Delete Button */}
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteQuiz(q.id)} disabled={actionLoadingId === q.id} className="p-2 bg-white/5 rounded-xl border border-white/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/30 transition-colors shadow-sm">
                        {actionLoadingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
