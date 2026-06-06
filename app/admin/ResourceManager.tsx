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
    
    setIsAdding(true);

    let finalUrl = newUrl;
    let finalType = newType;

    // Handle Local File Upload
    if (newType === 'upload' && newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
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

    // Database Insert (NO ID sent, letting Supabase generate it)
    const { data, error } = await supabase.from('resources').insert([{
      title: newTitle,
      type: finalType,
      url: finalUrl,
      category: newCategory,
      section: newSection || newCategory,
      active: true
    }]).select();

    if (error) {
      alert('DB Error: ' + error.message);
    } else if (data) {
      setResources([data[0], ...resources]);
      setNewTitle(''); setNewUrl(''); setNewFile(null);
    }
    setIsAdding(false);
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Delete this?')) return;
    await supabase.from('resources').delete().eq('id', resourceId);
    setResources(resources.filter(r => r.id !== resourceId));
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
          <select className="w-full p-3 rounded-xl bg-white border border-gray-200" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="w-full p-2 bg-white rounded-xl border border-gray-200" />
          <button onClick={handleAddResource} disabled={isAdding} className="w-full bg-emerald-900 text-white font-bold py-3 rounded-xl">
            {isAdding ? 'Uploading...' : 'Save Resource'}
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
                <td className="px-6 py-4 font-bold">{r.title}</td>
                <td className="px-6 py-4">{r.category}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => deleteResource(r.id)} className="text-rose-600 hover:text-rose-800"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

