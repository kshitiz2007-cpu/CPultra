'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
  FolderOpen, ChevronLeft, Loader2, Search, Landmark, Globe, 
  Scale, TrendingUp, Microscope, Leaf, Newspaper, Calculator, 
  Lightbulb, FileText, Layers, ExternalLink, Download 
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  category: string;
  section: string;
}

const SUBJECT_CONFIG = [
  { id: 'History', group: 'GS', icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  { id: 'Geography', group: 'GS', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  { id: 'Polity', group: 'GS', icon: Scale, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  { id: 'Economy', group: 'GS', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  { id: 'Science & Tech', group: 'GS', icon: Microscope, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
  { id: 'Environment', group: 'GS', icon: Leaf, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
  { id: 'Current Affairs', group: 'Other', icon: Newspaper, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
  { id: 'Maths', group: 'Other', icon: Calculator, color: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
  { id: 'Reasoning', group: 'Other', icon: Lightbulb, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
];

export default function StudentResourcesPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/');

      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (data) setResources(data);
      setLoading(false);
    }
    loadData();
  }, [router]);

  const getResourceCount = (subjectId: string) => resources.filter(r => r.category === subjectId).length;

  const filteredResources = resources.filter(r => {
    if (!activeSubject) return false;
    const matchesSubject = r.category === activeSubject;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // GROUP RESOURCES BY SUBSECTION
  const groupedResources = filteredResources.reduce((acc, resource) => {
    const subsection = resource.section && resource.section !== resource.category ? resource.section : 'General Materials';
    if (!acc[subsection]) acc[subsection] = [];
    acc[subsection].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <button 
          onClick={() => activeSubject ? setActiveSubject(null) : router.push('/dashboard')}
          className="p-3 bg-white/60 hover:bg-white rounded-xl shadow-sm transition-all text-blue-800 border border-white/60"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-blue-950 tracking-tight">
            {activeSubject ? `${activeSubject} Library` : 'Study Materials Library'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {activeSubject ? 'Browse documents and links' : 'Choose a subject to view available materials'}
          </p>
        </div>
      </div>

      {/* VIEW 1: MAIN SUBJECT FOLDERS */}
      {!activeSubject && (
        <div className="animate-fade-in space-y-10">
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4 px-2 flex items-center gap-2 uppercase tracking-wider text-sm">
              <FolderOpen className="w-5 h-5 text-gray-400" /> Subject Folders
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SUBJECT_CONFIG.map((subject) => {
                const Icon = subject.icon;
                const count = getResourceCount(subject.id);
                return (
                  <div 
                    key={subject.id}
                    onClick={() => setActiveSubject(subject.id)}
                    className={`bg-white/40 backdrop-blur-xl p-5 rounded-[1.5rem] cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all group border border-white/60 border-b-4 ${subject.border}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${subject.bg} ${subject.color} group-hover:scale-110 transition-transform shadow-sm`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="bg-white/80 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase tracking-widest">
                        {count} Files
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {subject.id}
                    </h3>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}

      {/* VIEW 2: SUBSECTIONS & RESOURCES */}
      {activeSubject && (
        <div className="animate-fade-in">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${activeSubject} materials...`} 
              className="glass-input w-full pl-12 py-4 text-lg rounded-[1.5rem]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-8">
            {Object.keys(groupedResources).length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-2 border-blue-900/10 mt-4 rounded-[2rem]">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No materials found</h3>
                <p className="text-sm text-gray-500">Check back soon for new {activeSubject} resources.</p>
              </div>
            ) : (
              Object.entries(groupedResources).map(([subsection, sectionResources]) => (
                <div key={subsection} className="space-y-4">
                  
                  {/* Subsection Header */}
                  <h2 className="text-xl font-black text-blue-900 flex items-center gap-2 border-b-2 border-blue-100 pb-2">
                    <Layers className="w-5 h-5 text-blue-500" /> {subsection}
                  </h2>
                  
                  {/* Resource Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionResources.map((resource) => (
                      <div key={resource.id} className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/80 shadow-sm flex items-start justify-between gap-4 hover:bg-white transition-all group">
                        
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl shrink-0 shadow-sm ${
                            resource.type === 'pdf' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                          }`}>
                            {resource.type === 'pdf' ? <FileText className="w-6 h-6" /> : <ExternalLink className="w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="text-md font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {resource.title}
                            </h3>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded">
                              {resource.type.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <a 
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all shadow-sm group-hover:scale-105"
                        >
                          {resource.type === 'pdf' ? <Download className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                        </a>

                      </div>
                    ))}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}