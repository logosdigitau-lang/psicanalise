
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, Block, ClinicalSettings } from '../../../types';
import { GoogleCalendarService } from '../../../services/googleCalendarService';

interface AdminCalendarProps {
    appointments: Appointment[];
    blocks: Block[];
    services: any[];
    onAddBlock: (block: any) => void;
    onRemoveBlock: (id: string) => void;
    onUpdateNotes: (id: string, notes: string, feedback?: string) => void;
    onCancelAppointment: (id: string) => void;
    clinicalSettings: ClinicalSettings;
    onSaveSettings: (settings: ClinicalSettings) => void;
}

type CalendarView = 'day' | 'week' | 'month';

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
    appointments,
    blocks,
    services,
    onAddBlock,
    onRemoveBlock,
    onUpdateNotes,
    onCancelAppointment,
    clinicalSettings,
    onSaveSettings
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
    const [calendarView, setCalendarView] = useState<CalendarView>('day');

    const isGoogleConnected = clinicalSettings.integrations.googleCalendarConnected;

    // Initial check and setup
    useEffect(() => {
        GoogleCalendarService.init();
    }, []);

    const handleConnectGoogle = async () => {
        try {
            const token = await GoogleCalendarService.requestAccessToken();
            if (token) {
                const newSettings = {
                    ...clinicalSettings,
                    integrations: {
                        ...clinicalSettings.integrations,
                        googleCalendarConnected: true,
                        googleAccessToken: token
                    }
                };
                onSaveSettings(newSettings);
                alert('Conectado ao Google Calendar com sucesso!');
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com Google Calendar');
        }
    };

    const handleDisconnectGoogle = () => {
        const newSettings = {
            ...clinicalSettings,
            integrations: {
                ...clinicalSettings.integrations,
                googleCalendarConnected: false,
                googleAccessToken: undefined
            }
        };
        onSaveSettings(newSettings);
    };

    // Modal states
    const [appointmentToNote, setAppointmentToNote] = useState<Appointment | null>(null);
    const [blockToCreate, setBlockToCreate] = useState<{ date: string, endDate?: string, reason: string } | null>(null);
    const [tempInternalNote, setTempInternalNote] = useState('');
    const [tempPatientFeedback, setTempPatientFeedback] = useState('');
    const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);



    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let h = 8; h <= 20; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
        }
        return slots;
    }, []);

    const [googleEvents, setGoogleEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchGoogleEvents = async () => {
            if (isGoogleConnected && clinicalSettings.integrations.googleAccessToken) {
                // Fetch for current month view range (approx)
                const start = new Date(year, month, 1);
                const end = new Date(year, month + 1, 0, 23, 59, 59);
                const events = await GoogleCalendarService.listEvents(start, end, clinicalSettings.integrations.googleAccessToken);
                setGoogleEvents(events);
            } else {
                setGoogleEvents([]);
            }
        };
        fetchGoogleEvents();
    }, [isGoogleConnected, clinicalSettings.integrations.googleAccessToken, year, month]);

    const getAppointmentsForDateStr = (dateStr: string) => appointments.filter(apt => apt.date === dateStr);
    const getBlocksForDateStr = (dateStr: string) => blocks.filter(b => dateStr >= b.startDate && dateStr <= (b.endDate || b.startDate));
    const getGoogleEventsForDateStr = (dateStr: string) => googleEvents.filter(ev => {
        const start = ev.start.dateTime || ev.start.date;
        return start.startsWith(dateStr);
    });

    const weekRange = useMemo(() => {
        const start = new Date(currentDate);
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d);
        }
        return days;
    }, [currentDate]);

    const handleNavigate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (calendarView === 'month') {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (calendarView === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else if (calendarView === 'day') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
            setSelectedDay(newDate.getDate());
        }
        setCurrentDate(newDate);
    };

    const selectedDayItems = useMemo(() => {
        if (!selectedDay) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

        const gEvents = getGoogleEventsForDateStr(dateStr).map(ev => ({
            id: ev.id,
            startTime: ev.start.dateTime ? ev.start.dateTime.split('T')[1].substring(0, 5) : 'Dia Todo',
            patientName: ev.summary || '(Sem título)',
            type: 'google' as const,
            notes: ev.description
        }));

        return [
            ...getAppointmentsForDateStr(dateStr).map(a => ({ ...a, type: 'appointment' as const })),
            ...getBlocksForDateStr(dateStr).map(b => ({ ...b, type: 'block' as const })),
            ...gEvents
        ].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    }, [selectedDay, month, year, appointments, blocks, googleEvents]);

    const handleOpenNoteModal = (apt: Appointment) => {
        setAppointmentToNote(apt);
        setTempInternalNote(apt.notes || '');
        setTempPatientFeedback(apt.patientFeedback || '');
    };

    const handleSaveNotes = () => {
        if (appointmentToNote) {
            onUpdateNotes(appointmentToNote.id, tempInternalNote, tempPatientFeedback);
            setAppointmentToNote(null);
        }
    };

    const handleCreateBlock = () => {
        if (blockToCreate) {
            onAddBlock({
                id: Math.random().toString(36).substr(2, 9),
                startDate: blockToCreate.date,
                endDate: blockToCreate.endDate || blockToCreate.date,
                isAllDay: true,
                reason: blockToCreate.reason || 'Bloqueio administrativo'
            });
            setBlockToCreate(null);
        }
    };

    const handleReconnectGoogle = async () => {
        try {
            await GoogleCalendarService.init();
            const token = await GoogleCalendarService.requestAccessToken();
            if (token) {
                onSaveSettings({
                    ...clinicalSettings,
                    integrations: {
                        ...clinicalSettings.integrations,
                        googleCalendarConnected: true,
                        googleAccessToken: token,
                    }
                });
                alert('Conexão renovada com sucesso! Os eventos devem aparecer agora.');
                // Force refresh events
                const start = new Date(year, month, 1);
                const end = new Date(year, month + 1, 0, 23, 59, 59);
                const events = await GoogleCalendarService.listEvents(start, end, token);
                setGoogleEvents(events);
            }
        } catch (e) {
            console.error(e);
            alert('Falha ao reconectar. Tente novamente.');
        }
    };

    return (
        <div className="space-y-6">

            {/* Reflection Modal */}
            {appointmentToNote && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setAppointmentToNote(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 animate-fade-in flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900 italic">Registros Analíticos</h2>
                            <p className="text-slate-500 font-light text-sm italic">{appointmentToNote.patientName} • {appointmentToNote.date}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Notas Internas (Sigilosas)</label>
                                <textarea value={tempInternalNote} onChange={e => setTempInternalNote(e.target.value)} placeholder="Observações do percurso..." className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none text-sm resize-none h-32 text-slate-900 shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#7E9084] ml-1">Reflexões para o Paciente</label>
                                <textarea value={tempPatientFeedback} onChange={e => setTempPatientFeedback(e.target.value)} placeholder="O que o paciente pode ler no portal..." className="w-full p-6 bg-[#FAF9F6] border border-[#7E9084]/20 rounded-3xl outline-none text-sm italic resize-none h-32 text-slate-900 shadow-inner" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setAppointmentToNote(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Voltar</button>
                            <button onClick={handleSaveNotes} className="flex-1 py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Modal */}
            {blockToCreate && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setBlockToCreate(null)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 animate-fade-in">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 italic">Bloquear Dia Inteiro</h2>
                        <p className="text-slate-500 text-sm mb-6">Ao bloquear, nenhum paciente poderá agendar horários nesta data.</p>
                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Data Início</label>
                                    <input type="date" value={blockToCreate.date} onChange={e => setBlockToCreate({ ...blockToCreate, date: e.target.value, endDate: e.target.value > (blockToCreate.endDate || '') ? e.target.value : blockToCreate.endDate })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Data Fim</label>
                                    <input type="date" min={blockToCreate.date} value={blockToCreate.endDate || blockToCreate.date} onChange={e => setBlockToCreate({ ...blockToCreate, endDate: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Motivo do Bloqueio</label>
                                <input type="text" value={blockToCreate.reason} onChange={e => setBlockToCreate({ ...blockToCreate, reason: e.target.value })} placeholder="Ex: Férias, Recesso..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm text-slate-900 focus:ring-2 focus:ring-slate-900" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setBlockToCreate(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Voltar</button>
                            <button onClick={handleCreateBlock} className="flex-1 py-4 bg-red-600 text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
                                {blockToCreate.endDate && blockToCreate.endDate !== blockToCreate.date ? 'Bloquear Período' : 'Bloquear Dia'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-[40px] shadow-sm p-6 md:p-10 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-serif font-bold text-slate-900">
                        {calendarView === 'day' ? `${selectedDay} ${monthNames[month]}` : calendarView === 'week' ? 'Semana Clínica' : monthNames[month]} {year}
                    </h2>
                    <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
                        {(['day', 'week', 'month'] as CalendarView[]).map(v => (
                            <button key={v} onClick={() => setCalendarView(v)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${calendarView === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                                {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {calendarView === 'day' && selectedDay && (
                        <button
                            onClick={() => {
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                                setBlockToCreate({ date: dateStr, reason: '' });
                            }}
                            className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm"
                        >
                            Bloquear Dia
                        </button>
                    )}
                    {isGoogleConnected ? (
                        <div className="flex gap-2">
                            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Google Ativo
                            </span>
                            <button onClick={handleReconnectGoogle} className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full font-bold uppercase text-[10px] transition-colors" title="Clique se os eventos não estiverem aparecendo">
                                🔄 Atualizar Conexão
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnectGoogle}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" /></svg>
                            Conectar Agenda
                        </button>
                    )}
                    <button onClick={() => handleNavigate('prev')} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={() => handleNavigate('next')} className="p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>
                </div>
            </div>

            {/* Day View */}
            {calendarView === 'day' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm p-8 border border-slate-100">
                        <div className="grid grid-cols-7 gap-4 mb-8">
                            {dayNames.map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-4">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: numDays }).map((_, i) => {
                                const day = i + 1;
                                const isToday = new Date().getDate() === day && new Date().getMonth() === month;
                                const isSelected = selectedDay === day;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const dayEvents = appointments.filter(a => a.date === dateStr);
                                const dayBlocks = blocks.filter(b => dateStr >= b.startDate && dateStr <= (b.endDate || b.startDate));
                                const isBlocked = dayBlocks.some(b => b.isAllDay);

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-lg font-serif transition-all ${isSelected ? 'bg-slate-900 text-white shadow-lg' : isToday ? 'bg-slate-50 text-slate-900 border border-slate-200' : 'hover:bg-slate-50 text-slate-800'} ${isBlocked ? 'border-2 border-red-100 bg-red-50/20' : ''}`}
                                    >
                                        {day}
                                        {dayEvents.length > 0 && !isSelected && <div className="absolute bottom-2 w-1 h-1 bg-slate-400 rounded-full"></div>}
                                        {isBlocked && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm max-h-[500px] overflow-y-auto custom-scrollbar">
                        <h3 className="text-xl font-serif font-bold mb-6 italic">Compromissos e Bloqueios</h3>
                        <div className="space-y-4">
                            {selectedDayItems.map((item: any, idx) => (
                                <div key={idx} className={`p-5 rounded-2xl border flex justify-between items-center group transition-all hover:shadow-md ${item.type === 'block' ? 'bg-red-50 border-red-100' :
                                    item.type === 'google' ? 'bg-amber-50 border-amber-100 hover:bg-amber-100/50' :
                                        'bg-slate-50 border-slate-100 hover:bg-white'
                                    }`}>
                                    <div className="cursor-pointer flex-grow" onClick={() => item.type === 'appointment' && handleOpenNoteModal(item)}>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[10px] font-bold uppercase tracking-tighter ${item.type === 'block' ? 'text-red-400' :
                                                item.type === 'google' ? 'text-amber-500' :
                                                    'text-slate-400'
                                                }`}>{item.startTime || 'Todo o dia'}</p>
                                            {item.type === 'google' && <span className="px-1.5 py-0.5 bg-white rounded text-[8px] font-bold text-amber-500 border border-amber-200 uppercase">Google</span>}
                                        </div>
                                        <p className={`font-serif font-bold ${item.type === 'block' ? 'text-red-900' :
                                            item.type === 'google' ? 'text-amber-900' :
                                                'text-slate-900'
                                            }`}>{item.patientName || item.reason}</p>
                                        {item.patientFeedback && <span className="text-[8px] text-[#7E9084] font-black uppercase inline-block mt-1">Reflexão Enviada</span>}
                                    </div>
                                    <div className="flex gap-1">
                                        {item.type === 'appointment' ? (
                                            <>
                                                <button onClick={() => handleOpenNoteModal(item)} title="Ver Reflexão" className="p-2 text-slate-300 hover:text-[#7E9084] transition-all opacity-0 group-hover:opacity-100">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => setAppointmentToCancel(item)} title="Cancelar" className="p-2 text-red-100 hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => onRemoveBlock(item.id)} title="Remover Bloqueio" className="p-2 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {selectedDayItems.length === 0 && <p className="text-center text-slate-300 text-xs py-20 font-light italic">Sem compromissos hoje.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Week View */}
            {calendarView === 'week' && (
                <div className="bg-white rounded-[40px] p-4 md:p-8 shadow-sm border border-slate-100 overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 mb-2">
                            <div />
                            {weekRange.map((d, i) => (
                                <div key={i} className="text-center py-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{dayNames[d.getDay()]}</p>
                                    <p className={`text-xl font-serif font-bold ${new Date().toDateString() === d.toDateString() ? 'text-slate-900 underline decoration-[#7E9084] decoration-2' : 'text-slate-400'}`}>{d.getDate()}</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-[80px_repeat(7,1fr)] relative" style={{ height: '780px' }}>
                            <div className="flex flex-col">
                                {timeSlots.map(t => (
                                    <div key={t} className="h-[60px] text-[10px] font-bold text-slate-300 pr-4 text-right flex items-start justify-end -mt-2">{t}</div>
                                ))}
                            </div>
                            {weekRange.map((d, i) => {
                                const dateStr = d.toISOString().split('T')[0];
                                const dayEvents = appointments.filter(a => a.date === dateStr);
                                const dayBlocks = blocks.filter(b => dateStr >= b.startDate && dateStr <= (b.endDate || b.startDate));
                                return (
                                    <div key={i} className="relative border-l border-slate-50 h-full group/col hover:bg-slate-50/30 transition-colors">
                                        {timeSlots.map(t => <div key={t} className="absolute left-0 right-0 border-t border-slate-50 h-[60px]" style={{ top: `${(parseInt(t) - 8) * 60}px` }} />)}
                                        {dayBlocks.map(b => b.isAllDay && (
                                            <div key={b.id} className="absolute inset-0 bg-red-50/40 flex items-center justify-center p-2 z-0">
                                                <p className="text-[8px] font-bold text-red-300 uppercase tracking-widest rotate-90">{b.reason}</p>
                                            </div>
                                        ))}
                                        {/* Google Events */}
                                        {googleEvents.filter(ev => {
                                            const start = ev.start.dateTime || ev.start.date;
                                            return start.startsWith(dateStr);
                                        }).map(ev => {
                                            if (!ev.start.dateTime) return null; // Ignore all-day for timeline for now
                                            const [h, m] = ev.start.dateTime.split('T')[1].substring(0, 5).split(':').map(Number);
                                            const startOffset = ((h - 8) * 60) + m;
                                            // Calculate duration
                                            const end = new Date(ev.end.dateTime);
                                            const start = new Date(ev.start.dateTime);
                                            const duration = (end.getTime() - start.getTime()) / 60000;

                                            return (
                                                <div
                                                    key={ev.id}
                                                    className="absolute left-1 right-1 p-2 rounded-xl text-slate-500 bg-amber-50 border-l-4 border-amber-300 shadow-sm overflow-hidden hover:scale-[1.03] transition-all"
                                                    style={{ top: `${startOffset}px`, height: `${duration}px`, zIndex: 5 }}
                                                    title={`Google Calendar: ${ev.summary}`}
                                                >
                                                    <p className="text-[8px] font-black opacity-60 uppercase tracking-tighter text-amber-500">{ev.start.dateTime.split('T')[1].substring(0, 5)}</p>
                                                    <p className="text-[10px] font-serif font-bold leading-tight truncate mt-1 text-amber-900">{ev.summary}</p>
                                                </div>
                                            );
                                        })}
                                        {dayEvents.map(apt => {
                                            const [h, m] = apt.startTime.split(':').map(Number);
                                            const startOffset = ((h - 8) * 60) + m;
                                            const service = services.find(s => s.id === apt.serviceId);
                                            const duration = service?.duration || 50;
                                            const isCancelled = apt.status === 'cancelled';
                                            return (
                                                <div
                                                    key={apt.id}
                                                    className={`absolute left-1 right-1 p-2 rounded-xl text-white shadow-lg overflow-hidden cursor-pointer hover:scale-[1.03] transition-all border-l-4 ${isCancelled ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-slate-900 border-[#7E9084]'} ${apt.format === 'online' && !isCancelled ? 'border-blue-400' : ''}`}
                                                    style={{ top: `${startOffset}px`, height: `${duration}px`, zIndex: 10 }}
                                                    onClick={() => handleOpenNoteModal(apt)}
                                                >
                                                    <p className="text-[8px] font-black opacity-40 uppercase tracking-tighter">{apt.startTime}</p>
                                                    <p className="text-[10px] font-serif font-bold leading-tight truncate mt-1">{apt.patientName}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Month View */}
            {calendarView === 'month' && (
                <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-slate-100">
                    <div className="grid grid-cols-7 gap-4 mb-8">
                        {dayNames.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-4">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square opacity-20" />
                        ))}
                        {Array.from({ length: numDays }).map((_, i) => {
                            const day = i + 1;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = appointments.filter(a => a.date === dateStr && a.status === 'confirmed');
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                            const isBlocked = blocks.some(b => dateStr >= b.startDate && dateStr <= (b.endDate || b.startDate) && b.isAllDay);
                            const googleEventsForDay = googleEvents.filter(ev => {
                                const start = ev.start.dateTime || ev.start.date;
                                return start.startsWith(dateStr);
                            });

                            return (
                                <button
                                    key={day}
                                    onClick={() => { setSelectedDay(day); setCalendarView('day'); }}
                                    className={`relative aspect-square rounded-3xl flex flex-col items-start p-4 transition-all group border ${isToday ? 'border-slate-900 bg-slate-50' : 'border-slate-50 bg-white hover:bg-slate-50'} ${isBlocked ? 'border-red-100' : ''}`}
                                >
                                    <span className={`text-lg font-serif font-bold ${isToday ? 'text-slate-900' : isBlocked ? 'text-red-300' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                        {day}
                                    </span>
                                    <div className="mt-auto w-full flex flex-wrap gap-1">
                                        {dayEvents.slice(0, 4).map((_, eIdx) => (
                                            <div key={eIdx} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-slate-900' : 'bg-[#7E9084] opacity-40'}`} />
                                        ))}
                                        {googleEventsForDay.length > 0 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${googleEventsForDay.length} eventos Google`} />
                                        )}
                                    </div>
                                    {isBlocked && (
                                        <div className="absolute top-4 right-4 text-red-300">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
