
import React, { useState } from 'react';
import { ClinicalSettings, Staff } from '../../../types';
import { GoogleCalendarService } from '../../../services/googleCalendarService';

interface AdminIntegrationsProps {
    clinicalSettings: ClinicalSettings;
    onUpdateSettings: (settings: ClinicalSettings) => void;
}

export const AdminIntegrations: React.FC<AdminIntegrationsProps> = ({ clinicalSettings, onUpdateSettings }) => {

    const handleGoogleConnect = async () => {
        try {
            await GoogleCalendarService.init();
            const token = await GoogleCalendarService.requestAccessToken();
            if (token) {
                onUpdateSettings({
                    ...clinicalSettings,
                    integrations: {
                        ...clinicalSettings.integrations,
                        googleCalendarConnected: true,
                        googleAccessToken: token,
                        // We do not overwrite googleEmail here, relying on user input or previous state
                    }
                });
                alert('Google Agenda conectado!');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao conectar Google Agenda. Verifique o console.');
        }
    };

    return (
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-12 animate-fade-in">
            <h2 className="text-3xl font-serif text-slate-900 italic">Conexões Externas</h2>

            {/* Google Calendar */}
            <div className="p-8 rounded-[35px] border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-grow space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2h-1V1a1 1 0 00-2 0v1h-3V1a1 1 0 10-2 0v1H9V1a1 1 0 00-2 0v1H6V1a1 1 0 00-2 0v1H3a1 1 0 00-1 1v20a1 1 0 001 1h18a1 1 0 001-1V3a1 1 0 00-1-1zm-1 20H4V8h16v14z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900">Google Agenda</h4>
                            <p className="text-sm text-slate-500">Sincronize seus agendamentos automaticamente.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">E-mail da Conta Google (ID da Agenda)</label>
                        <input
                            type="text"
                            placeholder="exemplo@gmail.com"
                            value={clinicalSettings.integrations.googleEmail || ''}
                            onChange={(e) => onUpdateSettings({
                                ...clinicalSettings,
                                integrations: { ...clinicalSettings.integrations, googleEmail: e.target.value }
                            })}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all focus:border-blue-200 focus:ring-4 focus:ring-blue-50"
                        />
                        <p className="text-[10px] text-slate-400 ml-1">Para contas pessoais, geralmente é o próprio e-mail.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Link de Agendamento (Google Appointments)</label>
                        <input
                            type="text"
                            placeholder="https://calendar.app.google/..."
                            value={clinicalSettings.integrations.googleBookingUrl || ''}
                            onChange={(e) => onUpdateSettings({
                                ...clinicalSettings,
                                integrations: { ...clinicalSettings.integrations, googleBookingUrl: e.target.value }
                            })}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all focus:border-blue-200 focus:ring-4 focus:ring-blue-50"
                        />
                        <p className="text-[10px] text-slate-400 ml-1">Link para a página pública de agendamento do Google.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button onClick={handleGoogleConnect} disabled={clinicalSettings.integrations.googleCalendarConnected} className={`w-full md:w-auto px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all ${clinicalSettings.integrations.googleCalendarConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white shadow-lg hover:bg-slate-800'}`}>
                        {clinicalSettings.integrations.googleCalendarConnected ? 'Conectado' : 'Conectar Google Agenda'}
                    </button>
                    {clinicalSettings.integrations.googleCalendarConnected && (
                        <button onClick={() => onUpdateSettings({ ...clinicalSettings, integrations: { ...clinicalSettings.integrations, googleCalendarConnected: false, googleAccessToken: undefined } })} className="text-red-400 text-[10px] font-bold uppercase hover:text-red-600">
                            Desconectar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AdminStaffProps {
    staff: Staff[];
    onAddStaff: (staff: Staff) => void;
    onRemoveStaff: (id: string) => void;
}

export const AdminStaff: React.FC<AdminStaffProps> = ({ staff, onAddStaff, onRemoveStaff }) => {
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'analyst' as 'analyst' | 'secretary' });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newStaff.name && newStaff.email && newStaff.password) {
            onAddStaff({ ...newStaff, id: crypto.randomUUID() });
            setNewStaff({ name: '', email: '', password: '', role: 'analyst' });
            alert('Membro adicionado.');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-8">
                <h2 className="text-3xl font-serif text-slate-900 italic">Equipe Clínica</h2>
                <div className="grid gap-6">
                    {staff.map(member => (
                        <div key={member.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-100">{member.name.charAt(0)}</div>
                                <div>
                                    <p className="font-bold text-slate-900">{member.name}</p>
                                    <p className="text-xs text-slate-400 capitalize">{member.role === 'analyst' ? 'Psicanalista' : 'Secretaria'}</p>
                                </div>
                            </div>
                            {/* Prevent removing the last admin or self if needed, assuming user handles safety */}
                            <button onClick={() => onRemoveStaff(member.id)} className="p-3 text-red-200 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-8">
                <h2 className="text-xl font-serif text-slate-900 italic">Adicionar Membro</h2>
                <form onSubmit={handleAddSubmit} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Nome Completo</label>
                        <input type="text" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">E-mail</label>
                        <input type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Senha Provisória</label>
                        <input type="text" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Função</label>
                        <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value as any })} className="w-full p-4 bg-slate-50 border rounded-2xl outline-none appearance-none">
                            <option value="analyst">Psicanalista</option>
                            <option value="secretary">Secretaria/Assistente</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Cadastrar Membro</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
