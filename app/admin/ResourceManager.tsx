'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  FileText, Save, Loader2, Layers, Link as LinkIcon, 
  Download, PlusCircle, Trash2, UploadCloud, Image as ImageIcon
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  category: string;
  section: string;
  active: boolean;
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // States for adding a NEW resource
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('upload'); // Default to local upload
  const [newUrl, setNewUrl] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState('History');
  const [newSection, setNewSection] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localSections, setLocalSections] = useState<Record<string, string>>({});

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
      const sectionsMap: Record<string, string> = {};
      data.forEach(r => sectionsMap[r.id] = r.section || '');
      setLocalSections(sectionsMap);
    }
    setLoading(false);
  };

  // ADD NEW RESOURCE (Handles both Links and Local File Uploads)
  const handleAddResource = async () => {
    if (!newTitle) return alert('Please provide a title.');
    if (newType !== 'upload' && !newUrl) return alert('Please provide a valid URL.');
    if (newType === 'upload' && !newFile) return alert('Please select a file to upload.');
    
    setIsAdding(true);

    let finalUrl = newUrl;
    let finalType = newType;

    // 1. Handle Local File Upload to Supabase Storage
    if (newType === 'upload' && newFile) {
      // Create a unique file path to prevent overwriting
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, newFile);

      if (uploadError) {
        setIsAdding(false);
        return alert('Failed to upload file: ' + uploadError.message);
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      finalUrl = publicUrlData.publicUrl;
      // Auto-detect if it's an image or pdf for the UI icons
      finalType = newFile.type.startsWith('image/') ? 'image' : 'pdf';
    }

    // 2. Save the database record
    const newResource = {
      title: newTitle,
      type: finalType,
      url: finalUrl,
      category: newCategory,
      section: newSection || newCategory,
      active: true
    };

    const { data, error } = await supabase.from('resources').insert([newResource]).select();

    if (error) {
      alert('Error saving to database: ' + error.message);
    } else if (data) {
      setResources([data[0], ...resources]);
      // Reset form
      setNewTitle('');
      setNewUrl('');
      setNewFile(null);
      setNewSection('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setIsAdding(false);
  };

  // UPDATE EXISTING RESOURCE
  const handleCategoryChange = async (resourceId: string, category: string) => {
    setUpdatingId(resourceId);
    const { error } = await supabase.from('resources').update({ category }).eq('id', resourceId);
    if (!error) setResources(resources.map(r => r.id === resourceId ? { ...r, category } : r));
    setUpdatingId(null);
  };

  const saveSubsection = async (resourceId: string) => {
    const section = localSections[resourceId];
    setUpdatingId(resourceId);
    const { error } = await supabase.from('resources').update({ section }).eq('id', resourceId);
    if (!error) setResources(resources.map(r => r.id === resourceId ? { ...r, section } : r));
    else alert("Failed to save subsection.");
    setUpdatingId(null);
  };

  const toggleStatus = async (resourceId: string, currentStatus: boolean) => {
    setUpdatingId(resourceId);
    const { error } = await supabase.from('resources').update({ active: !currentStatus }).eq('id', resourceId);
    if (!error) setResources(resources.map(r => r.id === resourceId ? { ...r, active: !currentStatus } : r));
    setUpdatingId(null);
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    setUpdatingId(resourceId);
    // Note: To be perfectly clean, you should also delete the file from Storage here if type is upload.
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (!error) setResources(resources.filter(r => r.id !== resourceId));
    setUpdatingId(null);
  };

  // Helper function to render the correct icon based on file type
  const getResourceIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (type === 'pdf') return <Download className="w-4 h-4 text-rose-500" />;
    return <LinkIcon className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-black text-emerald-950 font-serif tracking-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" /> Study Materials Library
        </h2>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Upload local PDFs/Images or link external resources to specific folders.
        </p>
      </div>

      {/* TOP SECTION: ADD NEW RESOURCE FORM */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" /> Add New Material
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Source Type</label>
            <select className="glass-input w-full rounded-xl" value={newType} onChange={e => {
              setNewType(e.target.value);
              setNewFile(null); // Clear file if they switch back to URL
            }}>
              <option value="upload">Upload Local File</option>
              <option value="pdf">External PDF Link</option>
              <option value="link">External Web Link</option>
            </select>
          </div>
          
          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Title</label>
            <input type="text" placeholder="e.g. Current Affairs Jan" className="glass-input w-full rounded-xl" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>

          <div className="lg:col-span-1">
            {newType === 'upload' ? (
              <>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Select File (PDF/Image)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".pdf,image/*"
                    ref={fileInputRef}
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className={`glass-input w-full rounded-xl py-2 px-3 flex items-center gap-2 text-sm overflow-hidden whitespace-nowrap ${newFile ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-500'}`}>
                    <UploadCloud className="w-4 h-4 shrink-0" />
                    <span className="truncate">{newFile ? newFile.name : 'Choose file...'}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">URL / Link</label>
                <input type="text" placeholder="https://..." className="glass-input w-full rounded-xl" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Subject</label>
            <select className="glass-input w-full rounded-xl" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="lg:col-span-1">
            <button 
              onClick={handleAddResource}
              disabled={isAdding}
              className="w-full bg-emerald-950 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Resource'}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: MANAGE EXISTING RESOURCES */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm overflow-hidden">
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : resources.length === 0 ? (
            <div className="p-16 text-center text-gray-500 font-bold">No resources found. Add one above!</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 text-[11px] uppercase text-gray-500 font-bold tracking-wider border-b border-white/60">
                <tr>
                  <th className="px-6 py-4">Resource Title</th>
                  <th className="px-6 py-4">Subject Folder</th>
                  <th className="px-6 py-4">Subsection (Type & Save)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-white/30 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors line-clamp-1">
                          {resource.title}
                        </a>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <select 
                        value={resource.category || 'GS'}
                        onChange={(e) => handleCategoryChange(resource.id, e.target.value)}
                        disabled={updatingId === resource.id}
                        className="text-sm font-bold px-3 py-2 rounded-xl transition-all outline-none cursor-pointer bg-white/60 text-emerald-800 border border-emerald-200"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text"
                            placeholder="e.g. Ancient India"
                            value={localSections[resource.id] || ''}
                            onChange={(e) => setLocalSections({...localSections, [resource.id]: e.target.value})}
                            className="glass-input pl-9 pr-3 py-2 text-sm w-40 md:w-48 rounded-xl font-semibold text-gray-700"
                          />
                        </div>
                        {localSections[resource.id] !== (resource.section || '') && (
                          <button 
                            onClick={() => saveSubsection(resource.id)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors shadow-sm font-bold flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleStatus(resource.id, resource.active)}
                          disabled={updatingId === resource.id}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm border ${
                            resource.active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {resource.active ? 'Published' : 'Draft'}
                        </button>
                        
                        <button 
                          onClick={() => deleteResource(resource.id)}
                          disabled={updatingId === resource.id}
                          className="p-1.5 bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition-colors border border-white hover:border-rose-100 shadow-sm"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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