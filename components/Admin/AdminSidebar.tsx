
import React from 'react';
import { Staff } from '../../types';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    activeStaff: Staff;
    onLogout: () => void;
    onSaveAll: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, activeStaff, onLogout, onSaveAll }) => {
    const tabs = [
        { id: 'calendar', label: 'Agenda', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'patients', label: 'Pacientes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
        { id: 'schedule', label: 'Horários', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'services', label: 'Preços', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
        { id: 'content', label: 'Conteúdo', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { id: 'staff', label: 'Equipe', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857' },
        { id: 'integrations', label: 'Conexões', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4' },
    ];

    return (
        <aside className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700">{activeStaff.name.charAt(0)}</div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Administrador</p>
                    <p className="font-serif font-bold text-slate-900 text-sm">{activeStaff.name}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-2">
                <button onClick={onSaveAll} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg">Salvar Tudo</button>
                <button onClick={onLogout} className="w-full py-4 bg-white border border-red-100 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Sair</button>
            </div>
        </aside>
    );
};
