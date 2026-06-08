'use client';

import {
  BookOpen,
  FileText,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export interface Resource {
  id: string;
  title: string;
  category: string;
  description?: string;
  file_url?: string;
}

interface RecommendedResourcesProps {
  resources: Resource[];
  onViewAll?: () => void;
}

export default function RecommendedResources({
  resources,
  onViewAll,
}: RecommendedResourcesProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 md:p-8">

      <div className="absolute -top-20 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />

      <div className="relative z-10">

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-2xl font-black text-white">
              Recommended Resources
            </h2>

            <p className="text-white/50 text-sm mt-1">
              Curated study materials for your preparation.
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">

          {resources.map((resource) => (
            <div
              key={resource.id}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
            >

              <div className="flex items-center justify-between">

                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>

                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60">
                  {resource.category}
                </span>

              </div>

              <h3 className="mt-4 text-white font-bold line-clamp-2">
                {resource.title}
              </h3>

              <p className="mt-2 text-sm text-white/50 line-clamp-3">
                {resource.description || 'Premium UPSC study material'}
              </p>

              <a
                href={resource.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold"
              >
                Open Resource
                <ExternalLink className="w-4 h-4" />
              </a>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}