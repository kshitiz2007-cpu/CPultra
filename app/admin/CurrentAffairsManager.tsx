'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FilePlus, Loader2, CheckCircle } from 'lucide-react';

export default function CurrentAffairsManager() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Polity');
  const [summary, setSummary] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary) return alert('Please fill in title and summary fields');

    try {
      setSubmitting(true);
      setSuccess(false);

      const { error } = await supabase
        .from('current_affairs')
        .insert([{ title, category, summary, file_url: fileUrl }]);

      if (error) throw error;

      setSuccess(true);
      setTitle('');
      setSummary('');
      setFileUrl('');
    } catch (err: any) {
      alert('Error publishing update: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <FilePlus className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Publish Daily Current Affairs</h2>
          <p className="text-xs text-white/50">Add materials directly onto the student portal hub feed</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="w-5 h-5" /> Module updates posted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <div>
          <label className="block text-white/70 font-semibold mb-2">Article / Topic Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Summary of Economic Survey 2026 or India-Oman Bilateral Trade Talks"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-white placeholder:text-white/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/70 font-semibold mb-2">Syllabus Tag Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#090d1a] border border-white/10 outline-none text-white focus:border-emerald-500 transition-colors"
          >
            <option value="Polity & Governance">Polity & Governance</option>
            <option value="International Relations">International Relations</option>
            <option value="Economy & Infrastructure">Economy & Infrastructure</option>
            <option value="Environment & Science">Environment & Science</option>
            <option value="History & Culture">History & Culture</option>
          </select>
        </div>

        <div>
          <label className="block text-white/70 font-semibold mb-2">Core Brief / Notes Summary</label>
          <textarea
            rows={5}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Type your strategic study pointers or material descriptions here..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-white placeholder:text-white/20 focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-white/70 font-semibold mb-2">Document attachment URL (Optional)</label>
          <input
            type="text"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="e.g., https://your-supabase-storage-link.pdf"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-white placeholder:text-white/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 font-bold py-4 rounded-xl shadow-lg transition-opacity active:scale-[0.99] disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Publish Article Live'
          )}
        </button>
      </form>
    </div>
  );
}