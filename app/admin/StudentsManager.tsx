'use client';

// CivilPrep StudentsManager V2
// Premium dark dashboard version

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  Search,
  Loader2,
  Mail,
  BookOpen,
  Award,
  TrendingUp,
  UserCheck,
  ShieldBan,
} from 'lucide-react';

interface StudentData {
  id:string;
  name:string;
  email:string;
  created_at:string;
  total_quizzes:number;
  avg_score:number;
}

export default function StudentsManager() {
  const [students,setStudents] = useState<StudentData[]>([]);
  const [loading,setLoading] = useState(true);
  const [searchQuery,setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('role','admin');

      const { data: attempts } = await supabase
        .from('attempts')
        .select('user_id,score');

      if (profiles && attempts) {
        const stats:any = {};

        attempts.forEach((a:any)=>{
          if(!stats[a.user_id]) stats[a.user_id]={score:0,count:0};
          stats[a.user_id].score += a.score;
          stats[a.user_id].count += 1;
        });

        setStudents(
          profiles.map((p:any)=>({
            id:p.id,
            name:p.name || 'Unknown Student',
            email:p.email,
            created_at:p.created_at,
            total_quizzes:stats[p.id]?.count || 0,
            avg_score:stats[p.id]
              ? Math.round(stats[p.id].score / stats[p.id].count)
              : 0,
          }))
        );
      }

      setLoading(false);
    }

    fetchStudents();
  },[]);

  const filteredStudents = useMemo(
    () =>
      students.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [students, searchQuery]
  );

  const avgPlatformScore =
    students.length > 0
      ? Math.round(
          students.reduce((a,b)=>a+b.avg_score,0) / students.length
        )
      : 0;

  const totalAttempts = students.reduce(
    (a,b)=>a+b.total_quizzes,
    0
  );

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-black text-white">
          Students Dashboard
        </h1>
        <p className="text-white/60 mt-2">
          Analytics and learner management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <Users className="w-6 h-6 text-blue-400 mb-3" />
          <div className="text-4xl font-black text-white">
            {students.length}
          </div>
          <div className="text-white/50 mt-2">
            Total Students
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <UserCheck className="w-6 h-6 text-emerald-400 mb-3" />
          <div className="text-4xl font-black text-white">
            {students.filter(s=>s.total_quizzes>0).length}
          </div>
          <div className="text-white/50 mt-2">
            Active Students
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <Award className="w-6 h-6 text-amber-400 mb-3" />
          <div className="text-4xl font-black text-white">
            {avgPlatformScore}%
          </div>
          <div className="text-white/50 mt-2">
            Avg Score
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <TrendingUp className="w-6 h-6 text-purple-400 mb-3" />
          <div className="text-4xl font-black text-white">
            {totalAttempts}
          </div>
          <div className="text-white/50 mt-2">
            Total Attempts
          </div>
        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={searchQuery}
            onChange={(e)=>setSearchQuery(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-11 p-3 rounded-xl bg-white/5 border border-white/10 text-white"
          />
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-white/10 text-white/50">
              <tr>
                <th className="py-4">Student</th>
                <th>Attempts</th>
                <th>Average</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.map(student => (
                <tr
                  key={student.id}
                  className="border-b border-white/5 hover:bg-white/5"
                >

                  <td className="py-4">
                    <div>
                      <div className="font-semibold text-white">
                        {student.name}
                      </div>
                      <div className="text-sm text-white/50">
                        {student.email}
                      </div>
                    </div>
                  </td>

                  <td className="text-white">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      {student.total_quizzes}
                    </div>
                  </td>

                  <td className="text-emerald-400 font-bold">
                    {student.avg_score}%
                  </td>

                  <td className="text-white/60">
                    {new Date(student.created_at).toLocaleDateString()}
                  </td>

                  <td>
                    <div className="flex gap-2 justify-end">
                      <a
                        href={`mailto:${student.email}`}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400"
                      >
                        <Mail className="w-4 h-4" />
                      </a>

                      <button
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400"
                      >
                        <ShieldBan className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
