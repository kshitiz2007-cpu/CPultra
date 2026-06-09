'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Search, Loader2, Mail, BookOpen, Award, ShieldBan } from 'lucide-react';

interface StudentData {
  id: string;
  name: string;
  email: string;
  created_at: string;
  total_quizzes: number;
  avg_score: number;
}

export default function StudentsManager() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      const { data: attempts } = await supabase
        .from('attempts')
        .select('user_id, score');

      if (profiles && attempts) {
        const statsMap: Record<string, { totalScore: number; count: number }> = {};
        attempts.forEach(a => {
          if (!statsMap[a.user_id]) statsMap[a.user_id] = { totalScore: 0, count: 0 };
          statsMap[a.user_id].totalScore += a.score;
          statsMap[a.user_id].count += 1;
        });

        const merged: StudentData[] = profiles.map(p => {
          const s = statsMap[p.id] || { totalScore: 0, count: 0 };
          return {
            id: p.id,
            name: p.name || 'Unknown Student',
            email: p.email,
            created_at: p.created_at,
            total_quizzes: s.count,
            avg_score: s.count > 0 ? Math.round(s.totalScore / s.count) : 0,
          };
        });
        setStudents(merged);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatarColors = [
    { bg: '#EEF2FF', color: '#6366F1' },
    { bg: '#ECFDF5', color: '#059669' },
    { bg: '#FFFBEB', color: '#B45309' },
    { bg: '#FEF2F2', color: '#DC2626' },
    { bg: '#F0F9FF', color: '#0369A1' },
  ];

  const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Students</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            {students.length} registered learner{students.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="search-wrap w-full sm:w-72">
          <Search className="search-icon w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by name or email…"
            className="form-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#94A3B8' }}>
            <Loader2 className="w-6 h-6 animate-spin mb-3" style={{ color: '#6366F1' }} />
            <p className="text-sm font-medium">Loading students…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#94A3B8' }}>
            <Users className="w-8 h-8 mb-3" />
            <p className="text-sm font-medium">No students found</p>
            <p className="text-xs mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Tests Taken</th>
                  <th>Avg Score</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const { bg, color } = getColor(student.name);
                  const scoreStyle = student.avg_score >= 75
                    ? { color: '#059669' }
                    : student.avg_score >= 50
                    ? { color: '#B45309' }
                    : { color: '#DC2626' };

                  return (
                    <tr key={student.id}>
                      {/* Student profile */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="avatar w-8 h-8 text-xs"
                            style={{ background: bg, color, border: `1px solid ${color}22` }}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                              {student.name}
                            </div>
                            <div className="text-xs" style={{ color: '#94A3B8' }}>
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tests */}
                      <td>
                        <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#475569' }}>
                          <BookOpen className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                          {student.total_quizzes}
                        </div>
                      </td>

                      {/* Avg score */}
                      <td>
                        {student.total_quizzes > 0 ? (
                          <span className="text-sm font-bold" style={scoreStyle}>
                            {student.avg_score}%
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#CBD5E1' }}>—</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td>
                        <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                          {new Date(student.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`mailto:${student.email}`}
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Email student"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            title="Suspend account (coming soon)"
                            onClick={() => alert('Suspension module integration required via Supabase Edge Functions.')}
                            style={{ color: '#EF4444' }}
                          >
                            <ShieldBan className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-right" style={{ color: '#94A3B8' }}>
          Showing {filtered.length} of {students.length} students
        </p>
      )}
    </div>
  );
}