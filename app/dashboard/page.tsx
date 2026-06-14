import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Dashboard() {
  const [user, setUser] = useState({ name: 'Aspirant', rank: 42 });
  const [progressData, setProgressData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Mock data
  const overallProgress = [
    { subject: 'History', score: 85, attempts: 12 },
    { subject: 'Polity', score: 92, attempts: 8 },
    { subject: 'Economy', score: 78, attempts: 15 },
    { subject: 'Geography', score: 88, attempts: 10 },
  ];

  const individualQuizData = [
    { quiz: 'Quiz 1', score: 65, date: '2025-01' },
    { quiz: 'Quiz 2', score: 82, date: '2025-02' },
    { quiz: 'Quiz 3', score: 95, date: '2025-03' },
    { quiz: 'Quiz 4', score: 71, date: '2025-04' },
  ];

  const overallLeaderboard = [
    { rank: 1, name: 'Rahul Sharma', score: 945, quizzes: 45 },
    { rank: 2, name: 'Priya Patel', score: 912, quizzes: 42 },
    { rank: 3, name: 'Amit Kumar', score: 898, quizzes: 40 },
    { rank: 4, name: 'You', score: 876, quizzes: 38 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user.name}!</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Current Rank</p>
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">#{user.rank}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Quizzes Taken</p>
            <p className="text-4xl font-bold">38</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Avg Score</p>
            <p className="text-4xl font-bold text-emerald-600">84%</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <p className="text-sm text-gray-500">Study Streak</p>
            <p className="text-4xl font-bold text-amber-600">12 days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Progress Chart */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Overall Subject Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overallProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Individual Quizzes Trend */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Individual Quiz Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={individualQuizData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Overall Leaderboard</h2>
            <span className="text-sm text-gray-500">Top Performers</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3">Rank</th>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Total Score</th>
                  <th className="text-left py-3">Quizzes</th>
                </tr>
              </thead>
              <tbody>
                {overallLeaderboard.map((item, index) => (
                  <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 font-medium">#{item.rank}</td>
                    <td className="py-4">{item.name}</td>
                    <td className="py-4 font-mono">{item.score}</td>
                    <td className="py-4">{item.quizzes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
