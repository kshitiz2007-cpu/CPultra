'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, Sparkles, Save } from 'lucide-react';

// Initialize AI (Ensure your API Key is in your .env.local file)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export default function AiQuizGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);

  const generateQuiz = async () => {
    if (!prompt) return alert('Please enter a topic!');
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const fullPrompt = `Create a quiz with 5 multiple choice questions about "${prompt}". 
      Return ONLY a JSON object in this exact format:
      {
        "title": "Quiz Title",
        "category": "General",
        "questions": [
          {
            "question": "Question text?",
            "options": ["A", "B", "C", "D"],
            "answer": "Correct Answer"
          }
        ]
      }`;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsedData = JSON.parse(responseText);
      setGeneratedQuiz(parsedData);
    } catch (error) {
      console.error('AI Error:', error);
      alert('Failed to generate quiz. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async () => {
    if (!generatedQuiz) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('quizzes').insert([{
        title: generatedQuiz.title,
        category: generatedQuiz.category,
        questions: generatedQuiz.questions,
        active: true
      }]);

      if (error) throw error;
      alert('Quiz saved successfully!');
      setGeneratedQuiz(null);
      setPrompt('');
    } catch (error) {
      alert('Error saving to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/40 p-6 rounded-2xl border border-white/60">
        <h2 className="text-xl font-black text-emerald-950 mb-4">AI Quiz Generator</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a topic, e.g., 'Indian History - Mughal Empire'"
          className="w-full h-32 p-4 rounded-xl border border-white/60 bg-white/50 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={generateQuiz}
          disabled={loading}
          className="w-full bg-emerald-950 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Sparkles className="w-5 h-5" /> Generate Quiz</>}
        </button>
      </div>

      {generatedQuiz && (
        <div className="bg-white/80 p-6 rounded-2xl border border-emerald-100 shadow-xl">
          <h3 className="text-lg font-bold text-emerald-950 mb-4">{generatedQuiz.title}</h3>
          <button
            onClick={saveToDatabase}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Save className="w-5 h-5" /> Save to Platform
          </button>
        </div>
      )}
    </div>
  );
}
