
import React from 'react';
import { ClinicalSettings } from '../../types';

interface FooterProps {
  clinicalSettings?: ClinicalSettings;
}

export const Footer: React.FC<FooterProps> = ({ clinicalSettings }) => {
  const content = clinicalSettings?.content || {
    clinicEmail: 'msig12@gmail.com',
    clinicPhone: '(69) 99282-1283',
    clinicAddress: 'Rua Porto Alegre, 1508 B',
    clinicCity: 'Cerejeiras - RO',
    instagramUrl: 'https://www.instagram.com/messiastavarespr/'
  };

  return (
    <footer className="bg-white py-24 px-6 border-t border-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">Psicanalista Messias Tavares</h3>
            <p className="text-slate-500 font-light leading-relaxed max-w-sm mb-8">
              Espaço clínico de orientação freudiana e lacaniana dedicado à escuta qualificada da singularidade humana.
            </p>
            <div className="flex gap-4">
               <a 
                  href={content.instagramUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                  title="Instagram"
               >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.337 2.617 6.78 6.979 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.337-.2 6.78-2.617 6.98-6.979.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
               </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6">Conteúdo</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-light">
              <li className="hover:text-slate-900 cursor-pointer">Início</li>
              <li className="hover:text-slate-900 cursor-pointer">Sobre mim</li>
              <li className="hover:text-slate-900 cursor-pointer">Serviços</li>
              <li className="hover:text-slate-900 cursor-pointer">Agendamento</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-6">Contato</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-light">
              <li>{content.clinicEmail}</li>
              <li>WhatsApp: {content.clinicPhone}</li>
              <li>{content.clinicAddress}</li>
              <li>{content.clinicCity}</li>
            </ul>
          </div>
        </div>
        <div className="mt-24 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-300">© 2024 Messias Tavares. Ética e Sigilo em primeiro lugar.</p>
          <div className="flex gap-8">
            <span className="text-[10px] uppercase tracking-widest text-slate-300 hover:text-slate-900 cursor-pointer">Política de Privacidade</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-300 hover:text-slate-900 cursor-pointer">LGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
