'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  PlayCircle, Clock, BookOpen, Award, 
  Sparkles, Loader2, ArrowRight, Layers, 
  FileText, Target, LogOut, ChevronRight,
  LayoutDashboard, History, Star, Flame, Crown, Trophy
} from 'lucide-react';
import HeroSection from '@/components/dashboard/HeroSection';
import RecommendedResources from '@/components/dashboard/RecommendedResources';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';
import ContinueLearning from '@/components/dashboard/ContinueLearning';
import PerformanceAnalytics from '@/components/dashboard/PerformanceAnalytics';
import AchievementPanel from '@/components/dashboard/AchievementPanel';
import LeaderboardHero from '@/components/leaderboard/LeaderboardHero';
import TopThree from '@/components/leaderboard/TopThree';
import StudentChatWidget from '@/components/StudentChatWidget';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [latestQuizzes, setLatestQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [platformStats, setPlatformStats] = useState({ quizzes: 0, resources: 0 });
  const [loading, setLoading] = useState(true);


   // ======================================================
useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/';
        return;
      }

      // USER PROFILE
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) setUser(profile);

      if (
        profile?.role === 'admin' ||
        session.user.email === 'kshitiz2007@gmail.com'
      ) {
        window.location.href = '/admin';
        return;
      }

      // QUIZZES
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (quizzesData) setLatestQuizzes(quizzesData);

      // USER ATTEMPTS
      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('*')
        .eq('user_id', session.user.id);

      if (attemptsData) setAttempts(attemptsData);

      // RESOURCES
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .limit(4);

      if (resourcesData) setResources(resourcesData);

      // PLATFORM COUNTS
      const { count: quizCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      const { count: resourceCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true });

      setPlatformStats({
        quizzes: quizCount || 0,
        resources: resourceCount || 0,
      });

      // LEADERBOARD
      const { data: attemptsLeaderboard, error } = await supabase
        .from('attempts')
        .select(`
          user_id,
          user_name,
          score
        `);

      if (error) throw error;

      const userStatsMap = new Map();

      (attemptsLeaderboard || []).forEach((attempt: any) => {
        const existing = userStatsMap.get(attempt.user_id);

        if (existing) {
          existing.totalScore += attempt.score || 0;
          existing.testsTaken += 1;
        } else {
          userStatsMap.set(attempt.user_id, {
            id: attempt.user_id,
            name: attempt.user_name || 'Student',
            totalScore: attempt.score || 0,
            testsTaken: 1,
          });
        }
      });

      const leaderboardUsers = Array.from(
        userStatsMap.values()
      ).map((u: any) => ({
        id: u.id,
        name: u.name,
        testsTaken: u.testsTaken,
        averageScore: Math.round(
          u.totalScore / u.testsTaken
        ),
      }));

      leaderboardUsers.sort(
        (a: any, b: any) =>
          b.averageScore - a.averageScore
      );

      const rankedUsers = leaderboardUsers.map(
        (u: any, index: number) => ({
          ...u,
          rank: index + 1,
          percentile:
            leaderboardUsers.length > 1
              ? Math.round(
                  ((leaderboardUsers.length - (index + 1)) /
                    leaderboardUsers.length) *
                    100
                )
              : 100,
        })
      );

      setLeaderboardData(rankedUsers);

      const me = rankedUsers.find(
        (u: any) => u.id === session.user.id
      );

      if (me) {
        setCurrentUser(me);
      }

    } catch (error) {
      console.error(
        'Dashboard crashed while loading data:',
        error
      );
    } finally {
      setLoading(false);
    }
  }

  loadDashboardData();
}, []);
        
     

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const totalAttempted = attempts.length;
  const averageScore = totalAttempted > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempted) 
    : 0;
    
  const getAttemptForQuiz = (quizId: string) => attempts.find(a => a.quiz_id === quizId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden flex selection:bg-emerald-500/30">
      
      {/* Aurora Background Shadows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[25rem] h-[25rem] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* DESKTOP GLASS SIDEBAR */}
      <aside className="hidden md:flex w-72 h-screen flex-col bg-white/[0.02] border-r border-white/10 backdrop-blur-2xl relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        <div className="p-8 pb-6">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 font-serif">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Gyankunj
          </h1>
        </div>

        <nav className="flex-1 px-5 py-4 space-y-3">
          <button className="w-full flex items-center gap-4 px-4 py-4 bg-white/10 text-emerald-300 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          
          <button onClick={() => router.push('/quizzes')} className="w-full flex items-center gap-4 px-4 py-4 text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <Layers className="w-5 h-5 group-hover:text-emerald-300 transition-colors" /> Mock Tests
          </button>
          
          <button onClick={() => router.push('/resources')} className="w-full flex items-center gap-4 px-4 py-4 text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <FileText className="w-5 h-5 group-hover:text-blue-300 transition-colors" /> Study Files
          </button>
          
          <button onClick={() => router.push('/history')} className="w-full flex items-center gap-4 px-4 py-4 text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold transition-all group">
            <History className="w-5 h-5 group-hover:text-amber-300 transition-colors" /> My Results
          </button>
        </nav>

        <div className="p-5 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 mb-4 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner border border-white/20">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate drop-shadow-sm">{user?.name || 'Student'}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 truncate">Pro Member</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl transition-colors font-bold border border-rose-500/20">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MOBILE FLOATING GLASS DOCK */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl z-50 flex justify-between px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <button className="flex flex-col items-center p-2 text-emerald-300 relative">
          <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
          <LayoutDashboard className="w-6 h-6 mb-1 relative z-10" />
          <span className="text-[10px] font-bold relative z-10">Home</span>
        </button>
        <button onClick={() => router.push('/quizzes')} className="flex flex-col items-center p-2 text-white/50 hover:text-white transition-colors">
          <Layers className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Tests</span>
        </button>
        <button onClick={() => router.push('/resources')} className="flex flex-col items-center p-2 text-white/50 hover:text-white transition-colors">
          <FileText className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Files</span>
        </button>
        <button onClick={() => router.push('/history')} className="flex flex-col items-center p-2 text-white/50 hover:text-white transition-colors">
          <History className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">History</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10">
        <div className="max-w-5xl mx-auto p-5 md:p-8 pb-32 md:pb-12 space-y-8 animate-fade-in text-white">
          
          <HeroSection
            userName={user?.name || 'Scholar'}
            testsTaken={totalAttempted}
            averageScore={averageScore}
            streakDays={attempts.length}
            rank={currentUser?.rank || 0}
            onContinue={() => router.push('/quizzes')}
          />
          
          <StatsCards
            testsTaken={totalAttempted}
            averageScore={averageScore}
            streakDays={attempts.length}
            rank={currentUser?.rank || 0}
            studyHours={0}
            improvement={12}
          />
          
          <ContinueLearning
            quizTitle="Indian Polity Mock Test 5"
            category="Polity"
            progress={68}
            questions={100}
            onResume={() => router.push('/quiz/polity-mock-5')}
          />
          
          <QuickActions
            onStartQuiz={() => router.push('/quizzes')}
            onResources={() => router.push('/resources')}
            onCurrentAffairs={() => router.push('/current-affairs')}
            onLeaderboard={() => router.push('/leaderboard')}
            onAiQuiz={() => router.push('/ai-quiz')}
            onNotes={() => router.push('/resources')}
          />
          
          <RecommendedResources
            resources={resources}
            onViewAll={() => router.push('/resources')}
          />
          
          <PerformanceAnalytics
            data={[
              { subject: 'History', score: 82 },
              { subject: 'Polity', score: 76 },
              { subject: 'Economy', score: 68 },
              { subject: 'Geography', score: 79 },
              { subject: 'Environment', score: 72 },
            ]}
          />
          
          <AchievementPanel
            achievements={[
              {
                id: '1',
                title: 'First Test',
                description: 'Complete your first mock test',
                unlocked: true,
                icon: <Target className="w-5 h-5 text-yellow-400" />,
              },
              {
                id: '2',
                title: '10 Tests Completed',
                description: 'Attempt ten mock tests',
                unlocked: true,
                icon: <Award className="w-5 h-5 text-yellow-400" />,
              },
              {
                id: '3',
                title: '75% Average',
                description: 'Maintain a score above 75%',
                unlocked: false,
                icon: <Star className="w-5 h-5 text-yellow-400" />,
              },
              {
                id: '4',
                title: '7 Day Streak',
                description: 'Study for 7 consecutive days',
                unlocked: true,
                icon: <Flame className="w-5 h-5 text-orange-400" />,
              },
              {
                id: '5',
                title: 'Polity Master',
                description: 'Score 80%+ in Polity',
                unlocked: false,
                icon: <Crown className="w-5 h-5 text-purple-400" />,
              },
              {
                id: '6',
                title: 'Current Affairs Expert',
                description: 'Complete 20 current affairs quizzes',
                unlocked: false,
                icon: <Trophy className="w-5 h-5 text-yellow-400" />,
              },
            ]}
          />

         <LeaderboardHero
  userRank={currentUser?.rank || 0}
  averageScore={currentUser?.averageScore || 0}
  totalTests={currentUser?.testsTaken || 0}
  percentile={currentUser?.percentile || 0}
/>

<TopThree
  first={
    leaderboardData[0]
      ? {
          id: leaderboardData[0].id,
          name: leaderboardData[0].name,
          score: leaderboardData[0].averageScore,
          testsTaken: leaderboardData[0].testsTaken,
        }
      : undefined
  }
  second={
    leaderboardData[1]
      ? {
          id: leaderboardData[1].id,
          name: leaderboardData[1].name,
          score: leaderboardData[1].averageScore,
          testsTaken: leaderboardData[1].testsTaken,
        }
      : undefined
  }
  third={
    leaderboardData[2]
      ? {
          id: leaderboardData[2].id,
          name: leaderboardData[2].name,
          score: leaderboardData[2].averageScore,
          testsTaken: leaderboardData[2].testsTaken,
        }
      : undefined
  }
/>

          {/* Mobile Logout Row */}
          <div className="flex md:hidden justify-start pt-4">
            <button onClick={handleLogout} className="w-fit p-3 bg-white/10 text-rose-300 backdrop-blur-md rounded-2xl shadow-lg flex items-center gap-2 border border-white/10 font-bold">
              <LogOut className="w-4 h-4" /> <span className="text-sm">Sign Out</span>
            </button>
          </div>

          {/* Premium Glass Bento Grid Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <button 
              onClick={() => router.push('/history')}
              className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col justify-between hover:-translate-y-2 hover:bg-white/20 hover:border-emerald-400/50 transition-all group text-left relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform -z-10"></div>
              <div className="flex justify-between items-start w-full mb-4">
                <div className="p-3 bg-white/10 text-emerald-300 rounded-2xl w-fit group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors border border-white/10">
                  <BookOpen className="w-6 h-6" />
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-300/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <div className="text-4xl font-black text-white drop-shadow-md">{totalAttempted}</div>
                <div className="text-[11px] font-bold text-emerald-100/60 uppercase tracking-[0.2em] mt-2 group-hover:text-emerald-200 transition-colors">Tests Taken</div>
              </div>
            </button>

            <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl -z-10"></div>
              <div className="p-3 bg-white/10 text-amber-300 rounded-2xl w-fit mb-4 border border-white/10">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-4xl font-black text-white drop-shadow-md">{averageScore}%</div>
                <div className="text-[11px] font-bold text-amber-100/60 uppercase tracking-[0.2em] mt-2">Avg Score</div>
              </div>
            </div>

            <button 
              onClick={() => router.push('/quizzes')}
              className="col-span-2 bg-gradient-to-br from-emerald-500/80 to-teal-700/80 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/30 shadow-[0_8px_32px_0_rgba(16,185,129,0.3)] relative overflow-hidden group text-left flex flex-col justify-between hover:scale-[1.02] transition-transform min-h-[180px]"
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-colors"></div>
              <div className="p-4 bg-white/20 rounded-2xl w-fit backdrop-blur-md mb-2 shadow-inner border border-white/30">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Mock Tests</h3>
                  <p className="text-sm font-medium text-emerald-100/80">Subject-wise mock exams →</p>
                </div>
                <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm group-hover:translate-x-3 transition-transform border border-white/20">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </button>
          </div>

          {/* Latest Quizzes Modules Component Grid */}
          <section className="pt-8">
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-black text-white/90 flex items-center gap-3 tracking-tight">
                  <Sparkles className="w-6 h-6 text-amber-400" /> Newest Test Modules
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {latestQuizzes.length === 0 ? (
                <div className="col-span-2 bg-white/5 backdrop-blur-xl p-12 text-center border-dashed border-2 border-white/20 rounded-[2rem]">
                  <h3 className="text-lg font-bold text-white/70 mb-1">No modules available yet</h3>
                </div>
              ) : (
                latestQuizzes.map((quiz) => {
                  const pastAttempt = getAttemptForQuiz(quiz.id);
                  
                  return (
                    <div key={quiz.id} className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-lg flex flex-col justify-between gap-6 hover:bg-white/15 transition-all group">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="bg-white/10 text-emerald-300 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-white/10">
                            {quiz.category || 'General'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-tight">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400/70" /> {quiz.time_limit}m
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10">
                        {pastAttempt ? (
                          <button 
                            onClick={() => router.push(`/quiz/${quiz.id}/result`)}
                            className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                          >
                            Score: {pastAttempt.score}% • Review
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push(`/quiz/${quiz.id}`)}
                            className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                          >
                            <PlayCircle className="w-5 h-5" /> Start Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* CHAT WIDGET INTERACTION AREA */}
      <StudentChatWidget user={user} />
      
    </div>
  );
}