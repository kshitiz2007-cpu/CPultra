'use client';

import { FileText, ArrowUpRight } from 'lucide-react';

interface ResourcesProps {
  resources: any[];
}

export default function RecommendedResources({ resources }: ResourcesProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl space-y-4 shadow-xl">
      <h3 className="font-bold text-lg text-white">Recommended Resources</h3>
      <div className="space-y-3">
        {resources.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/30 font-medium">
            No active learning materials linked.
          </div>
        ) : (
          resources.map((file, idx) => (
            <div
              key={file.id || idx}
              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 shrink-0">
                  <FileText className="h-4 w-4 text-rose-400" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate tracking-wide">
                    {file.title || 'Untitled Material Document'}
                  </h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/40 uppercase tracking-widest font-black mt-1">
                    {file.category || 'Polity'}
                  </span>
                </div>
              </div>
              
              <a 
                href={file.file_url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg transition-colors shrink-0 ml-2 border border-white/5"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}