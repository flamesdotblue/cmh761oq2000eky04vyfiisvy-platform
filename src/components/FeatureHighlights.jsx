import React from 'react';
import { Cpu, Waves, Images, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Text Analysis',
    desc: 'Extract sentiment and emotion cues from written content with lightweight heuristics.',
  },
  {
    icon: Waves,
    title: 'Audio Analysis',
    desc: 'Record speech in-browser, transcribe (if available), and estimate energy for tone insights.',
  },
  {
    icon: Images,
    title: 'Image & Video',
    desc: 'Run client-side visual cues to estimate facial emotion likelihoods for quick demos.',
  },
  {
    icon: Cpu,
    title: 'Multimodal Fusion',
    desc: 'Designed to extend with server models to combine modalities for robust understanding.',
  },
];

const FeatureHighlights = () => {
  return (
    <div id="learn" className="">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Built for multimodal emotion recognition</h2>
      <p className="text-slate-300 mb-8 max-w-3xl">
        Explore four dedicated modules below. This demo uses on-device heuristics and web APIs, and can be extended to connect with cloud models for production-grade performance.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <f.icon className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="font-medium">{f.title}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300/90">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;
