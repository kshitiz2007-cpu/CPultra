'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CreditCard, CheckCircle, XCircle, Search, Loader2, ShieldCheck } from 'lucide-react';

interface Payment {
  id: string;
  user_id: string;
  quiz_id: string;
  transaction_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: { name: string; email: string };
  quizzes: { title: string };
}

type Tab = 'pending' | 'approved' | 'rejected';

export default function PaymentsManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles:user_id (name, email), quizzes:quiz_id (title)')
      .order('created_at', { ascending: false });
    if (data) setPayments(data as any);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const orig = [...payments];
    setPayments(payments.map(p => p.id === id ? { ...p, status } : p));
    const { error } = await supabase.from('transactions').update({ status }).eq('id', id);
    if (error) { alert('Failed to update status'); setPayments(orig); }
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const filtered = payments.filter(p =>
    p.status === activeTab &&
    (p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Payments</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Verify UPI references before unlocking tests.
          </p>
        </div>
        <div className="search-wrap w-full sm:w-64">
          <Search className="search-icon w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by name or UPI ID…"
            className="form-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Segment tabs */}
      <div className="segment">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`segment-item flex items-center gap-1.5 ${activeTab === key ? 'active' : ''}`}
          >
            {label}
            {key === 'pending' && pendingCount > 0 && (
              <span
                className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: '#EF4444', color: 'white' }}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin mb-3" style={{ color: '#6366F1' }} />
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Loading transactions…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#94A3B8' }}>
            <ShieldCheck className="w-8 h-8 mb-3" />
            <p className="text-sm font-medium">No {activeTab} transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Module</th>
                  <th>UPI Ref</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>
                    {activeTab === 'pending' ? 'Verify' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    {/* Student */}
                    <td>
                      <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                        {p.profiles?.name || 'Unknown'}
                      </div>
                      <div className="text-xs" style={{ color: '#94A3B8' }}>
                        {p.profiles?.email}
                      </div>
                    </td>

                    {/* Module */}
                    <td>
                      <span className="text-sm font-medium" style={{ color: '#6366F1' }}>
                        {p.quizzes?.title || 'Unknown Quiz'}
                      </span>
                    </td>

                    {/* UPI ref */}
                    <td>
                      <code
                        className="text-xs px-2 py-1 rounded font-mono"
                        style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}
                      >
                        {p.transaction_id}
                      </code>
                    </td>

                    {/* Date */}
                    <td>
                      <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                        {new Date(p.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(p.id, 'approved')}
                              className="btn btn-sm btn-success flex items-center gap-1"
                              title="Approve & unlock"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => updateStatus(p.id, 'rejected')}
                              className="btn btn-sm btn-danger flex items-center gap-1"
                              title="Reject"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        ) : (
                          <span
                            className="badge"
                            style={
                              p.status === 'approved'
                                ? { background: '#ECFDF5', color: '#059669' }
                                : { background: '#FEF2F2', color: '#DC2626' }
                            }
                          >
                            {p.status === 'approved' ? '✓' : '✕'} {p.status}
                          </span>
                        )}
                      </div>
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