import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-300">
        <p className="text-sm">© {new Date().getFullYear()} Multimodal Emotion AI. All rights reserved.</p>
        <p className="text-xs text-slate-400">Demo-only heuristics. For accurate results, integrate production-grade models and calibration.</p>
      </div>
    </footer>
  );
};

export default Footer;
