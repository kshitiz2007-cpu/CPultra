'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles, Save, Loader2, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Question {
  text: string;
  textHi: string;
  options: string[];
  optionsHi: string[];
  correct: number;
}

export default function AiQuizBuilder() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('GS');

  const generateQuiz = async () => {
    if (!topic) return alert('Please enter a topic or paste text.');
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert educator. Generate a multiple-choice quiz about: "${topic}".
        Create exactly ${numQuestions} questions.
        The output MUST be a valid JSON array of objects. 
        Do not include any markdown formatting like \`\`\`json.
        Each object must have exactly this structure:
        {
          "text": "Question in English",
          "textHi": "Question in Hindi",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
          "correct": 0
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedQuestions = JSON.parse(responseText);
      setGeneratedQuestions(parsedQuestions);
      setQuizTitle(`AI Quiz: ${topic.substring(0, 25)}...`);
    } catch (error) {
      console.error(error);
      alert('Failed to generate quiz. Check your API configurations.');
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!generatedQuestions || !quizTitle) return;
    setLoading(true);

    const newQuiz = {
      id: `q_${Date.now()}`,
      title: quizTitle,
      category: quizCategory,
      section: quizCategory,
      time_limit: numQuestions,
      is_paid: false,
      price: 0,
      active: false,
      questions: generatedQuestions.map((q, i) => ({ id: `gen_${i}`, ...q }))
    };

    const { error } = await supabase.from('quizzes').insert([newQuiz]);

    setLoading(false);
    if (error) {
      alert('Error saving quiz: ' + error.message);
    } else {
      alert('Quiz successfully saved to drafts!');
      setGeneratedQuestions(null);
      setTopic('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-white pb-20">
      <div>
        <h2 className="text-4xl font-black text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse"/> AI Generation Studio
        </h2>
        <p className="text-white/60 mt-2">Produce localized bilingual questions in real time with Gemini Engine</p>
      </div>

      {!generatedQuestions ? (
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider">
                Topic or Source Reference Data
              </label>
              <textarea 
                className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20 resize-y" 
                placeholder="Paste prompt modules, raw notes, or direct topics like 'UPSC Laxmikanth Fundamental Rights'..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Number of Questions</label>
                <input 
                  type="number" 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  min="1" max="25" value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Assigned Folder</label>
                <select 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 outline-none"
                  value={quizCategory} onChange={(e) => setQuizCategory(e.target.value)}
                >
                  <option value="GS" className="bg-[#0f172a]">General Studies</option>
                  <option value="CA" className="bg-[#0f172a]">Current Affairs</option>
                  <option value="Maths" className="bg-[#0f172a]">Mathematics</option>
                  <option value="Reasoning" className="bg-[#0f172a]">Reasoning</option>
                </select>
              </div>
            </div>

            <button 
              onClick={generateQuiz} disabled={loading}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
              {loading ? 'Synthesizing with Gemini AI...' : 'Generate Bilingual Core Module'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white">Review System Generation</h3>
            <input 
              type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold" 
              value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((q, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative group border-l-4 border-emerald-500">
                <button 
                  onClick={() => setGeneratedQuestions(generatedQuestions.filter((_, idx) => idx !== i))}
                  className="absolute top-4 right-4 p-2 bg-white/5 text-rose-400 border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20"
                >
                  <X className="w-4 h-4"/>
                </button>
                
                <p className="font-bold text-white mb-2"><span className="text-emerald-400">Q{i + 1} (EN):</span> {q.text}</p>
                <p className="text-white/80 font-serif mb-4"><span className="text-cyan-400 font-sans font-bold">Q{i + 1} (HI):</span> {q.textHi}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className={`p-3 rounded-xl border ${q.correct === optIdx ? 'bg-emerald-500/10 border-emerald-500/40 font-bold text-emerald-200' : 'bg-white/[0.02] border-white/10'}`}>
                      <div className="mb-1">{String.fromCharCode(65 + optIdx)}. {opt}</div>
                      <div className="text-white/40 text-xs font-serif">{q.optionsHi[optIdx]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 sticky bottom-6 z-20">
            <button 
              onClick={() => setGeneratedQuestions(null)}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition-all"
            >
              Discard Output
            </button>
            <button 
              onClick={saveToDatabase} disabled={loading}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
              Commit as Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
