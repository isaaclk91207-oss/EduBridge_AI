'use client';

import { Github, Linkedin, Twitter } from 'lucide-react';

export default function SocialLinks() {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
      >
        <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
      </a>
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
      >
        <Linkedin className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
      </a>
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
      >
        <Twitter className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
      </a>
    </div>
  );
}
