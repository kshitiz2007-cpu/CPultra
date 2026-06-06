'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, Languages } from 'lucide-react';

export default function QuizPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    async function initQuiz() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUser(profile);

      const { data: quizData } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
      if (!quizData) { router.push('/dashboard'); return; }

      setQuiz(quizData);
      setTimeLeft(quizData.time_limit * 60);
      setLoading(false);
    }
    initQuiz();
  }, [quizId, router]);

  // FIX: handleSubmit is now async
  const handleSubmit = async () => {
    if (!quiz || !user) return;
    setSubmitting(true);

    let correct = 0;
    const detailedResponses = quiz.questions.map((q: any) => {
      const selectedIndex = answers[q.id];
      const isCorrect = selectedIndex === q.correct;
      if (isCorrect) correct++;
      
      return {
        question: q.text,
        selected_answer: selectedIndex !== undefined ? q.options[selectedIndex] : 'Skipped',
        correct_answer: q.options[q.correct],
        isCorrect: isCorrect,
        explanation: q.explanation || null
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    const { error } = await supabase.from('attempts').insert([{
      user_id: user.id,
      quiz_id: quiz.id,
      score,
      responses: detailedResponses,
      completed_at: new Date().toISOString()
    }]);
    
    if (error) { alert('Submission failed!'); setSubmitting(false); return; }
    router.push(`/quiz/${quiz.id}/result`);
  };

  // Rendering logic must be inside the component
  if (loading || !quiz) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 rounded-full animate-spin"></div></div>;

  const q = quiz.questions[currentQ];
  const progress = Math.round(((currentQ) / quiz.questions.length) * 100);
  
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 min-h-screen flex flex-col">
      <div className="glass-card p-5 mb-6">
        <h1 className="text-xl font-bold text-emerald-950">{quiz.title}</h1>
        <div className="w-full bg-gray-200 h-2 mt-4 rounded-full"><div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div>
      </div>

      <div className="glass-card p-8 flex-1 mb-6">
        <h2 className="text-xl font-bold mb-8">{q.text}</h2>
        <div className="flex flex-col gap-3">
          {q.options.map((opt: string, i: number) => (
            <div key={i} onClick={() => setAnswers({...answers, [q.id]: i})} className={`p-4 rounded-xl border-2 cursor-pointer ${answers[q.id] === i ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
              {opt}
            </div>
          ))}
        </div>
      </div>

      <button onClick={currentQ < quiz.questions.length - 1 ? () => setCurrentQ(currentQ + 1) : handleSubmit} className="w-full bg-emerald-700 text-white font-bold py-4 rounded-xl">
        {currentQ < quiz.questions.length - 1 ? 'Next' : 'Submit Quiz'}
      </button>
    </div>
  );
}