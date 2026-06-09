'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  FileText, Loader2, Link as LinkIcon, Download,
  Trash2, UploadCloud, Image as ImageIcon, Save, CheckCircle, PlusCircle
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
  'Maths', 'Reasoning', 'GS',
];

export default function ResourceManager() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [editSections, setEditSections] = useState<Record<string, string>>({});

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('upload');
  const [newUrl, setNewUrl] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState('History');
  const [newSection, setNewSection] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setResources(data);
      const map: Record<string, string> = {};
      data.forEach(r => map[r.id] = r.section || '');
      setEditSections(map);
    }
    setLoading(false);
  };

  const flash = (id: string) => {
    setSuccessId(id);
    setTimeout(() => setSuccessId(null), 2000);
  };

  const handleAdd = async () => {
    if (!newTitle) return alert('Please provide a title.');
    if (newType !== 'upload' && !newUrl) return alert('Please provide a URL.');
    if (newType === 'upload' && !newFile) return alert('Please select a file.');

    setIsAdding(true);
    let finalUrl = newUrl;
    let finalType = newType;

    if (newType === 'upload' && newFile) {
      const ext = newFile.name.split('.').pop();
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(path, newFile);
      if (uploadError) { setIsAdding(false); return alert('Upload error: ' + uploadError.message); }
      finalUrl = supabase.storage.from('study-materials').getPublicUrl(path).data.publicUrl;
      finalType = newFile.type.startsWith('image/') ? 'image' : 'pdf';
    }

    const { data, error } = await supabase.from('resources').insert([{
      title: newTitle, file_type: finalType, file_url: finalUrl,
      category: newCategory, section: newSection || newCategory,
    }]).select();

    if (error) { alert('DB Error: ' + error.message); }
    else if (data) {
      setResources([data[0], ...resources]);
      setEditSections(prev => ({ ...prev, [data[0].id]: data[0].section }));
      setNewTitle(''); setNewUrl(''); setNewFile(null); setNewSection('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
    }
    setIsAdding(false);
  };

  const handleUpdateCategory = async (id: string, cat: string) => {
    setActionId(id);
    const { error } = await supabase.from('resources').update({ category: cat }).eq('id', id);
    if (!error) { setResources(resources.map(r => r.id === id ? { ...r, category: cat } : r)); flash(id); }
    else alert('Failed to update category.');
    setActionId(null);
  };

  const handleUpdateSection = async (id: string) => {
    setActionId(id);
    const sec = editSections[id];
    const { error } = await supabase.from('resources').update({ section: sec }).eq('id', id);
    if (!error) { setResources(resources.map(r => r.id === id ? { ...r, section: sec } : r)); flash(id); }
    else alert('Failed to update subsection.');
    setActionId(null);
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Delete this file permanently?')) return;
    setActionId(id);
    await supabase.from('resources').delete().eq('id', id);
    setResources(resources.filter(r => r.id !== id));
    setActionId(null);
  };

  const getTypeIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-3.5 h-3.5" style={{ color: '#7C3AED' }} />;
    if (type === 'pdf')   return <Download  className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />;
    return <LinkIcon className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />;
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      image: { bg: '#F5F3FF', color: '#7C3AED' },
      pdf:   { bg: '#FEF2F2', color: '#DC2626' },
      link:  { bg: '#EFF6FF', color: '#1D4ED8' },
    };
    const s = styles[type] || styles.link;
    return (
      <span className="badge" style={{ background: s.bg, color: s.color }}>
        {getTypeIcon(type)} {type.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Resources</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
            Upload and organise study materials for your students.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="btn btn-primary flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Upload File'}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="panel p-5 animate-fade-in">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#0F172A' }}>
            <UploadCloud className="w-4 h-4" style={{ color: '#6366F1' }} />
            Add New Resource
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className="form-label">Type</label>
              <select
                className="form-input select"
                value={newType}
                onChange={e => { setNewType(e.target.value); setNewFile(null); }}
              >
                <option value="upload">Upload PDF / Image</option>
                <option value="link">Web Link</option>
              </select>
            </div>
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                placeholder="e.g. Polity Notes Jan 2025"
                className="form-input"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">{newType === 'upload' ? 'File' : 'URL'}</label>
              {newType === 'upload' ? (
                <input
                  type="file"
                  ref={fileInputRef}
                  className="form-input"
                  style={{ paddingTop: 4, paddingBottom: 4 }}
                  onChange={e => setNewFile(e.target.files?.[0] || null)}
                />
              ) : (
                <input
                  type="text"
                  placeholder="https://…"
                  className="form-input"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="form-label">Subject</label>
              <select
                className="form-input"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="btn btn-primary"
            >
              {isAdding
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Resource</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: '#6366F1' }} />
            <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>All Resources</span>
          </div>
          <span className="text-xs" style={{ color: '#94A3B8' }}>{resources.length} files</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin mb-3" style={{ color: '#6366F1' }} />
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Loading resources…</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: '#94A3B8' }}>
            <FileText className="w-8 h-8 mb-3" />
            <p className="text-sm font-medium">No resources yet</p>
            <p className="text-xs mt-1">Click "Upload File" to add your first resource.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table" style={{ minWidth: 780 }}>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Subsection</th>
                  <th style={{ textAlign: 'center' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r.id}>
                    {/* File title */}
                    <td>
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold line-clamp-1 hover:underline"
                        style={{ color: '#0F172A', maxWidth: 220, display: 'block' }}
                      >
                        {r.title}
                      </a>
                      {successId === r.id && (
                        <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#059669' }}>
                          <CheckCircle className="w-3 h-3" /> Saved
                        </span>
                      )}
                    </td>

                    {/* Type badge */}
                    <td>{getTypeBadge(r.file_type || 'link')}</td>

                    {/* Category */}
                    <td>
                      <select
                        className="form-input"
                        style={{ width: 'auto', minWidth: 130 }}
                        value={r.category || ''}
                        onChange={e => handleUpdateCategory(r.id, e.target.value)}
                        disabled={actionId === r.id}
                      >
                        {!CATEGORIES.includes(r.category) && (
                          <option value={r.category}>{r.category} (old)</option>
                        )}
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>

                    {/* Subsection */}
                    <td>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Ancient History"
                          className="form-input"
                          style={{ minWidth: 140, width: 160 }}
                          value={editSections[r.id] ?? ''}
                          onChange={e => setEditSections(prev => ({ ...prev, [r.id]: e.target.value }))}
                        />
                        {editSections[r.id] !== (r.section || '') && (
                          <button
                            onClick={() => handleUpdateSection(r.id)}
                            className="btn btn-sm btn-secondary flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Delete */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => deleteResource(r.id)}
                        disabled={actionId === r.id}
                        className="btn btn-icon btn-sm"
                        style={{ color: '#EF4444', background: '#FEF2F2' }}
                        title="Delete"
                      >
                        {actionId === r.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
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