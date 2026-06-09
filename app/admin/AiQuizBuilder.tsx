'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, Sparkles, Save, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const CATEGORIES = [
  'History', 'Geography', 'Polity', 'Economy',
  'Science & Tech', 'Environment', 'Current Affairs',
  'Maths', 'Reasoning', 'GS',
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function AiQuizBuilder() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('History');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const generateQuiz = async () => {
    if (!topic.trim()) return alert('Please enter a topic.');
    setLoading(true);
    setGeneratedQuiz(null);
    setSaved(false);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Create a quiz with ${count} multiple choice questions about "${topic}" for UPSC/MPPSC civil services exam preparation.
Return ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "title": "Quiz Title Here",
  "category": "${category}",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Correct Option text"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const raw = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(raw);
      setGeneratedQuiz(parsed);
    } catch (err) {
      console.error(err);
      alert('AI generation failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!generatedQuiz) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('quizzes').insert([{
        title: generatedQuiz.title,
        category: generatedQuiz.category,
        questions: generatedQuiz.questions,
        active: true,
      }]);
      if (error) throw error;
      setSaved(true);
      setTimeout(() => { setGeneratedQuiz(null); setTopic(''); setSaved(false); }, 2000);
    } catch {
      alert('Error saving quiz to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>AI Quiz Builder</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
          Generate UPSC-ready MCQs instantly using Gemini AI.
        </p>
      </div>

      {/* Configuration panel */}
      <div className="panel p-5">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#0F172A' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#6366F1' }} />
          Configure Quiz
        </h2>

        <div className="space-y-3">
          {/* Topic */}
          <div>
            <label className="form-label">Topic / Prompt</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Maratha Empire and Peshwa Administration, or Indian Constitution — Fundamental Rights"
              className="form-input"
              style={{ minHeight: 80, resize: 'vertical' }}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Question count */}
            <div>
              <label className="form-label">Number of Questions</label>
              <select
                className="form-input"
                value={count}
                onChange={e => setCount(Number(e.target.value))}
              >
                {QUESTION_COUNTS.map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="btn btn-primary w-full justify-center"
            style={{ height: 40 }}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating with Gemini…</>
              : <><Sparkles className="w-4 h-4" /> Generate Quiz</>
            }
          </button>
        </div>
      </div>

      {/* Generated quiz preview */}
      {generatedQuiz && (
        <div className="panel overflow-hidden animate-fade-in">
          <div className="panel-header">
            <div>
              <div className="text-sm font-semibold" style={{ color: '#0F172A' }}>
                {generatedQuiz.title}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>
                {generatedQuiz.questions?.length} questions · {generatedQuiz.category}
              </div>
            </div>
            <button
              onClick={saveToDatabase}
              disabled={saving || saved}
              className="btn btn-primary flex items-center gap-1.5 shrink-0"
            >
              {saved
                ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                : saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save to Platform</>
              }
            </button>
          </div>

          {/* Question list */}
          <div className="p-4 space-y-2">
            {generatedQuiz.questions?.map((q: any, i: number) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {/* Question header */}
                <button
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  className="w-full flex items-start justify-between gap-3 p-3 text-left transition-colors"
                  style={{ background: expandedQ === i ? '#F8FAFC' : 'white' }}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: '#EEF2FF', color: '#6366F1' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium" style={{ color: '#0F172A' }}>
                      {q.question}
                    </span>
                  </div>
                  {expandedQ === i
                    ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
                    : <ChevronDown className="w-4 h-4 shrink-0" style={{ color: '#94A3B8' }} />
                  }
                </button>

                {/* Options */}
                {expandedQ === i && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {q.options?.map((opt: string, j: number) => (
                      <div
                        key={j}
                        className="flex items-center gap-2.5 py-1.5 px-3 rounded"
                        style={{
                          background: opt === q.answer ? '#ECFDF5' : '#F8FAFC',
                          border: `1px solid ${opt === q.answer ? '#A7F3D0' : '#F1F5F9'}`,
                        }}
                      >
                        <span
                          className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center shrink-0"
                          style={{
                            background: opt === q.answer ? '#10B981' : '#E2E8F0',
                            color: opt === q.answer ? 'white' : '#64748B',
                          }}
                        >
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: opt === q.answer ? '#065F46' : '#475569' }}
                        >
                          {opt}
                        </span>
                        {opt === q.answer && (
                          <CheckCircle className="w-3.5 h-3.5 ml-auto shrink-0" style={{ color: '#10B981' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}