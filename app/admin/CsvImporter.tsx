'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UploadCloud, FileSpreadsheet, Save, Loader2, CheckCircle, Trash2, Info } from 'lucide-react';

interface ParsedQuestion {
  text: string;
  textHi: string;
  options: string[];
  optionsHi: string[];
  correct: number;
}

const CATEGORIES = ['History','Geography','Polity','Economy','Science & Tech','Environment','Current Affairs','Maths','Reasoning','GS'];

export default function CsvImporter() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [fileName, setFileName] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('GS');
  const [timeLimit, setTimeLimit] = useState(60);

  const parseCsvRow = (str: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && str[i + 1] === '"') { current += '"'; i++; }
      else if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) return alert('Please upload a valid .csv file');
    setFileName(file.name);
    setQuizTitle(file.name.replace('.csv', ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const questions: ParsedQuestion[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvRow(lines[i]);
        if (cols.length >= 11) {
          questions.push({
            text: cols[0], textHi: cols[1],
            options: [cols[2], cols[3], cols[4], cols[5]],
            optionsHi: [cols[6], cols[7], cols[8], cols[9]],
            correct: parseInt(cols[10]) || 0
          });
        }
      }
      setParsedQuestions(questions);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const saveToDatabase = async () => {
    if (!parsedQuestions.length || !quizTitle) return;
    setLoading(true);
    const newQuiz = {
      id: `q_${Date.now()}`,
      title: quizTitle,
      category: quizCategory,
      section: quizCategory,
      time_limit: timeLimit,
      is_paid: false,
      price: 0,
      active: false,
      questions: parsedQuestions.map((q, i) => ({ id: `csv_${Date.now()}_${i}`, ...q }))
    };
    const { error } = await supabase.from('quizzes').insert([newQuiz]);
    setLoading(false);
    if (error) {
      alert('Error saving quiz: ' + error.message);
    } else {
      alert('Quiz successfully imported to drafts!');
      setParsedQuestions([]); setFileName(''); setQuizTitle('');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>CSV Import</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Bulk-import quiz questions from a spreadsheet.</p>
      </div>

      {/* Format reference */}
      <div
        className="flex items-start gap-3 p-4 rounded-lg"
        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}
      >
        <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#3B82F6' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1D4ED8' }}>Required CSV format — 11 columns in order:</p>
          <code
            className="text-xs mt-1 block px-2 py-1 rounded font-mono"
            style={{ background: '#DBEAFE', color: '#1E40AF' }}
          >
            EN_Q, HI_Q, EN_Opt1, EN_Opt2, EN_Opt3, EN_Opt4, HI_Opt1, HI_Opt2, HI_Opt3, HI_Opt4, CorrectIndex(0–3)
          </code>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT: Upload + metadata */}
        <div className="lg:col-span-1 space-y-4">

          {/* Drop zone / file uploaded */}
          {!parsedQuestions.length ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="panel p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
              style={{
                borderStyle: 'dashed',
                borderColor: isDragging ? '#6366F1' : '#CBD5E1',
                background: isDragging ? '#EEF2FF' : 'white',
              }}
            >
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef}
                onChange={(e) => e.target.files && processFile(e.target.files[0])} />
              <UploadCloud
                className="w-8 h-8 mb-3"
                style={{ color: isDragging ? '#6366F1' : '#94A3B8' }}
              />
              <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                {isDragging ? 'Drop to upload' : 'Click or drag CSV here'}
              </p>
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>Max 5MB · .csv only</p>
            </div>
          ) : (
            <div
              className="panel p-4 flex items-center justify-between"
              style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#10B981' }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#065F46' }}>{fileName}</p>
                  <p className="text-xs" style={{ color: '#059669' }}>{parsedQuestions.length} questions parsed</p>
                </div>
              </div>
              <button
                onClick={() => setParsedQuestions([])}
                className="btn btn-icon btn-sm shrink-0"
                style={{ color: '#EF4444', background: 'white' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Metadata form */}
          <div
            className="panel p-4 space-y-3 transition-opacity"
            style={{ opacity: parsedQuestions.length ? 1 : 0.45, pointerEvents: parsedQuestions.length ? 'auto' : 'none' }}
          >
            <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>Module details</p>

            <div>
              <label className="form-label">Quiz title</label>
              <input type="text" className="form-input" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Category</label>
                <select className="form-input" value={quizCategory} onChange={e => setQuizCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Time (mins)</label>
                <input type="number" className="form-input" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
              </div>
            </div>

            <button
              onClick={saveToDatabase}
              disabled={loading || !parsedQuestions.length || !quizTitle}
              className="btn btn-primary w-full justify-center mt-1"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                : <><Save className="w-4 h-4" /> Save to Drafts</>
              }
            </button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="lg:col-span-2">
          <div className="panel overflow-hidden h-full" style={{ minHeight: 400 }}>
            <div className="panel-header">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" style={{ color: '#6366F1' }} />
                <span className="text-sm font-semibold" style={{ color: '#0F172A' }}>Data Preview</span>
              </div>
              {parsedQuestions.length > 0 && (
                <span className="text-xs" style={{ color: '#94A3B8' }}>
                  Showing first {Math.min(10, parsedQuestions.length)} of {parsedQuestions.length}
                </span>
              )}
            </div>

            <div className="p-4 overflow-auto" style={{ maxHeight: 560 }}>
              {!parsedQuestions.length ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: '#94A3B8' }}>
                  <FileSpreadsheet className="w-8 h-8 mb-3" />
                  <p className="text-sm font-medium">No data loaded yet</p>
                  <p className="text-xs mt-1">Upload a CSV to preview it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {parsedQuestions.slice(0, 10).map((q, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                          style={{ background: '#EEF2FF', color: '#6366F1' }}
                        >
                          Q{i + 1}
                        </span>
                        <span className="text-xs font-medium line-clamp-2" style={{ color: '#0F172A' }}>{q.text}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: q.correct === oIdx ? '#ECFDF5' : 'white',
                              border: `1px solid ${q.correct === oIdx ? '#A7F3D0' : '#E2E8F0'}`,
                              color: q.correct === oIdx ? '#065F46' : '#475569',
                              fontWeight: q.correct === oIdx ? 600 : 400,
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {parsedQuestions.length > 10 && (
                    <p className="text-xs text-center py-3" style={{ color: '#94A3B8' }}>
                      + {parsedQuestions.length - 10} more questions not shown
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}