'use client';

import {
  Trophy,
  Medal,
  Crown,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export interface LeaderboardEntry {
  id: string;
  name: string;
  testsTaken: number;
  averageScore: number;
  percentile?: number;
}

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

export default function LeaderboardTable({
  data,
}: LeaderboardTableProps) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((student) =>
      student.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8">

      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">

          <div>
            <h2 className="text-3xl font-black text-white">
              Leaderboard Rankings
            </h2>

            <p className="text-white/50 mt-1">
              Compare your performance with other aspirants.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">

            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />

            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                pl-11
                pr-4
                py-3
                rounded-xl
                bg-white/5
                border
                border-white/10
                text-white
                placeholder:text-white/40
                focus:outline-none
                focus:border-emerald-500/40
              "
            />

          </div>

        </div>

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 text-xs uppercase tracking-widest text-white/40 font-bold border-b border-white/10">

          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Student</div>
          <div className="col-span-2">Tests</div>
          <div className="col-span-2">Average</div>
          <div className="col-span-3">Percentile</div>

        </div>

        {/* Table Rows */}
        <div className="space-y-3 mt-4">

          {filteredData.map((student, index) => (
            <div
              key={student.id}
              className="
                grid
                md:grid-cols-12
                gap-4
                items-center
                bg-white/5
                hover:bg-white/10
                border
                border-white/10
                rounded-2xl
                p-4
                transition-all
                duration-300
              "
            >

              {/* Rank */}
              <div className="md:col-span-1 flex items-center gap-2">

                {index === 0 ? (
                  <Crown className="w-5 h-5 text-yellow-400" />
                ) : index === 1 ? (
                  <Medal className="w-5 h-5 text-slate-300" />
                ) : index === 2 ? (
                  <Trophy className="w-5 h-5 text-orange-400" />
                ) : (
                  <span className="text-white/70 font-bold">
                    #{index + 1}
                  </span>
                )}

              </div>

              {/* Student */}
              <div className="md:col-span-4">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 flex items-center justify-center text-white font-black">
                    {student.name.charAt(0)}
                  </div>

                  <div>
                    <div className="font-bold text-white">
                      {student.name}
                    </div>

                    <div className="text-xs text-white/40">
                      CivilPrep Aspirant
                    </div>
                  </div>

                </div>

              </div>

              {/* Tests */}
              <div className="md:col-span-2 text-white font-semibold">
                {student.testsTaken}
              </div>

              {/* Average */}
              <div className="md:col-span-2">

                <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-bold">
                  {student.averageScore}%
                </span>

              </div>

              {/* Percentile */}
              <div className="md:col-span-3">

                <div className="flex items-center gap-3">

                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">

                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                      style={{
                        width: `${student.percentile || 0}%`,
                      }}
                    />

                  </div>

                  <span className="text-sm text-white font-semibold">
                    {student.percentile || 0}%
                  </span>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}