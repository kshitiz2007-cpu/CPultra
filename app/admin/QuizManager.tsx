'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileQuestion, Save, Clock, Loader2, Layers } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  category: string;
  section: string; // Used as Subsection
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Local state to handle typing in the subsection text box without causing lag
  const [localSections, setLocalSections] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quizzes')
      .select('id, title, category, section, time_limit, active, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      setQuizzes(data);
      // Populate local state for the input fields
      const sectionsMap: Record<string, string> = {};
      data.forEach(q => sectionsMap[q.id] = q.section || '');
      setLocalSections(sectionsMap);
    }
    setLoading(false);
  };

  const handleCategoryChange = async (quizId: string, newCategory: string) => {
    setUpdatingId(quizId);
    const { error } = await supabase.from('quizzes').update({ category: newCategory }).eq('id', quizId);
    if (!error) setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, category: newCategory } : q));
    setUpdatingId(null);
  };

  // Save the custom subsection string to the DB
  const saveSubsection = async (quizId: string) => {
    const newSection = localSections[quizId];
    setUpdatingId(quizId);
    const { error } = await supabase.from('quizzes').update({ section: newSection }).eq('id', quizId);
    if (!error) {
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, section: newSection } : q));
    } else {
      alert("Failed to save subsection.");
    }
    setUpdatingId(null);
  };

  const toggleStatus = async (quizId: string, currentStatus: boolean) => {
    setUpdatingId(quizId);
    const { error } = await supabase.from('quizzes').update({ active: !currentStatus }).eq('id', quizId);
    if (!error) setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, active: !currentStatus } : q));
    setUpdatingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 font-serif tracking-tight flex items-center gap-3">
            <FileQuestion className="w-8 h-8 text-emerald-600" /> Manage Curriculum
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Re-assign quizzes to specific subjects and type custom Subsections (e.g., "Ancient History").
          </p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm overflow-hidden">
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
          ) : quizzes.length === 0 ? (
            <div className="p-16 text-center text-gray-500 font-bold">No quizzes found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 text-[11px] uppercase text-gray-500 font-bold tracking-wider border-b border-white/60">
                <tr>
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Subject Folder</th>
                  <th className="px-6 py-4">Subsection (Type & Save)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-white/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{quiz.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" /> {quiz.time_limit} mins
                      </div>
                    </td>
                    
                    {/* Category Dropdown */}
                    <td className="px-6 py-4">
                      <select 
                        value={quiz.category}
                        onChange={(e) => handleCategoryChange(quiz.id, e.target.value)}
                        disabled={updatingId === quiz.id}
                        className="text-sm font-bold px-3 py-2 rounded-xl transition-all outline-none cursor-pointer bg-white/60 text-emerald-800 border border-emerald-200"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>

                    {/* Custom Subsection Text Input */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text"
                            placeholder="e.g. Ancient India"
                            value={localSections[quiz.id] || ''}
                            onChange={(e) => setLocalSections({...localSections, [quiz.id]: e.target.value})}
                            className="glass-input pl-9 pr-3 py-2 text-sm w-48 rounded-xl font-semibold text-gray-700"
                          />
                        </div>
                        {/* Only show Save button if the text has changed from the database */}
                        {localSections[quiz.id] !== (quiz.section || '') && (
                          <button 
                            onClick={() => saveSubsection(quiz.id)}
                            className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-colors shadow-sm font-bold flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(quiz.id, quiz.active)}
                        disabled={updatingId === quiz.id}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm border ${
                          quiz.active 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {quiz.active ? 'Published' : 'Draft'}
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