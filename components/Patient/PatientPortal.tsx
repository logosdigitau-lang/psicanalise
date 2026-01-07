
import React, { useState, useMemo } from 'react';
import { Appointment, Service, ClinicalSettings } from '../../types';

interface PatientPortalProps {
  appointments: Appointment[];
  services: Service[];
  activeEmail: string | null;
  clinicalSettings: ClinicalSettings;
  onLogin: (email: string) => void;
  onLogout: () => void;
  onCancelAppointment: (id: string) => void;
  onNewAppointment: () => void;
}

const PatientPortal: React.FC<PatientPortalProps> = ({ appointments, services, activeEmail, clinicalSettings, onLogin, onLogout, onCancelAppointment, onNewAppointment }) => {
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  const patientAppointments = useMemo(() => {
    if (!activeEmail) return [];
    return appointments
      .filter(a => a.patientEmail && a.patientEmail.toLowerCase() === activeEmail.toLowerCase())
      .sort((a, b) => new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime());
  }, [appointments, activeEmail]);

  const upcomingAppointment = useMemo(() => {
    const now = new Date();
    return [...patientAppointments]
      .filter(a => new Date(a.date + 'T' + a.startTime) >= now && a.status === 'confirmed')
      .sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime())[0];
  }, [patientAppointments]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = appointments.some(a =>
      a.patientEmail && a.patientEmail.toLowerCase() === emailInput.toLowerCase() &&
      a.patientPhone.endsWith(phoneInput)
    );

    if (found) {
      onLogin(emailInput);
      setIsError(false);
    } else {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    }
  };

  const handleOpenCancelModal = (apt: Appointment) => {
    setAppointmentToCancel(apt);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (appointmentToCancel) {
      onCancelAppointment(appointmentToCancel.id);
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    }
  };

  // Verifica se faltam menos de 24h
  const isLateCancellation = useMemo(() => {
    if (!appointmentToCancel) return false;
    const now = new Date();
    const aptTime = new Date(`${appointmentToCancel.date}T${appointmentToCancel.startTime}:00`);
    const diffHours = (aptTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }, [appointmentToCancel]);

  if (!activeEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 md:p-16 shadow-2xl border border-slate-50 fade-in">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#7E9084] rounded-full flex items-center justify-center text-white font-serif text-2xl mx-auto mb-6">P</div>
            <h2 className="text-3xl font-serif text-slate-900 mb-2 italic">Portal do Paciente</h2>
            <p className="text-slate-500 text-sm font-light">Acesse seu histórico terapêutico e agendamentos.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Seu E-mail</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#7E9084] transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Últimos 4 dígitos do WhatsApp</label>
              <input
                type="password"
                maxLength={4}
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0000"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#7E9084] transition-all"
                required
              />
            </div>
            {isError && <p className="text-red-500 text-[10px] font-bold uppercase text-center animate-pulse">Paciente não encontrado</p>}
            <button
              type="submit"
              className="w-full py-5 bg-[#7E9084] text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4"
            >
              Entrar no Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-24 fade-in">
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCancelModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-slate-100 animate-fade-in">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-serif font-bold text-center text-slate-900 mb-4">Política de Cancelamento</h3>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed font-light">
                  Agendamentos devem ser cancelados com no mínimo <span className="font-bold">24 horas de antecedência</span>.
                </p>
              </div>

              {isLateCancellation ? (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-sm text-red-700 leading-relaxed font-bold">
                    Aviso: Como faltam menos de 24h para sua sessão, será cobrado 50% do valor da consulta conforme nossa política clínica.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-sm text-emerald-700 leading-relaxed">
                    Você está dentro do prazo de 24h. O cancelamento não gerará custos extras.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmCancel}
                className="w-full py-4 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
              >
                Confirmar Cancelamento
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-serif text-slate-900">Olá, {patientAppointments[0]?.patientName}</h2>
          <p className="text-slate-500 font-light mt-1 italic">Bem-vindo ao seu espaço de cuidado analítico.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onNewAppointment} className="px-6 py-3 bg-[#7E9084] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#6A7B70] transition-colors shadow-lg shadow-[#7E9084]/20 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Agendar Terapia
          </button>
          <button onClick={onLogout} className="px-6 py-3 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors text-center">Sair</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Próxima Sessão */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-8">Próxima Sessão</p>
            {upcomingAppointment ? (
              <>
                <h3 className="text-5xl font-serif mb-2">{new Date(upcomingAppointment.date + 'T00:00:00').getDate()}</h3>
                <p className="text-xl font-serif italic text-white/60 mb-8 capitalize">
                  {new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(upcomingAppointment.date + 'T00:00:00'))} às {upcomingAppointment.startTime}
                </p>
                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl border border-white/10 mb-6">
                  <div className={`w-3 h-3 rounded-full ${upcomingAppointment.format === 'online' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                  <span className="text-sm font-medium uppercase tracking-widest">{upcomingAppointment.format === 'online' ? 'Videochamada' : 'No Consultório'}</span>
                </div>
                <button
                  onClick={() => handleOpenCancelModal(upcomingAppointment)}
                  className="w-full py-4 bg-white/10 hover:bg-red-500/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 transition-all"
                >
                  Cancelar Sessão
                </button>
              </>
            ) : (
              <p className="text-white/40 italic text-sm py-10">Você não possui sessões agendadas para os próximos dias.</p>
            )}
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Meu Tratamento</h4>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-500">Total de Sessões</span>
                <span className="font-bold text-slate-900">{patientAppointments.length}</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs text-slate-500">Formato Preferencial</span>
                <span className="font-bold text-slate-900 capitalize">{patientAppointments[0]?.format}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico e Reflexões */}
        <div className="lg:col-span-8 space-y-8">

          {/* Advice Card */}
          {activeEmail && clinicalSettings.patientSummaries?.[activeEmail.toLowerCase()] && (
            <div className="bg-[#FAF9F6] border-l-4 border-[#A67C6A] p-8 rounded-r-[30px] shadow-sm animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24 text-[#A67C6A]" fill="currentColor" viewBox="0 0 24 24"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" /></svg>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#A67C6A] mb-4 flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Mensagem do Analista
              </h3>
              <p className="text-slate-700 italic font-light text-lg leading-relaxed relative z-10">
                "{clinicalSettings.patientSummaries[activeEmail.toLowerCase()]}"
              </p>
            </div>
          )}

          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-10">Notas de Reflexão</h3>
            <div className="space-y-8">
              {patientAppointments.filter(a => a.patientFeedback).length > 0 ? (
                patientAppointments.filter(a => a.patientFeedback).map(apt => (
                  <div key={apt.id} className="p-8 bg-[#FAF9F6] border-l-4 border-[#7E9084] rounded-r-3xl relative">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{apt.date}</span>
                    </div>
                    <p className="text-slate-700 italic font-light text-lg leading-relaxed">"{apt.patientFeedback}"</p>
                    <p className="mt-6 text-[9px] font-bold text-[#7E9084] uppercase tracking-widest">Nota do Analista</p>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <p className="text-slate-300 italic text-sm">Ainda não há notas de reflexão compartilhadas pelo analista.</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-8">Histórico de Presenças</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Data</th>
                    <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Serviço</th>
                    <th className="text-left py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="text-right py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Financeiro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {patientAppointments.map(apt => {
                    const service = services.find(s => s.id === apt.serviceId);
                    return (
                      <tr key={apt.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5">
                          <span className="block text-sm font-bold text-slate-900">{apt.date}</span>
                          <span className="text-[10px] text-slate-400">{apt.startTime}</span>
                        </td>
                        <td className="py-5">
                          <span className="text-xs text-slate-600">{service?.name}</span>
                        </td>
                        <td className="py-5">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {apt.status === 'confirmed' ? 'Realizada' : apt.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          <span className="text-sm font-serif font-bold text-slate-900">R$ {service?.price}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPortal;
