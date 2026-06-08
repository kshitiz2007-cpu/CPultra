'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LeaderboardHero from '@/components/leaderboard/LeaderboardHero';
import TopThree from '@/components/leaderboard/TopThree';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

import {
  ArrowLeft,
  Trophy,
} from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();

  // 1. Properly initialize local states
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Wrap your data-fetching logic inside a useEffect hook
  useEffect(() => {
   async function fetchLeaderboard() {
  try {
    setLoading(true);

    const { data: attempts, error } = await supabase
      .from('attempts')
      .select(`
        user_id,
        user_name,
        score,
        completed_at
      `);

    if (error) throw error;

    const grouped: Record<string, any> = {};

    attempts?.forEach((attempt) => {
      const userId = attempt.user_id;

      if (!grouped[userId]) {
        grouped[userId] = {
          id: userId,
          name: attempt.user_name || 'Student',
          testsTaken: 0,
          totalScore: 0,
        };
      }

      grouped[userId].testsTaken += 1;
      grouped[userId].totalScore += attempt.score || 0;
    });

    const leaderboard = Object.values(grouped)
      .map((user: any) => ({
        ...user,
        averageScore: Math.round(
          user.totalScore / user.testsTaken
        ),
      }))
      .sort(
        (a: any, b: any) =>
          b.averageScore - a.averageScore
      )
      .map((user: any, index: number) => ({
        ...user,
        rank: index + 1,
        percentile:
          100 -
          Math.round(
            (index / Math.max(1, Object.keys(grouped).length)) * 100
          ),
      }));

    setLeaderboardData(leaderboard);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const me = leaderboard.find(
        (u: any) => u.id === user.id
      );

      setCurrentUser(me || null);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // 3. Prevent rendering errors while async data is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-xl font-medium animate-pulse">Loading Rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* Aurora Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-orange-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">

          <button
            onClick={() => router.back()}
            className="
              flex items-center gap-2
              px-4 py-2
              rounded-xl
              bg-white/5
              border border-white/10
              hover:bg-white/10
              transition-all
            "
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2 text-yellow-400 font-bold">
            <Trophy className="w-5 h-5" />
            CivilPrep Rankings
          </div>

        </div>

        {/* Hero */}
        <LeaderboardHero
          userRank={currentUser?.rank || 0}
          averageScore={currentUser?.average_score || 0}
          totalTests={currentUser?.tests_taken || 0}
          percentile={currentUser?.percentile || 0}
        />

        {/* Top Three Component mapped cleanly */}
        <TopThree
          first={
            leaderboardData[0]
              ? {
                  id: leaderboardData[0].id,
                  name: leaderboardData[0].name,
                  score: leaderboardData[0].average_score,
                  testsTaken: leaderboardData[0].tests_taken,
                }
              : undefined
          }
          second={
            leaderboardData[1]
              ? {
                  id: leaderboardData[1].id,
                  name: leaderboardData[1].name,
                  score: leaderboardData[1].average_score,
                  testsTaken: leaderboardData[1].tests_taken,
                }
              : undefined
          }
          third={
            leaderboardData[2]
              ? {
                  id: leaderboardData[2].id,
                  name: leaderboardData[2].name,
                  score: leaderboardData[2].average_score,
                  testsTaken: leaderboardData[2].tests_taken,
                }
              : undefined
          }
        />

        {/* User Rank Card: Conditionally rendered only if active user is found */}
        {currentUser && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>
                <h2 className="text-2xl font-black">
                  Your Position
                </h2>

                <p className="text-white/50 mt-1">
                  Keep improving to climb the leaderboard.
                </p>
              </div>

              <div className="flex gap-4">

                <div className="bg-white/5 rounded-xl p-4 min-w-[120px]">
                  <div className="text-white/50 text-sm">
                    Rank
                  </div>

                  <div className="text-3xl font-black text-yellow-400">
                    #{currentUser.rank}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 min-w-[120px]">
                  <div className="text-white/50 text-sm">
                    Percentile
                  </div>

                  <div className="text-3xl font-black text-emerald-400">
                    {currentUser.percentile}%
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Full Rankings Table */}
        <LeaderboardTable
          data={leaderboardData}
        />

      </div>

    </div>
  );
}