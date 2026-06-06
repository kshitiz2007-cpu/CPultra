'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  FileText, Loader2, Link as LinkIcon, Download, PlusCircle, Trash2, 
  UploadCloud, Image as ImageIcon, Save, CheckCircle
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  file_type: string;
  file_url: string;
  category: string;
  section: string;
  created_at: string;
}

const CATEGORIES = [
  'History', 'Geography', 'Polity', 'Economy',
  'Science & Tech', 'Environment', 'Current Affairs',
  'Maths', 'Reasoning', 'GS'
];

export default function ResourceManager() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // States for adding
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('upload');
  const [newUrl, setNewUrl] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState('History');
  const [newSection, setNewSection] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to track text inputs for subsections
  const [editSections, setEditSections] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setResources(data);
      // Initialize the subsection inputs with current database values
      const sectionsMap: Record<string, string> = {};
      data.forEach(r => sectionsMap[r.id] = r.section || '');
      setEditSections(sectionsMap);
    }
    setLoading(false);
  };

  // --- ADD NEW RESOURCE ---
  const handleAddResource = async () => {
    if (!newTitle) return alert('Please provide a title.');
    if (newType !== 'upload' && !newUrl) return alert('Please provide a valid URL.');
    if (newType === 'upload' && !newFile) return alert('Please select a file to upload.');
    
    setIsAdding(true);
    let finalUrl = newUrl;
    let finalType = newType;

    if (newType === 'upload' && newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('study-materials').upload(filePath, newFile);
      if (uploadError) {
        setIsAdding(false);
        return alert('Storage Error: ' + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from('study-materials').getPublicUrl(filePath);
      finalUrl = publicUrlData.publicUrl;
      finalType = newFile.type.startsWith('image/') ? 'image' : 'pdf';
    }

    const { data, error } = await supabase.from('resources').insert([{
      title: newTitle, file_type: finalType, file_url: finalUrl,
      category: newCategory, section: newSection || newCategory
    }]).select();

    if (error) alert('DB Error: ' + error.message);
    else if (data) {
      setResources([data[0], ...resources]);
      setEditSections({...editSections, [data[0].id]: data[0].section});
      setNewTitle(''); setNewUrl(''); setNewFile(null); setNewSection('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setIsAdding(false);
  };

  // --- UPDATE EXISTING RESOURCE CATEGORY ---
  const handleUpdateCategory = async (id: string, newCat: string) => {
    setActionLoadingId(id);
    const { error } = await supabase.from('resources').update({ category: newCat }).eq('id', id);
    if (!error) {
      setResources(resources.map(r => r.id === id ? { ...r, category: newCat } : r));
      showSuccess(id);
    } else {
      alert("Failed to update category.");
    }
    setActionLoadingId(null);
  };

  // --- UPDATE EXISTING RESOURCE SUBSECTION ---
  const handleUpdateSection = async (id: string) => {
    setActionLoadingId(id);
    const newSec = editSections[id];
    const { error } = await supabase.from('resources').update({ section: newSec }).eq('id', id);
    if (!error) {
      setResources(resources.map(r => r.id === id ? { ...r, section: newSec } : r));
      showSuccess(id);
    } else {
      alert("Failed to update subsection.");
    }
    setActionLoadingId(null);
  };

  // --- DELETE RESOURCE ---
  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this file forever?')) return;
    setActionLoadingId(resourceId);
    await supabase.from('resources').delete().eq('id', resourceId);
    setResources(resources.filter(r => r.id !== resourceId));
    setActionLoadingId(null);
  };

  const showSuccess = (id: string) => {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 2000);
  };

  const getResourceIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (type === 'pdf') return <Download className="w-4 h-4 text-rose-500" />;
    return <LinkIcon className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-8 animate-fade-in w-full pb-20">
      
      {/* 1. UPLOAD SECTION */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-5 md:p-8 border border-white/60 shadow-sm">
        <h3 className="font-black text-emerald-950 mb-6 flex items-center gap-2 text-xl">
          <PlusCircle className="w-6 h-6 text-emerald-600" /> Upload New File
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Type</label>
            <select className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newType} onChange={e => {setNewType(e.target.value); setNewFile(null);}}>
              <option value="upload">Upload PDF/Image</option>
              <option value="link">Web Link</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Title</label>
            <input type="text" placeholder="e.g. Current Affairs" className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">File / URL</label>
            {newType === 'upload' ? (
             <input type="file" ref={fileInputRef} onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="w-full p-2 bg-white rounded-xl border border-gray-200 text-sm" />
            ) : (
             <input type="text" placeholder="https://..." className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            )}
          </div>
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Subject</label>
            <select className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="lg:col-span-1">
            <button onClick={handleAddResource} disabled={isAdding} className="w-full bg-emerald-950 text-white font-bold py-3 px-4 rounded-xl flex justify-center hover:bg-emerald-800 transition-colors">
              {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save File'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. ORGANIZE SECTION (THE FIX FOR OLD FILES) */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/60 bg-white/30">
           <h3 className="font-black text-emerald-950 flex items-center gap-2 text-xl">
             <FileText className="w-6 h-6 text-blue-600" /> Organize Database
           </h3>
           <p className="text-sm text-gray-600 mt-1 font-medium">Reassign older files to new folders or group them by subsections.</p>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50/80 text-xs uppercase text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">File Name</th>
                  <th className="px-6 py-4">Subject Folder (Move)</th>
                  <th className="px-6 py-4">Subsection (Group)</th>
                  <th className="px-6 py-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/20">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-white/60 transition-colors">
                    
                    {/* Title & Link */}
                    <td className="px-6 py-4">
                      <div className="font-bold flex items-center gap-2 text-gray-900">
                         {getResourceIcon(r.file_type || '')}
                         <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 line-clamp-1">{r.title}</a>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{r.file_type || 'LINK'}</div>
                    </td>

                    {/* Category Dropdown (Auto-Saves) */}
                    <td className="px-6 py-4">
                      <select 
                        className={`p-2 rounded-xl text-sm font-bold border transition-colors outline-none cursor-pointer ${successId === r.id ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-700'}`}
                        value={r.category || ''}
                        onChange={(e) => handleUpdateCategory(r.id, e.target.value)}
                        disabled={actionLoadingId === r.id}
                      >
                        {!CATEGORIES.includes(r.category) && <option value={r.category}>{r.category} (Old)</option>}
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </td>

                    {/* Subsection Input (Manual Save) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder="e.g. Ancient History"
                          value={editSections[r.id] !== undefined ? editSections[r.id] : ''}
                          onChange={(e) => setEditSections({...editSections, [r.id]: e.target.value})}
                          className="w-40 p-2 rounded-xl text-sm bg-white border border-gray-200 outline-none focus:border-blue-400"
                        />
                        {/* Only show SAVE button if they typed something different from the database */}
                        {editSections[r.id] !== (r.section || '') && (
                          <button 
                            onClick={() => handleUpdateSection(r.id)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                        )}
                        {successId === r.id && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => deleteResource(r.id)} disabled={actionLoadingId === r.id} className="p-2 bg-white rounded-xl border border-gray-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm">
                        {actionLoadingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}