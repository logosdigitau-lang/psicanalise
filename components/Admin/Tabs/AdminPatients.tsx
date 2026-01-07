
import React, { useState, useMemo } from 'react';
import { Appointment, ClinicalSettings } from '../../../types';

interface AdminPatientsProps {
    appointments: Appointment[];
    clinicalSettings: ClinicalSettings;
    onUpdateSettings: (settings: ClinicalSettings) => void;
    onScheduleFollowUp: (patient: any) => void;
    onUpdateNotes: (id: string, notes: string, feedback?: string) => void;
    onRescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
    onUpdatePatient: (oldEmail: string, newProfile: { name: string, email: string, phone: string }) => void;
    onDeletePatient: (email: string) => void;
    onTogglePayment: (id: string, currentStatus: 'paid' | 'pending' | undefined) => void;
}

export const AdminPatients: React.FC<AdminPatientsProps> = ({
    appointments,
    clinicalSettings,
    onUpdateSettings,
    onScheduleFollowUp,
    onUpdateNotes,
    onRescheduleAppointment,
    onUpdatePatient,
    onDeletePatient,
    onTogglePayment
}) => {
    const [selectedPatientEmail, setSelectedPatientEmail] = useState<string | null>(null);
    const [showOnlyDefaulters, setShowOnlyDefaulters] = useState(false);

    // Note modal state
    const [appointmentToNote, setAppointmentToNote] = useState<Appointment | null>(null);
    const [tempInternalNote, setTempInternalNote] = useState('');
    const [tempPatientFeedback, setTempPatientFeedback] = useState('');

    // Patient Edit & Reschedule State
    const [editingPatient, setEditingPatient] = useState<any | null>(null);
    const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
    const [newRescheduleDate, setNewRescheduleDate] = useState('');
    const [newRescheduleTime, setNewRescheduleTime] = useState('');

    const handleDeletePatientWrapper = (email: string) => {
        if (window.confirm("Tem certeza que deseja excluir este paciente? Todo o histórico será perdido.")) {
            onDeletePatient(email);
            setSelectedPatientEmail(null);
        }
    };

    const handleSavePatientEdit = () => {
        if (editingPatient) {
            onUpdatePatient(editingPatient.email, {
                name: editingPatient.name,
                email: editingPatient.email,
                phone: editingPatient.phone
            });
            setEditingPatient(null);
        }
    };

    const handleConfirmReschedule = () => {
        if (reschedulingAppointment && newRescheduleDate && newRescheduleTime) {
            onRescheduleAppointment(reschedulingAppointment.id, newRescheduleDate, newRescheduleTime);
            setReschedulingAppointment(null);
            setNewRescheduleDate('');
            setNewRescheduleTime('');
        }
    };

    const uniquePatients = useMemo(() => {
        const map = new Map();
        appointments.forEach(apt => {
            const emailKey = (apt.patientEmail || 'unknown').toLowerCase();
            if (!map.has(emailKey)) {
                map.set(emailKey, {
                    name: apt.patientName,
                    email: apt.patientEmail,
                    phone: apt.patientPhone,
                    sessions: [],
                    initialReason: apt.consultationReason || '',
                    totalValue: 0,
                    pendingValue: 0
                });
            }
            map.get(emailKey).sessions.push(apt);

            // Calculate financial stats
            // Assuming we can get price from somewhere, or using a default. 
            // Since Service is not directly linked here easily without join, 
            // we might fallback to a simple counter or need to find service price.
            // For MVP, let's assume a fixed price or try to find it if we had services passed.
            // Wait, we don't have services prop here...
            // Let's assume a standard value or just count sessions paid/pending for now, 
            // OR we can pass services prop?
            // Actually, let's look at Appointment type, it has serviceId. 
            // But we don't have the services list here.
            // Let's add services to props or just count Paid/Pending status for now.
            // Better yet, just count "Sessões Pagas" and "Sessões Pendentes".

            if (apt.paymentStatus === 'paid') {
                map.get(emailKey).paidCount = (map.get(emailKey).paidCount || 0) + 1;
            } else {
                map.get(emailKey).pendingCount = (map.get(emailKey).pendingCount || 0) + 1;
            }

            if (apt.consultationReason && !map.get(emailKey).initialReason) {
                map.get(emailKey).initialReason = apt.consultationReason;
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [appointments]);

    const selectedPatient = useMemo(() => {
        if (!selectedPatientEmail) return null;
        return uniquePatients.find(p => p.email.toLowerCase() === selectedPatientEmail.toLowerCase());
    }, [uniquePatients, selectedPatientEmail]);

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

    return (
        <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 min-h-[600px]">

            {/* Note Modal reuse */}
            {appointmentToNote && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setAppointmentToNote(null)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 animate-fade-in flex flex-col gap-6">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 italic">Notas de Sessão</h2>
                        <textarea value={tempInternalNote} onChange={e => setTempInternalNote(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl h-32" placeholder="Notas internas..." />
                        <textarea value={tempPatientFeedback} onChange={e => setTempPatientFeedback(e.target.value)} className="w-full p-4 bg-[#FAF9F6] border rounded-2xl h-32" placeholder="Feedback para paciente..." />
                        <div className="flex gap-3">
                            <button onClick={() => setAppointmentToNote(null)} className="flex-1 py-3 text-slate-400 font-bold uppercase text-xs">Cancelar</button>
                            <button onClick={handleSaveNotes} className="flex-1 py-3 bg-slate-900 text-white rounded-full font-bold uppercase text-xs">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-serif text-slate-900 italic">{selectedPatient ? 'Prontuário' : 'Pacientes em Percurso'}</h2>
                    {!selectedPatient && (
                        <button
                            onClick={() => setShowOnlyDefaulters(!showOnlyDefaulters)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${showOnlyDefaulters
                                ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-200'
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }`}
                        >
                            Em Débito
                        </button>
                    )}
                </div>
                {selectedPatient && (
                    <button onClick={() => setSelectedPatientEmail(null)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7 7-7" /></svg>
                        Voltar
                    </button>
                )}
            </div>

            {!selectedPatient ? (
                <div className="grid gap-6">
                    {uniquePatients
                        .filter(p => !showOnlyDefaulters || (p.pendingCount && p.pendingCount > 0))
                        .map((p, i) => (
                            <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:bg-white hover:shadow-lg transition-all">
                                <div className="flex items-center gap-6 flex-grow cursor-pointer" onClick={() => setSelectedPatientEmail(p.email)}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-serif text-xl shadow-lg relative ${(p.pendingCount && p.pendingCount > 0) ? 'bg-orange-500' : 'bg-slate-900'
                                        }`}>
                                        {p.name.charAt(0)}
                                        {(p.pendingCount && p.pendingCount > 0) && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold">
                                                {p.pendingCount}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-serif font-bold flex items-center gap-2">
                                            {p.name}
                                            {(p.pendingCount && p.pendingCount > 0) && (
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] rounded-full uppercase font-bold tracking-widest">
                                                    Pendente
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-slate-400 italic">{p.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button onClick={() => setSelectedPatientEmail(p.email)} className="flex-1 md:flex-none px-6 py-3 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">Prontuário</button>
                                    <button onClick={() => onScheduleFollowUp(p)} className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md">Agendar Próxima</button>
                                    <button onClick={() => handleDeletePatientWrapper(p.email)} className="px-3 py-3 border border-red-100 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all" title="Excluir Paciente">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    {uniquePatients.filter(p => !showOnlyDefaulters || (p.pendingCount && p.pendingCount > 0)).length === 0 && (
                        <div className="text-center py-20 text-slate-400 italic">
                            {showOnlyDefaulters ? 'Nenhum paciente com pagamentos pendentes.' : 'Nenhum paciente encontrado.'}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-10 animate-fade-in">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 bg-[#FAF9F6] p-8 rounded-[35px] border border-slate-100 flex flex-col justify-between gap-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <h3 className="text-2xl font-serif font-bold text-slate-900">{selectedPatient.name}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingPatient(selectedPatient)}
                                                className="p-1 px-3 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeletePatientWrapper(selectedPatient.email)}
                                                className="p-1 px-3 bg-red-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 italic mt-1">{selectedPatient.email} • {selectedPatient.phone}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm text-center px-8">
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Sessões</p>
                                    <p className="text-3xl font-serif font-bold text-slate-900">{selectedPatient.sessions.length}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[25px] border border-slate-100">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#7E9084] mb-2 block">Conselho do Analista (Visível no Portal)</label>
                                <textarea
                                    className="w-full text-sm text-slate-700 italic font-light p-2 focus:outline-none resize-none bg-transparent"
                                    rows={3}
                                    placeholder="Escreva um conselho ou aviso para este paciente..."
                                    value={clinicalSettings.patientSummaries?.[selectedPatient.email.toLowerCase()] || ''}
                                    onChange={(e) => {
                                        onUpdateSettings({
                                            ...clinicalSettings,
                                            patientSummaries: {
                                                ...clinicalSettings.patientSummaries,
                                                [selectedPatient.email.toLowerCase()]: e.target.value
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-inner flex flex-col justify-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#A67C6A] mb-3">Motivo da Consulta</p>
                            <p className="text-sm text-slate-700 italic font-light leading-relaxed">
                                {selectedPatient.initialReason ? `"${selectedPatient.initialReason}"` : "Não registrado."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Histórico Clínico</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4">Data</th>
                                        <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4">Status</th>
                                        <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4">Pagamento</th>
                                        <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4">Reflexões</th>
                                        <th className="py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {selectedPatient.sessions.sort((a: Appointment, b: Appointment) => b.date.localeCompare(a.date)).map((apt: Appointment) => (
                                        <tr key={apt.id} className="group hover:bg-slate-50/50">
                                            <td className="py-6 px-4">
                                                <span className="block text-sm font-bold">{apt.date}</span>
                                                <span className="text-[10px] text-slate-400 uppercase">{apt.startTime}</span>
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {apt.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4">
                                                <button
                                                    onClick={() => onTogglePayment(apt.id, apt.paymentStatus)}
                                                    className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full transition-all border ${apt.paymentStatus === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                                                        : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
                                                        }`}
                                                >
                                                    {apt.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                                                </button>
                                            </td>
                                            <td className="py-6 px-4">
                                                <p className="text-xs text-slate-500 italic truncate max-w-[200px]">
                                                    {apt.patientFeedback ? `"${apt.patientFeedback}"` : "Sem notas."}
                                                </p>
                                            </td>
                                            <td className="py-6 px-4 text-right">
                                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => handleOpenNoteModal(apt)} title="Notas" className="p-2 bg-white border rounded-xl text-slate-400 hover:text-[#7E9084]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                                    <button onClick={() => setReschedulingAppointment(apt)} title="Remarcar" className="p-2 bg-white border rounded-xl text-slate-400 hover:text-slate-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Patient Modal */}
            {editingPatient && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingPatient(null)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 animate-fade-in flex flex-col gap-6">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 italic">Editar Paciente</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                                <input type="text" value={editingPatient.name} onChange={e => setEditingPatient({ ...editingPatient, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email (Identificador)</label>
                                <input type="email" disabled value={editingPatient.email} className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl outline-none text-slate-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Telefone</label>
                                <input type="tel" value={editingPatient.phone} onChange={e => setEditingPatient({ ...editingPatient, phone: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setEditingPatient(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
                            <button onClick={handleSavePatientEdit} className="flex-1 py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {reschedulingAppointment && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setReschedulingAppointment(null)}></div>
                    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border border-slate-100 animate-fade-in flex flex-col gap-6">
                        <h2 className="text-2xl font-serif font-bold text-slate-900 italic">Remarcar Sessão</h2>
                        <p className="text-sm text-slate-500 italic">Sessão atual: {reschedulingAppointment.date} às {reschedulingAppointment.startTime}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nova Data</label>
                                <input
                                    type="date"
                                    value={newRescheduleDate}
                                    onChange={e => setNewRescheduleDate(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-700"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Novo Horário</label>
                                <input
                                    type="time"
                                    value={newRescheduleTime}
                                    onChange={e => setNewRescheduleTime(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setReschedulingAppointment(null)} className="flex-1 py-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
                            <button
                                onClick={handleConfirmReschedule}
                                disabled={!newRescheduleDate || !newRescheduleTime}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
