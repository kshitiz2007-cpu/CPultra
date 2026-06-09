'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ArrowLeft, Newspaper, Download, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  file_url: string;
  published_date: string;
}

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    async function loadCurrentAffairs() {
      try {
        const { data, error } = await supabase
          .from('current_affairs')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (err) {
        console.error('Failed reading material archives:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCurrentAffairs();
  }, []);

  const tagsList = ['All', 'Polity & Governance', 'International Relations', 'Economy & Infrastructure', 'Environment & Science', 'History & Culture'];
  const filteredArticles = selectedTag === 'All' 
    ? articles 
    : articles.filter(a => a.category === selectedTag);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white/50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm">Fetching daily current affairs data feed...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden text-white p-6 md:p-12">
      {/* Background ambient lighting blobs matching user panel specs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Navigation Toolbar header wrapper */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:underline mb-2">
              <ArrowLeft className="w-3 h-3" /> Back to Student Dashboard
            </Link>
            <h1 className="text-3xl font-black font-serif tracking-tight flex items-center gap-2">
              <Newspaper className="w-8 h-8 text-emerald-400" /> Current Affairs Hub
            </h1>
            <p className="text-sm text-white/60">Curated civil services exam core updates & monthly summary documents</p>
          </div>
        </div>

        {/* Categories Tag Selector Filter Bar List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-white/5">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                selectedTag === tag 
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 border-white/10 text-white shadow-lg' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Dynamic Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between group hover:border-white/20 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md">
                      {article.category}
                    </span>
                    <span className="text-xs text-white/40 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> {article.published_date || 'Today'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                    {article.summary}
                  </p>
                </div>

                {article.file_url && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <a
                      href={article.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-xl text-xs border border-white/10 transition-all"
                    >
                      <Download className="w-4 h-4 text-emerald-400" /> View / Download Attached PDF Notes
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white/[0.01] border border-white/5 p-16 rounded-3xl text-center text-white/30">
              <p className="text-sm font-medium">No material uploads found under this category filter setup.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}