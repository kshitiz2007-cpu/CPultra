'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Search, Loader2, Mail, BookOpen, Award, 
  User, ShieldBan, MoreVertical 
} from 'lucide-react';

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
      
      // 1. Fetch all non-admin profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('created_at', { ascending: false });

      // 2. Fetch all attempts to calculate stats
      const { data: attempts } = await supabase
        .from('attempts')
        .select('user_id, score');

      if (profiles && attempts) {
        // 3. Map attempts to profiles
        const statsMap: Record<string, { totalScore: number, count: number }> = {};
        attempts.forEach(a => {
          if (!statsMap[a.user_id]) statsMap[a.user_id] = { totalScore: 0, count: 0 };
          statsMap[a.user_id].totalScore += a.score;
          statsMap[a.user_id].count += 1;
        });

        const mergedData: StudentData[] = profiles.map(p => {
          const stats = statsMap[p.id] || { totalScore: 0, count: 0 };
          return {
            id: p.id,
            name: p.name || 'Unknown Student',
            email: p.email,
            created_at: p.created_at,
            total_quizzes: stats.count,
            avg_score: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0
          };
        });

        setStudents(mergedData);
      }
      setLoading(false);
    }

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 font-serif tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" /> Student Directory
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Manage your {students.length} registered learners
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="glass-input w-full pl-11 py-3 text-sm rounded-2xl shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Directory Area */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center opacity-60">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-800">No students found</h3>
              <p className="text-sm text-gray-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 text-[10px] uppercase text-gray-500 font-bold tracking-widest border-b border-white/60">
                <tr>
                  <th className="px-6 py-5">Student Profile</th>
                  <th className="px-6 py-5">Engagement</th>
                  <th className="px-6 py-5">Joined Date</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/50 transition-colors group">
                    
                    {/* Profile Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-base">{student.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stats Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tests</span>
                          <span className="flex items-center gap-1.5 font-bold text-gray-800 bg-white/60 px-2.5 py-1 rounded-lg border border-white">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> {student.total_quizzes}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Avg Score</span>
                          <span className="flex items-center gap-1.5 font-bold text-gray-800 bg-white/60 px-2.5 py-1 rounded-lg border border-white">
                            <Award className="w-3.5 h-3.5 text-amber-500" /> {student.avg_score}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium">
                        {new Date(student.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={`mailto:${student.email}`}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors border border-blue-100"
                          title="Email Student"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button 
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100"
                          title="Suspend Account (Coming Soon)"
                          onClick={() => alert("Suspension module integration required via Supabase Edge Functions.")}
                        >
                          <ShieldBan className="w-4 h-4" />
                        </button>
                      </div>
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