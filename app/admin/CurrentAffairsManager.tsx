'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FilePlus, Loader2, CheckCircle, Upload, Link2 } from 'lucide-react';

export default function CurrentAffairsManager() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Polity & Governance');
  const [summary, setSummary] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  // Upload states
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload to Supabase Storage
  const handleLocalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      setUploadSuccess(false);

      // Create a clean unique filename to avoid collision duplicates
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload file to Supabase storage bucket
      const { data, error: uploadError } = await supabase.storage
        .from('current-affairs-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('current-affairs-files')
        .getPublicUrl(filePath);

      setFileUrl(publicUrl);
      setUploadSuccess(true);
    } catch (err: any) {
      console.error('Storage upload failed:', err);
      alert('File upload failed: ' + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

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
      setUploadSuccess(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
            placeholder="e.g., Summary of Economic Survey 2026"
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

        {/* ATTACHMENT SECTION (LOCAL STORAGE + BACKUP LINK INPUT) */}
        <div className="space-y-3">
          <label className="block text-white/70 font-semibold">Document Attachment (PDF / Images)</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Local Upload Trigger Box */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLocalFileUpload}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                id="local-file-picker"
                disabled={uploadingFile}
              />
              <label
                htmlFor="local-file-picker"
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed text-xs font-bold cursor-pointer transition-all ${
                  uploadSuccess
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {uploadingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Uploading file...</span>
                  </>
                ) : uploadSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>File Uploaded Successfully</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload from Local Storage</span>
                  </>
                )}
              </label>
            </div>

            {/* Manual URL Input Trigger Box */}
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => {
                  setFileUrl(e.target.value);
                  if (e.target.value === '') setUploadSuccess(false);
                }}
                placeholder="Or paste external document URL..."
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none text-xs text-white placeholder:text-white/20 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
          
          {fileUrl && (
            <p className="text-[11px] text-emerald-400 truncate bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
              <strong>Target URL:</strong> {fileUrl}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingFile}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 font-bold py-4 rounded-xl shadow-lg transition-opacity active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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