
import React, { useState } from 'react';
import { ClinicalSettings, WorkingPeriod, WorkingDay } from '../../../types';

interface AdminScheduleProps {
    clinicalSettings: ClinicalSettings;
    onUpdateSettings: (settings: ClinicalSettings) => void;
}

export const AdminSchedule: React.FC<AdminScheduleProps> = ({ clinicalSettings, onUpdateSettings }) => {
    const [tempSettings, setTempSettings] = useState<ClinicalSettings>(clinicalSettings);
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const toggleDay = (idx: number) => {
        const newDays = [...tempSettings.workingDays];
        newDays[idx].isOpen = !newDays[idx].isOpen;
        const newDocs = { ...tempSettings, workingDays: newDays };
        setTempSettings(newDocs);
        // Auto-propagate changes? Or wait for save?
        // The previous implementation waited for "Save All". We should probably pass changes up immediately 
        // to the parent "tempSettings" state if we were in the monolith, but here we can just update local and let parent handle save.
        // However, to keep it consistent with "Save All" button in sidebar, we should probably lift this state or 
        // pass a callback that updates the PARENT'S temp state.
        // For now, let's assume we update the parent immediately on every change? 
        // No, the user expects "Save All". So we need to sync with the parent's temp settings.
        onUpdateSettings(newDocs);
    };

    const updatePeriod = (dayIdx: number, periodIdx: number, field: keyof WorkingPeriod, value: any) => {
        const newDays = [...tempSettings.workingDays];
        const newPeriods = [...newDays[dayIdx].periods];
        newPeriods[periodIdx] = { ...newPeriods[periodIdx], [field]: value };
        newDays[dayIdx].periods = newPeriods;
        const newDocs = { ...tempSettings, workingDays: newDays };
        setTempSettings(newDocs);
        onUpdateSettings(newDocs);
    };

    const addPeriod = (dayIdx: number) => {
        const newDays = [...tempSettings.workingDays];
        newDays[dayIdx].periods.push({ start: '09:00', end: '12:00', enabled: true });
        const newDocs = { ...tempSettings, workingDays: newDays };
        setTempSettings(newDocs);
        onUpdateSettings(newDocs);
    };

    const removePeriod = (dayIdx: number, periodIdx: number) => {
        const newDays = [...tempSettings.workingDays];
        newDays[dayIdx].periods.splice(periodIdx, 1);
        const newDocs = { ...tempSettings, workingDays: newDays };
        setTempSettings(newDocs);
        onUpdateSettings(newDocs);
    };

    return (
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-12">
            <h2 className="text-3xl font-serif text-slate-900 italic">Disponibilidade Semanal</h2>
            <div className="space-y-6">
                {tempSettings.workingDays.map((day, dIdx) => (
                    <div key={day.day} className={`p-8 rounded-[35px] border transition-all ${day.isOpen ? 'bg-white border-slate-200' : 'bg-slate-50 opacity-50'}`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-serif font-bold">{dayNames[day.day]}</span>
                            <button onClick={() => toggleDay(dIdx)} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase ${day.isOpen ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'}`}>{day.isOpen ? 'Ativo' : 'Inativo'}</button>
                        </div>
                        {day.isOpen && (
                            <div className="mt-8 space-y-4">
                                {day.periods.map((p, pIdx) => (
                                    <div key={pIdx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input type="time" value={p.start} onChange={e => updatePeriod(dIdx, pIdx, 'start', e.target.value)} className="flex-1 bg-white border rounded-xl p-3 outline-none" />
                                        <span className="text-slate-400">até</span>
                                        <input type="time" value={p.end} onChange={e => updatePeriod(dIdx, pIdx, 'end', e.target.value)} className="flex-1 bg-white border rounded-xl p-3 outline-none" />
                                        <button onClick={() => removePeriod(dIdx, pIdx)} className="p-3 text-red-300 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                ))}
                                <button onClick={() => addPeriod(dIdx)} className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-bold uppercase text-slate-300 hover:text-[#7E9084]">+ Adicionar Horário</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
