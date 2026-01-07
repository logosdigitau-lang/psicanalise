
import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 md:p-16 shadow-2xl border border-slate-50 fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-white font-serif text-2xl mx-auto mb-6">M</div>
          <h2 className="text-3xl font-serif text-slate-900 mb-2 italic">Acesso Restrito</h2>
          <p className="text-slate-500 text-sm font-light">Área administrativa do consultório.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">E-mail Profissional</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Senha de Acesso</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4"
          >
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
};
