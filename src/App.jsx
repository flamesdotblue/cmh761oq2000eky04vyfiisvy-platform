import React from 'react';
import Hero from './components/Hero';
import ModuleTabs from './components/ModuleTabs';
import FeatureHighlights from './components/FeatureHighlights';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Hero />
      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <FeatureHighlights />
        </section>
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <ModuleTabs />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
