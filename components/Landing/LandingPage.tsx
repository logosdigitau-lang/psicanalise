
import React, { useState } from 'react';
import { Service, ClinicalSettings } from '../../types';
import { getAISupport } from '../../services/geminiService';

interface LandingPageProps {
  services: Service[];
  onStartBooking: (service?: Service) => void;
  clinicalSettings: ClinicalSettings;
}

const LandingPage: React.FC<LandingPageProps> = ({ services, onStartBooking, clinicalSettings }) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { content } = clinicalSettings;

  const handleAiAsk = async () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    const result = await getAISupport(aiQuestion);
    setAiResponse(result);
    setIsAiLoading(false);
  };

  const initialService = services.find(s => s.type === 'initial');
  const packageServices = services.filter(s => s.type === 'plan');

  return (
    <div className="fade-in bg-[#FDFBF9]">
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center pt-28 pb-16 md:pt-24 md:pb-20 px-4 md:px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] md:w-[40%] h-full bg-[#7E9084]/5 -z-10 blur-[80px] md:blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 md:gap-16 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6 md:mb-10">
              <span className="h-[1px] w-8 md:w-12 bg-[#7E9084]"></span>
              <span className="text-[#7E9084] text-[10px] md:text-xs font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase">{content.heroSubtitle}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif text-slate-900 leading-tight md:leading-[1.05] mb-6 md:mb-12 whitespace-pre-line">
              {content.heroTitle}
            </h1>
            <p className="text-base md:text-xl text-slate-500 leading-relaxed mb-8 md:mb-14 font-light max-w-xl mx-auto lg:mx-0">
              {content.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center lg:justify-start">
              <button 
                onClick={() => onStartBooking(initialService)}
                className="bg-slate-900 text-white px-8 md:px-12 py-5 md:py-7 rounded-full text-base md:text-lg font-medium transition-all shadow-xl active:scale-95"
              >
                Agendar Consulta Inicial
              </button>
              <button 
                onClick={() => document.getElementById('bio')?.scrollIntoView({behavior: 'smooth'})}
                className="px-8 md:px-12 py-5 md:py-6 rounded-full text-base md:text-lg font-medium text-slate-700 border border-slate-200 hover:bg-white transition-all text-center"
              >
                Sobre o Profissional
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="relative z-10 rounded-[40px] md:rounded-[80px] overflow-hidden shadow-2xl aspect-[4/5] bg-slate-100 max-w-sm mx-auto lg:max-w-none">
              <img 
                src={content.heroImageUrl} 
                alt="Psicanalista" 
                className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Biography Section */}
      <section id="bio" className="py-20 md:py-40 bg-white px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="relative order-2 lg:order-1 max-w-md mx-auto lg:max-w-none">
              <div className="rounded-[30px] md:rounded-[40px] overflow-hidden shadow-xl border-[10px] md:border-[20px] border-[#FDFBF9]">
                <img 
                  src={content.bioImageUrl} 
                  alt={content.bioTitle} 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 text-center lg:text-left">
              <span className="text-[#A67C6A] text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-4 md:mb-6 block">{content.bioSubtitle}</span>
              <h2 className="text-4xl md:text-7xl font-serif text-slate-900 mb-6 md:mb-12 leading-tight">{content.bioTitle}</h2>
              
              <div className="space-y-6 md:space-y-8 text-base md:text-lg text-slate-600 font-light leading-relaxed">
                <p className="font-medium text-slate-800 border-l-0 lg:border-l-4 border-[#7E9084] lg:pl-6 py-2">
                  Uma prática fundamentada no rigor ético e no acolhimento da singularidade de cada sujeito.
                </p>
                <div className="font-normal text-slate-600 whitespace-pre-line">
                  {content.bioText}
                </div>
                <div className="pt-4">
                  <a 
                    href={content.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-[#7E9084] transition-colors group"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.337 2.617 6.78 6.979 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.337-.2 6.78-2.617 6.98-6.979.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Acompanhe no Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-40 bg-slate-900 text-white px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <h2 className="text-4xl md:text-7xl font-serif mb-6 md:mb-8">Investimento Analítico</h2>
            <p className="text-slate-400 font-normal text-base md:text-lg">
              A psicanálise respeita o tempo singular. O acompanhamento é indicado após a consulta clínica inicial.
            </p>
          </div>

          {/* Initial Consultation Highlight */}
          {initialService && (
            <div className="max-w-4xl mx-auto mb-12 md:mb-20">
              <div className="p-8 md:p-12 rounded-[30px] md:rounded-[50px] bg-white text-slate-900 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                <div className="max-w-md text-center md:text-left">
                  <span className="text-[10px] font-bold text-[#A67C6A] tracking-[0.4em] uppercase mb-4 block">Porta de Entrada</span>
                  <h3 className="text-2xl md:text-4xl font-serif mb-4">{initialService.name}</h3>
                  <p className="text-slate-500 font-normal leading-relaxed text-sm md:text-base">
                    {initialService.description}
                  </p>
                </div>
                <div className="text-center md:text-right md:border-l border-slate-100 md:pl-10 w-full md:w-auto">
                  <span className="text-3xl md:text-4xl font-serif block mb-6 text-slate-900">R$ {initialService.price}</span>
                  <button 
                    onClick={() => onStartBooking(initialService)}
                    className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#7E9084] transition-all active:scale-95"
                  >
                    Agendar Agora
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {packageServices.map((service, idx) => (
              <div 
                key={service.id} 
                className="group p-8 md:p-10 rounded-[30px] md:rounded-[50px] bg-white/5 border border-white/10 flex flex-col h-full"
              >
                <span className="text-[10px] font-bold text-white/30 tracking-[0.4em] uppercase mb-6 md:mb-8 block">Pacote 0{idx + 1}</span>
                <h3 className="text-xl md:text-3xl font-serif mb-4 md:mb-6 leading-tight">{service.name}</h3>
                <p className="text-slate-400 font-normal leading-relaxed mb-8 md:mb-10 flex-grow text-sm">
                  {service.description}
                </p>
                <div className="pt-6 md:pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total</span>
                    <span className="font-serif text-lg md:text-xl">R$ {service.price}</span>
                  </div>
                  <button 
                    onClick={() => onStartBooking(service)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant */}
      <section className="py-20 md:py-40 px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-[#F5EBE0]/40 rounded-[40px] md:rounded-[80px] p-10 md:p-24 text-center relative border border-[#F5EBE0]">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-serif text-slate-900 mb-6 md:mb-8 leading-tight">Dúvidas sobre <br />o processo analítico?</h2>
            
            <div className="max-w-2xl mx-auto relative group">
              <input 
                type="text" 
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ex: Como funciona a análise?"
                className="w-full bg-white border-none rounded-full px-6 md:px-10 py-5 md:py-7 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-[#7E9084]/10 shadow-xl transition-all text-base md:text-lg"
              />
              <button 
                onClick={handleAiAsk}
                disabled={isAiLoading}
                className="absolute right-2 top-2 bg-slate-900 text-white p-3 md:p-4 rounded-full hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
              >
                {isAiLoading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                )}
              </button>
            </div>

            {aiResponse && (
              <div className="mt-8 md:mt-16 p-8 md:p-12 bg-white rounded-[30px] md:rounded-[50px] shadow-sm text-left border border-slate-50 fade-in max-w-3xl mx-auto">
                <div className="flex gap-4 md:gap-6">
                  <p className="text-slate-600 leading-relaxed font-normal italic text-lg md:text-xl">
                    "{aiResponse}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
