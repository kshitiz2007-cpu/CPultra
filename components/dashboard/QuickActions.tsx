'use client';

import { FileText, Compass, MessageSquareCode, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const tools = [
    { id: 'mock', label: 'Launch Mock Engine', icon: FileText, color: 'text-emerald-400', desc: 'Full-length GS Papers' },
    { id: 'syllabus', label: 'Syllabus Navigator', icon: Compass, color: 'text-blue-400', desc: 'UPSC micro-topic map' },
    { id: 'ai-review', label: 'AI Review Assistant', icon: MessageSquareCode, color: 'text-purple-400', desc: 'Mains answer evaluation' },
    { id: 'errors', label: 'Error Log Analyzer', icon: ShieldAlert, color: 'text-rose-400', desc: 'Review incorrect metrics' },
  ];

  const handleAction = (id: string) => {
    switch (id) {
      case 'mock':
        // Route directly to your live test engine interface
        router.push('/dashboard/tests');
        break;
      case 'syllabus':
        router.push('/dashboard/syllabus-tracker');
        break;
      case 'ai-review':
        router.push('/dashboard/ai-mains-evaluator');
        break;
      case 'errors':
        router.push('/dashboard/performance/errors');
        break;
      default:
        console.warn(`Action vector ${id} unhandled.`);
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl space-y-4 shadow-md">
      <h3 className="font-bold text-lg text-white">System Tools Matrix</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleAction(tool.id)}
              className="text-left flex items-start gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 transition-all duration-200 group active:scale-[0.98]"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5 transition-colors shrink-0">
                <Icon className={`h-4 w-4 ${tool.color}`} />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                  {tool.label}
                </div>
                <div className="text-[10px] text-white/40 font-medium mt-0.5 line-clamp-1">
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