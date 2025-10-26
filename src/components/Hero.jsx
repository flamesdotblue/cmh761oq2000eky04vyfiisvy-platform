import React from 'react';
import Spline from '@splinetool/react-spline';
import { Rocket } from 'lucide-react';

const Hero = () => {
  return (
    <header className="relative w-full">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(168,85,247,0.25),transparent_60%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
              <Rocket className="w-3.5 h-3.5 text-purple-300" />
              Multimodal Emotion AI
            </div>
            <h1 className="text-3xl sm:text-5xl font-semibold leading-tight tracking-tight">
              Understand emotions across text, audio, image and video
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-300 max-w-xl">
              A context-aware emotion recognition playground that fuses multiple modalities to enhance human-computer interaction.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <a href="#modules" className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-4 py-2.5 font-medium shadow-lg shadow-fuchsia-500/20 hover:opacity-95 transition-opacity">
                Try the Analyzers
              </a>
              <a href="#learn" className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-medium hover:bg-white/10 transition-colors">
                Learn More
              </a>
            </div>
          </div>
          <div className="order-1 lg:order-2 h-[360px] sm:h-[480px] lg:h-[560px] rounded-2xl overflow-hidden border border-white/10 bg-black/40">
            <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
