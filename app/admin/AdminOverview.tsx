'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, BookOpen, Target, TrendingUp, Clock, Award } from 'lucide-react';

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ScoreBadge({ score }: { score: number }) {
  const high   = score >= 75;
  const medium = score >= 50;
  const style  = high
    ? { background: '#ECFDF5', color: '#059669' }
    : medium
    ? { background: '#FFFBEB', color: '#B45309' }
    : { background: '#FEF2F2', color: '#DC2626' };

  return (
    <span
      className="text-xs font-bold px-2 py-1 rounded"
      style={style}
    >
      {score}%
    </span>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ students: 0, quizzes: 0, attempts: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'admin');

      const { count: quizCount } = await supabase
        .from('quizzes')
        .select('*', { count: 'exact', head: true });

      const { count: attemptCount } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true });

      const { data: activities } = await supabase
        .from('attempts')
        .select('id, score, created_at, profiles (name, email), quizzes (title)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (isMounted) {
        setStats({ students: studentCount || 0, quizzes: quizCount || 0, attempts: attemptCount || 0 });
        if (activities) setRecentActivity(activities);
        setLoading(false);
      }
    }

    fetchDashboardData();

    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchDashboardData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attempts' }, () => fetchDashboardData())
      .subscribe((status) => { if (status === 'SUBSCRIBED') setIsLive(true); });

    return () => { isMounted = false; supabase.removeChannel(channel); };
  }, []);

  const kpiCards = [
    {
      label: 'Registered Students',
      value: stats.students,
      icon: Users,
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
      change: 'Total enrolled learners',
    },
    {
      label: 'Active Quizzes',
      value: stats.quizzes,
      icon: BookOpen,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      change: 'Published modules',
    },
    {
      label: 'Total Attempts',
      value: stats.attempts,
      icon: Target,
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
      change: 'Cumulative submissions',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ height: '60vh' }}>
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Platform Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Real-time metrics and recent student activity.</p>
        </div>
        {isLive && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}
          >
            <span className="live-dot" />
            Live
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, iconBg, iconColor, change }) => (
          <div key={label} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: iconBg }}
              >
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-0.5" style={{ color: '#0F172A' }}>
              {value.toLocaleString()}
            </div>
            <div className="text-sm font-medium" style={{ color: '#0F172A' }}>{label}</div>
            <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>{change}</div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="panel overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#6366F1' }} />
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>Recent Activity</span>
          </div>
          <span className="text-xs" style={{ color: '#94A3B8' }}>Last 10 submissions</span>
        </div>

        <div className="p-4">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12" style={{ color: '#94A3B8' }}>
              <Clock className="w-8 h-8 mb-3" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs mt-1">Student submissions will appear here.</p>
            </div>
          ) : (
            <div>
              {recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="feed-item">
                  {/* Avatar */}
                  <div
                    className="avatar w-8 h-8 text-xs shrink-0"
                    style={{
                      background: '#EEF2FF',
                      color: '#6366F1',
                      border: '1px solid #C7D2FE',
                    }}
                  >
                    {(activity.profiles?.name || 'S').charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm" style={{ color: '#0F172A' }}>
                          <span className="font-semibold">{activity.profiles?.name || 'A student'}</span>
                          {' '}completed{' '}
                          <span className="font-medium" style={{ color: '#6366F1' }}>
                            {activity.quizzes?.title || 'a module'}
                          </span>
                        </p>
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                          <Clock className="w-3 h-3" />
                          {timeAgo(activity.created_at)}
                        </p>
                      </div>
                      <ScoreBadge score={activity.score} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}