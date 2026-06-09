'use client';

import { FileText, ArrowUpRight, Link2 } from 'lucide-react';

interface RecommendedResourcesProps {
  resources: any[];
}

export default function RecommendedResources({ resources }: RecommendedResourcesProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl space-y-4">
      <h3 className="font-bold text-lg text-white">Recommended Resources</h3>
      <div className="space-y-3">
        {resources.length === 0 ? (
          <div className="text-center py-4 text-xs text-white/30 font-medium">
            No active learning artifacts streamed.
          </div>
        ) : (
          resources.map((file, idx) => (
            <div
              key={file.id || idx}
              className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-white/5 shrink-0">
                  {file.file_type === 'pdf' ? (
                    <FileText className="h-4 w-4 text-rose-400" />
                  ) : (
                    <Link2 className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{file.title}</h4>
                  <span className="inline-block px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/50 uppercase tracking-wider font-semibold mt-1">
                    {file.category || 'General'}
                  </span>
                </div>
              </div>
              <a 
                href={file.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors shrink-0 ml-2"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}