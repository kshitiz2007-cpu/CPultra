'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  FileText,
  Plus,
  Trash2,
  FolderOpen,
  Save,
  Loader2,
  Link as LinkIcon,
  Search,
  BarChart3,
  BookOpen,
  Globe
} from 'lucide-react';

const SUBJECTS = [
  'History','Geography','Polity','Economy',
  'Science & Tech','Environment','Current Affairs',
  'Maths','Reasoning'
];

export default function ResourceManager() {
  const [resources,setResources] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('All');

  const [title,setTitle] = useState('');
  const [fileType,setFileType] = useState('pdf');
  const [fileUrl,setFileUrl] = useState('');
  const [category,setCategory] = useState('History');
  const [section,setSection] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('created_at',{ascending:false});

    setResources(data || []);
    setLoading(false);
  }

  async function handleAddResource(e:any) {
    e.preventDefault();

    setSaving(true);

    const { error } = await supabase.from('resources').insert([{
      id:`res_${Date.now()}`,
      title,
      file_type:fileType,
      file_url:fileUrl,
      category,
      section:section || category
    }]);

    setSaving(false);

    if(error){
      alert(error.message);
      return;
    }

    setTitle('');
    setFileUrl('');
    setSection('');

    fetchResources();
  }

  async function handleDelete(id:string){
    if(!confirm('Delete resource?')) return;

    await supabase
      .from('resources')
      .delete()
      .eq('id',id);

    setResources(resources.filter(r=>r.id!==id));
  }

  const filteredResources = useMemo(()=>{
    return resources.filter(r=>{

      const matchesSearch =
        r.title?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === 'All' || r.category === filter;

      return matchesSearch && matchesFilter;
    });
  },[resources,search,filter]);

  const pdfCount =
    resources.filter(r=>r.file_type==='pdf').length;

  const linkCount =
    resources.filter(r=>r.file_type==='link').length;

  return (
    <div className="space-y-8 text-white">

      <div>
        <h1 className="text-4xl font-black">
          Resource Center
        </h1>

        <p className="text-white/60 mt-2">
          Manage PDFs, notes and study material.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <FolderOpen className="w-6 h-6 text-emerald-400 mb-3" />
          <div className="text-4xl font-black">{resources.length}</div>
          <div className="text-white/50 mt-2">Total Resources</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <FileText className="w-6 h-6 text-rose-400 mb-3" />
          <div className="text-4xl font-black">{pdfCount}</div>
          <div className="text-white/50 mt-2">PDF Files</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <Globe className="w-6 h-6 text-blue-400 mb-3" />
          <div className="text-4xl font-black">{linkCount}</div>
          <div className="text-white/50 mt-2">Web Links</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
          <BarChart3 className="w-6 h-6 text-purple-400 mb-3" />
          <div className="text-4xl font-black">{SUBJECTS.length}</div>
          <div className="text-white/50 mt-2">Subjects</div>
        </div>

      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" />
          Upload Resource
        </h2>

        <form
          onSubmit={handleAddResource}
          className="grid md:grid-cols-5 gap-4"
        >

          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Title"
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          />

          <input
            value={fileUrl}
            onChange={(e)=>setFileUrl(e.target.value)}
            placeholder="File URL"
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          />

          <select
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            {SUBJECTS.map(s=><option key={s}>{s}</option>)}
          </select>

          <select
            value={fileType}
            onChange={(e)=>setFileType(e.target.value)}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <option value="pdf">PDF</option>
            <option value="link">Link</option>
          </select>

          <button
            disabled={saving}
            className="bg-emerald-600 rounded-xl font-bold"
          >
            {saving ? <Loader2 className="animate-spin mx-auto" /> : 'Save'}
          </button>

        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">

        <div className="flex flex-col md:flex-row gap-4 mb-6">

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-11 p-3 rounded-xl bg-white/5 border border-white/10"
            />
          </div>

          <select
            value={filter}
            onChange={(e)=>setFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <option>All</option>
            {SUBJECTS.map(s=><option key={s}>{s}</option>)}
          </select>

        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-emerald-400" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {filteredResources.map(res=>(
              <div
                key={res.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5"
              >

                <div className="flex items-center gap-3 mb-4">
                  {res.file_type === 'pdf' ? (
                    <FileText className="text-rose-400" />
                  ) : (
                    <LinkIcon className="text-blue-400" />
                  )}

                  <span className="text-xs text-white/50 uppercase">
                    {res.file_type}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2">
                  {res.title}
                </h3>

                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs">
                    {res.category}
                  </span>

                  <span className="px-2 py-1 rounded-lg bg-white/5 text-white/60 text-xs">
                    {res.section || 'General'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <a
                    href={res.file_url}
                    target="_blank"
                    className="flex-1 text-center py-2 rounded-lg bg-blue-500/10 text-blue-400"
                  >
                    View
                  </a>

                  <button
                    onClick={()=>handleDelete(res.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}
