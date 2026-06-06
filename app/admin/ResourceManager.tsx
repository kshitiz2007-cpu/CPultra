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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('upload');
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

  const handleAddResource = async () => {
    if (!newTitle) return alert('Please provide a title.');
    if (newType !== 'upload' && !newUrl) return alert('Please provide a valid URL.');
    if (newType === 'upload' && !newFile) return alert('Please select a file to upload.');
    
    setIsAdding(true);

    let finalUrl = newUrl;
    let finalType = newType;

    // Handle Local File Upload
    if (newType === 'upload' && newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(filePath, newFile);

      if (uploadError) {
        setIsAdding(false);
        return alert('Storage Error: ' + uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      finalUrl = publicUrlData.publicUrl;
      finalType = newFile.type.startsWith('image/') ? 'image' : 'pdf';
    }

    // EXACT MATCH to Database Columns: title, file_type, file_url, category, section
    const { data, error } = await supabase.from('resources').insert([{
      title: newTitle,
      file_type: finalType,
      file_url: finalUrl,
      category: newCategory,
      section: newSection || newCategory
    }]).select();

    if (error) {
      alert('DB Error: ' + error.message + '\nDetails: ' + JSON.stringify(error.details));
    } else if (data) {
      setResources([data[0], ...resources]);
      setNewTitle(''); 
      setNewUrl(''); 
      setNewFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setIsAdding(false);
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Delete this?')) return;
    setUpdatingId(resourceId);
    await supabase.from('resources').delete().eq('id', resourceId);
    setResources(resources.filter(r => r.id !== resourceId));
    setUpdatingId(null);
  };

  const getResourceIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (type === 'pdf') return <Download className="w-4 h-4 text-rose-500" />;
    return <LinkIcon className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/60 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-emerald-600" /> Add New Material
        </h3>
        
        {/* Responsive Grid Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Resource Title" className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          
          <select className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newType} onChange={e => {
            setNewType(e.target.value);
            setNewFile(null);
          }}>
            <option value="upload">Upload Local File</option>
            <option value="pdf">External PDF Link</option>
            <option value="link">External Web Link</option>
          </select>

          {newType === 'upload' ? (
             <input type="file" ref={fileInputRef} onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="w-full p-2 bg-white rounded-xl border border-gray-200" />
          ) : (
             <input type="text" placeholder="https://..." className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
          )}

          <select className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <button onClick={handleAddResource} disabled={isAdding} className="w-full md:col-span-2 bg-emerald-900 text-white font-bold py-3 rounded-xl flex justify-center">
            {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Resource'}
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {resources.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 font-bold flex items-center gap-2">
                   {getResourceIcon(r.file_type || '')}
                   <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 line-clamp-1">{r.title}</a>
                </td>
                <td className="px-6 py-4">{r.category}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => deleteResource(r.id)} disabled={updatingId === r.id} className="text-rose-600 hover:text-rose-800">
                    {updatingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
