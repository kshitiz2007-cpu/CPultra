'use client';

import { FileText, Compass, MessageSquareCode, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SystemToolsMatrix() {
  const router = useRouter();

  const tools = [
    { id: 'mock', label: 'Launch Mock Engine', icon: FileText, color: 'text-emerald-400', desc: 'Full-length GS Papers', path: '/dashboard/tests' },
    { id: 'syllabus', label: 'Syllabus Navigator', icon: Compass, color: 'text-blue-400', desc: 'UPSC micro-topic map', path: '/dashboard/syllabus' },
    { id: 'ai-review', label: 'AI Review Assistant', icon: MessageSquareCode, color: 'text-purple-400', desc: 'Mains answer evaluation', path: '/dashboard/ai-review' },
    { id: 'errors', label: 'Error Log Analyzer', icon: ShieldAlert, color: 'text-rose-400', desc: 'Review incorrect metrics', path: '/dashboard/analytics/errors' },
  ];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-2xl space-y-4 shadow-xl w-full">
      <h3 className="font-bold text-lg text-white tracking-tight">System Tools Matrix</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {tools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id || idx}
              onClick={() => router.push(tool.path)}
              className="text-left flex items-center gap-3.5 p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 transition-all duration-200 group active:scale-[0.98]"
            >
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors shrink-0">
                <Icon className={`h-4 w-4 ${tool.color}`} />
              </div>
              <div className="overflow-hidden space-y-0.5">
                <div className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                  {tool.label}
                </div>
                <div className="text-[10px] text-white/40 font-medium tracking-wide line-clamp-1">
                  {tool.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}