'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UploadCloud, FileSpreadsheet, Save, Loader2, CheckCircle, Trash2, Download } from 'lucide-react';

interface ParsedQuestion {
  text: string;
  textHi: string;
  options: string[];
  optionsHi: string[];
  correct: number;
  explanation?: string;
  explanationHi?: string;
}

export default function CsvImporter() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Data States
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [fileName, setFileName] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('GS');
  const [timeLimit, setTimeLimit] = useState(60);

  // Download the golden template
  const downloadTemplate = () => {
    const csvContent = `"Question_EN","Question_HI","Option1_EN","Option2_EN","Option3_EN","Option4_EN","Option1_HI","Option2_HI","Option3_HI","Option4_HI","Correct_Option","Explanation_EN","Explanation_HI"\n"Who was the first Governor-General of independent India?","स्वतंत्र भारत के पहले गवर्नर-जनरल कौन थे?","Lord Mountbatten","C. Rajagopalachari","Rajendra Prasad","Jawaharlal Nehru","लॉर्ड माउंटबेटन","सी. राजगोपालाचारी","राजेंद्र प्रसाद","जवाहरलाल नेहरू",1,"Lord Mountbatten served as the first Governor-General of independent India until June 1948.","लॉर्ड माउंटबेटन ने जून 1948 तक स्वतंत्र भारत के पहले गवर्नर-जनरल के रूप में कार्य किया।"\n"Which planet is known as the Red Planet?","किस ग्रह को लाल ग्रह के नाम से जाना जाता है?","Venus","Jupiter","Mars","Saturn","शुक्र","बृहस्पति","मंगल","शनि",3,"Mars appears red due to iron oxide (rust) on its surface.","मंगल ग्रह अपनी सतह पर आयरन ऑक्साइड (जंग) के कारण लाल दिखाई देता है।"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Bilingual_Quiz_Template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust manual CSV row splitter (handles commas inside quotes)
  const parseCsvRow = (str: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && str[i + 1] === '"') { current += '"'; i++; } // escaped quote
      else if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      return alert('Please upload a valid .csv file');
    }
    setFileName(file.name);
    setQuizTitle(file.name.replace('.csv', ''));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      // Skip header row (lines[0])
      const questions: ParsedQuestion[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvRow(lines[i]);
        if (cols.length >= 11) { // 11 is bare minimum, 13 includes explanations
          // We subtract 1 from the Correct_Option (1-4) to match the array index (0-3)
          const correctIndex = (parseInt(cols[10]) || 1) - 1; 

          questions.push({
            text: cols[0],
            textHi: cols[1],
            options: [cols[2], cols[3], cols[4], cols[5]],
            optionsHi: [cols[6], cols[7], cols[8], cols[9]],
            correct: correctIndex >= 0 && correctIndex <= 3 ? correctIndex : 0,
            explanation: cols[11] || '',
            explanationHi: cols[12] || ''
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const saveToDatabase = async () => {
    if (parsedQuestions.length === 0 || !quizTitle) return;
    setLoading(true);

    const newQuiz = {
      id: `q_${Date.now()}`,
      title: quizTitle,
      category: quizCategory,
      section: quizCategory,
      time_limit: timeLimit,
      is_paid: false,
      price: 0,
      active: false, // Save as draft
      questions: parsedQuestions.map((q, i) => ({ id: `csv_${Date.now()}_${i}`, ...q }))
    };

    const { error } = await supabase.from('quizzes').insert([newQuiz]);

    setLoading(false);
    if (error) {
      alert('Error saving quiz: ' + error.message);
    } else {
      alert('Quiz successfully imported to drafts! 🎉');
      setParsedQuestions([]);
      setFileName('');
      setQuizTitle('');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-emerald-950 font-serif tracking-tight flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-blue-600" /> Bulk CSV Import
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload & Setup */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Download Template Card */}
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
            <h3 className="font-bold text-gray-900 mb-2 relative z-10">1. Prepare your data</h3>
            <p className="text-sm text-gray-600 mb-4 relative z-10">
              Ensure your CSV has these exact 13 columns in order: <br/>
              <span className="text-xs font-mono bg-white/60 px-2 py-2 rounded mt-2 block leading-relaxed border border-gray-200">
                Question_EN, Question_HI,<br/>
                Option1..4_EN, Option1..4_HI,<br/>
                Correct_Option (1-4),<br/>
                Explanation_EN, Explanation_HI
              </span>
            </p>
            <button 
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold py-2.5 rounded-xl transition-colors border border-blue-200 relative z-10"
            >
              <Download className="w-4 h-4" /> Download Sample CSV
            </button>
          </div>

          {/* Drag & Drop Zone */}
          {!parsedQuestions.length ? (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-white/40 backdrop-blur-xl rounded-[2rem] p-10 border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-emerald-900/20 hover:bg-white/60 hover:border-emerald-900/40'
              }`}
            >
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => e.target.files && processFile(e.target.files[0])}
              />
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold text-gray-800 mb-1">Click or Drag CSV here</h3>
              <p className="text-sm text-gray-500">Maximum file size: 5MB</p>
            </div>
          ) : (
            <div className="bg-emerald-50 backdrop-blur-xl rounded-[2rem] p-6 border border-emerald-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <h3 className="font-bold text-emerald-900 truncate">{fileName}</h3>
                  <p className="text-xs text-emerald-700 font-semibold">{parsedQuestions.length} questions parsed</p>
                </div>
              </div>
              <button onClick={() => setParsedQuestions([])} className="p-2 bg-white/60 hover:bg-red-100 hover:text-red-600 rounded-xl transition-colors shrink-0">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Quiz Metadata Form */}
          <div className={`transition-all duration-500 ${parsedQuestions.length ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
            <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/60 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 mb-2">2. Module Details</h3>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Title</label>
                <input 
                  type="text" 
                  className="glass-input w-full rounded-xl p-3 border border-gray-200"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Category</label>
                  <select 
                    className="glass-input w-full rounded-xl p-3 border border-gray-200"
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value)}
                  >
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Polity">Polity</option>
                    <option value="Economy">Economy</option>
                    <option value="Science & Tech">Sci & Tech</option>
                    <option value="Current Affairs">Current Affairs</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Time (Mins)</label>
                  <input 
                    type="number" 
                    className="glass-input w-full rounded-xl p-3 border border-gray-200"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                  />
                </div>
              </div>

              <button 
                onClick={saveToDatabase}
                disabled={loading || !parsedQuestions.length || !quizTitle}
                className="w-full mt-4 bg-emerald-950 hover:bg-emerald-800 text-white font-bold py-4 rounded-xl transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Importing...' : 'Save to Drafts'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Data Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm h-full min-h-[500px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/60 bg-white/20">
              <h3 className="font-bold text-gray-900">3. Data Preview</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">Review the parsed CSV rows before importing.</p>
            </div>
            
            <div className="p-6 flex-1 overflow-auto">
              {!parsedQuestions.length ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <FileSpreadsheet className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-sm font-bold text-gray-600">No data loaded.</p>
                  <p className="text-xs text-gray-500">Upload a CSV to see the preview here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {parsedQuestions.slice(0, 10).map((q, i) => (
                    <div key={i} className="bg-white/60 rounded-xl p-4 border border-white/80 shadow-sm text-sm">
                      
                      {/* English Row */}
                      <div className="flex gap-2 mb-2">
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs h-fit">EN</span>
                        <span className="font-semibold text-gray-800 flex-1">{q.text}</span>
                      </div>
                      
                      {/* Hindi Row */}
                      <div className="flex gap-2 mb-4">
                        <span className="font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded text-xs h-fit">HI</span>
                        <span className="font-semibold text-gray-800 flex-1">{q.textHi}</span>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mt-3">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className={`p-2 rounded-lg border ${q.correct === oIdx ? 'bg-emerald-100 border-emerald-300 font-bold text-emerald-800' : 'bg-white border-gray-100'}`}>
                            {String.fromCharCode(65 + oIdx)}. {opt}
                            <div className="text-[10px] text-gray-400 mt-1 pt-1 border-t border-gray-200/50">{q.optionsHi[oIdx]}</div>
                          </div>
                        ))}
                      </div>

                      {/* Explanation Preview */}
                      {(q.explanation || q.explanationHi) && (
                        <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
                          <span className="font-bold text-blue-800 block mb-1">Explanation:</span>
                          <p className="text-blue-900 mb-1">{q.explanation}</p>
                          <p className="text-blue-700">{q.explanationHi}</p>
                        </div>
                      )}

                    </div>
                  ))}
                  {parsedQuestions.length > 10 && (
                    <div className="text-center py-4 text-sm font-bold text-gray-400">
                      + {parsedQuestions.length - 10} more questions hidden for preview
                    </div>
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