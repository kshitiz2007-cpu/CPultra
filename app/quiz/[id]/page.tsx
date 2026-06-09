'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useParams } from 'next/navigation';
import { Clock, ChevronRight, ChevronLeft, CheckCircle2, Languages, BookOpen } from 'lucide-react';

interface Question {
  id: string; text: string; textHi?: string;
  options: string[]; optionsHi?: string[]; correct: number;
}
interface Quiz {
  id: string; title: string; titleHi?: string;
  category: string; time_limit: number; questions: Question[];
}

export default function QuizPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
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

      const { data: quizData, error } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
      if (error || !quizData) { alert('Quiz not found!'); router.push('/dashboard'); return; }

      setQuiz(quizData as Quiz);
      setTimeLeft(quizData.time_limit * 60);
      setLoading(false);
    }
    initQuiz();
  }, [quizId, router]);

  useEffect(() => {
    if (timeLeft <= 0 || loading || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, submitting]);

  const handleSelectOption = (optIndex: number) => {
    if (!quiz) return;
    const q = quiz.questions[currentQ];
    setAnswers({ ...answers, [q.id]: optIndex });
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    setSubmitting(true);

    let correct = 0, wrong = 0, skipped = 0;
    const total = quiz.questions.length;

    const details = quiz.questions.map(q => {
      const ans = answers[q.id];
      let status = 'skipped';
      if (ans === undefined) { skipped++; }
      else if (ans === q.correct) { correct++; status = 'correct'; }
      else { wrong++; status = 'wrong'; }
      return { qid: q.id, selected: ans !== undefined ? ans : null, correct: q.correct, status };
    });

    const score = Math.round((correct / total) * 100);
    const attempt = {
      id: `a_${Date.now()}`, user_id: user.id, user_name: user.name || user.email,
      quiz_id: quiz.id, quiz_title: quiz.title, quiz_title_hi: quiz.titleHi || '',
      category: quiz.category, score, correct, wrong, skipped, total, details,
      completed_at: new Date().toISOString()
    };

    const { error } = await supabase.from('attempts').insert([attempt]);
    if (error) { alert('Failed to save attempt. Please try again.'); setSubmitting(false); return; }

    alert(`Quiz submitted! You scored ${score}%`);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F1F5F9' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (!quiz) return null;

  const totalQs = quiz.questions.length;
  const q = quiz.questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const progress = (currentQ / totalQs) * 100;

  const isHi = lang === 'hi';
  const hasHi = !!q.textHi;
  const qText = isHi && q.textHi ? q.textHi : q.text;
  const opts = isHi && q.optionsHi?.length ? q.optionsHi : q.options;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const timeString = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const isWarning = timeLeft <= 60;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>

      {/* Sticky quiz header */}
      <header
        className="sticky top-0 z-20"
        style={{ background: 'white', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: '#6366F1' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: '#64748B' }}>
                Question {currentQ + 1} of {totalQs}
              </span>
              <span className="text-xs" style={{ color: '#94A3B8' }}>
                {answeredCount} answered
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E2E8F0' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: '#6366F1' }}
              />
            </div>
          </div>

          {/* Timer */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold shrink-0"
            style={{
              background: isWarning ? '#FEF2F2' : '#F1F5F9',
              color: isWarning ? '#DC2626' : '#475569',
              border: `1px solid ${isWarning ? '#FECACA' : '#E2E8F0'}`,
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            {timeString}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">

        {/* Quiz title + category */}
        <div className="mb-6">
          <span className="badge badge-accent">{quiz.category}</span>
          <h1 className="text-base font-semibold mt-2" style={{ color: '#475569' }}>
            {quiz.title}
          </h1>
        </div>

        {/* Language toggle */}
        {hasHi && (
          <div
            className="flex items-center justify-between p-3 rounded-lg mb-5"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
          >
            <span className="text-xs font-semibold flex items-center gap-2" style={{ color: '#92400E' }}>
              <Languages className="w-3.5 h-3.5" /> Language / भाषा
            </span>
            <div className="segment">
              <button
                onClick={() => setLang('en')}
                className={`segment-item ${lang === 'en' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.625rem' }}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`segment-item ${lang === 'hi' ? 'active' : ''}`}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.625rem' }}
              >
                हिंदी
              </button>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="panel p-6 mb-5">
          <p
            className="text-base font-medium leading-relaxed mb-6"
            style={{ color: '#0F172A', fontFamily: isHi ? 'serif' : 'inherit' }}
          >
            {qText}
          </p>

          <div className="space-y-2.5">
            {opts.map((opt, i) => {
              const isSelected = answers[q.id] === i;
              return (
                <div
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  className="flex items-start gap-3 p-3.5 rounded-lg cursor-pointer transition-all"
                  style={{
                    border: `1.5px solid ${isSelected ? '#6366F1' : '#E2E8F0'}`,
                    background: isSelected ? '#EEF2FF' : 'white',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#A5B4FC'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  <div
                    className="w-7 h-7 shrink-0 flex items-center justify-center rounded text-xs font-bold mt-0.5"
                    style={{
                      background: isSelected ? '#6366F1' : '#F1F5F9',
                      color: isSelected ? 'white' : '#64748B',
                      border: `1.5px solid ${isSelected ? '#6366F1' : '#E2E8F0'}`,
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span
                    className="text-sm pt-0.5"
                    style={{
                      color: isSelected ? '#3730A3' : '#374151',
                      fontFamily: isHi ? 'serif' : 'inherit',
                      fontWeight: isSelected ? 500 : 400,
                    }}
                  >
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ(p => p - 1)}
              className="btn btn-secondary flex items-center gap-1.5"
              style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
          )}

          {currentQ < totalQs - 1 ? (
            <button
              onClick={() => {
                if (answers[q.id] === undefined) { alert('Please select an option to continue.'); return; }
                setCurrentQ(p => p + 1);
              }}
              className="btn btn-primary flex items-center gap-1.5"
              style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary flex items-center gap-1.5"
              style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', background: '#059669' }}
            >
              {submitting
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                : <><CheckCircle2 className="w-4 h-4" /> Submit Quiz</>
              }
            </button>
          )}
        </div>

        {/* Abandon */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { if (confirm('Abandon this quiz? Progress will be lost.')) router.push('/dashboard'); }}
            className="text-xs font-medium transition-colors"
            style={{ color: '#CBD5E1' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
          >
            Abandon Quiz
          </button>
        </div>
      </main>
    </div>
  );
}