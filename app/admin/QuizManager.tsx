'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FileQuestion, Loader2, Trash2, CheckCircle, Clock } from 'lucide-react';

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
  'Maths', 'Reasoning', 'GS',
];

export default function QuizManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setQuizzes(data);
    setLoading(false);
  };

  const flash = (id: string) => {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 2000);
  };

  const handleUpdateCategory = async (id: string, cat: string) => {
    setActionId(id);
    const { error } = await supabase.from('quizzes').update({ category: cat }).eq('id', id);
    if (!error) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, category: cat } : q));
      flash(id);
    } else alert('Failed to update category.');
    setActionId(null);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setActionId(id);
    const next = !current;
    const { error } = await supabase.from('quizzes').update({ active: next }).eq('id', id);
    if (!error) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, active: next } : q));
      flash(id);
    } else alert('Failed to update status.');
    setActionId(null);
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz? This will also remove all student attempts.')) return;
    setActionId(id);
    const { error } = await supabase.from('quizzes').delete().eq('id', id);
    if (!error) setQuizzes(quizzes.filter(q => q.id !== id));
    else alert('Failed to delete quiz.');
    setActionId(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Quizzes</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Manage categories and visibility for all {quizzes.length} quizzes.
        </p>
      </div>

      <div className="panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin mb-3" style={{ color: '#6366F1' }} />
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Loading quizzes…</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#94A3B8' }}>
            <FileQuestion className="w-8 h-8 mb-3" />
            <p className="text-sm font-medium">No quizzes yet</p>
            <p className="text-xs mt-1">Use AI Builder or CSV Import to add quizzes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'center' }}>Duration</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map(q => (
                  <tr key={q.id}>
                    {/* Title */}
                    <td>
                      <div className="text-sm font-semibold" style={{ color: '#0F172A', maxWidth: 280 }}>
                        <span className="line-clamp-1">{q.title}</span>
                      </div>
                      {successId === q.id && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs" style={{ color: '#059669' }}>
                          <CheckCircle className="w-3 h-3" /> Saved
                        </div>
                      )}
                    </td>

                    {/* Category dropdown */}
                    <td>
                      <select
                        className="form-input"
                        style={{ width: 'auto', minWidth: 140 }}
                        value={q.category || ''}
                        onChange={e => handleUpdateCategory(q.id, e.target.value)}
                        disabled={actionId === q.id}
                      >
                        {!CATEGORIES.includes(q.category) && (
                          <option value={q.category}>{q.category} (old)</option>
                        )}
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>

                    {/* Duration */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                        style={{ background: '#F1F5F9', color: '#64748B' }}
                      >
                        <Clock className="w-3 h-3" /> {q.time_limit}m
                      </span>
                    </td>

                    {/* Toggle */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleActive(q.id, q.active)}
                        disabled={actionId === q.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all"
                        style={
                          q.active
                            ? { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }
                            : { background: '#F8FAFC', color: '#94A3B8', border: '1px solid #E2E8F0' }
                        }
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: q.active ? '#10B981' : '#CBD5E1' }}
                        />
                        {q.active ? 'Visible' : 'Hidden'}
                      </button>
                    </td>

                    {/* Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => deleteQuiz(q.id)}
                        disabled={actionId === q.id}
                        className="btn btn-icon btn-sm"
                        style={{ color: '#EF4444', background: '#FEF2F2' }}
                        title="Delete quiz"
                      >
                        {actionId === q.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}