
import React, { useState, useEffect, useMemo } from 'react';
import { DataService } from './services/dataService';
import { SERVICES, COLORS, MESSIAS_BIO, DEFAULT_SETTINGS } from './constants';
import { Service, Appointment, Block, RecurrenceType, ClinicalSettings, Staff } from './types';
import LandingPage from './components/Landing/LandingPage';
import BookingWizard from './components/Booking/BookingWizard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { GoogleCalendarService } from './services/googleCalendarService';
import PatientPortal from './components/Patient/PatientPortal';

type View = 'landing' | 'booking' | 'admin' | 'confirmation' | 'patient-portal';



const App: React.FC = () => {

  const [view, setView] = useState<View>('landing');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [lastAppointment, setLastAppointment] = useState<Appointment | null>(null);
  const [preFilledPatient, setPreFilledPatient] = useState<{ name: string, email: string, phone: string, format?: any } | null>(null);
  const [activeStaff, setActiveStaff] = useState<Staff | null>(null);
  const [activePatientEmail, setActivePatientEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [services, setServices] = useState<Service[]>(SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [clinicalSettings, setClinicalSettings] = useState<ClinicalSettings>(DEFAULT_SETTINGS);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedServices, fetchedAppointments, fetchedBlocks, fetchedSettings, fetchedStaff] = await Promise.all([
          DataService.getServices(),
          DataService.getAppointments(),
          DataService.getBlocks(),
          DataService.getSettings(),
          DataService.getStaff()
        ]);

        if (fetchedServices.length > 0) setServices(fetchedServices);
        if (fetchedAppointments.length > 0) setAppointments(fetchedAppointments);
        setBlocks(fetchedBlocks);
        if (fetchedSettings) {
          // Merge with default to ensure new fields exists
          setClinicalSettings(prev => ({ ...prev, ...fetchedSettings, content: { ...prev.content, ...fetchedSettings.content } }));
        }
        setStaff(fetchedStaff);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const startBooking = (service?: Service) => {
    if (service) setSelectedService(service);
    setPreFilledPatient(null);
    setView('booking');
  };

  const scheduleFollowUp = (patient: { name: string, email: string, phone: string, format?: any }) => {
    setPreFilledPatient(patient);
    const regularService = services.find(s => s.type === 'plan') || services[0];
    setSelectedService(regularService);
    setView('booking');
  };

  const finishBooking = async (appointment: Appointment) => {
    let finalAppointment = { ...appointment };

    if (clinicalSettings.integrations.googleCalendarConnected && clinicalSettings.integrations.googleAccessToken) {
      const service = services.find(s => s.id === appointment.serviceId);
      if (service) {
        const eventId = await GoogleCalendarService.createEvent(
          appointment,
          service,
          clinicalSettings.integrations.googleAccessToken
        );
        if (eventId) {
          finalAppointment.googleEventId = eventId;
        }
      }
    }

    const success = await DataService.createAppointment(finalAppointment);
    if (success) {
      setAppointments(prev => [...prev, finalAppointment]);
      setLastAppointment(finalAppointment);
      setView('confirmation');
    } else {
      alert("Erro ao salvar agendamento. Tente novamente.");
    }
  };

  const handleBulkSchedule = async (newAppointments: Appointment[]) => {
    // Save one by one or we might need a bulk insert in DataService (not implemented yet, so loop)
    // Actually, Promise.all is better
    await Promise.all(newAppointments.map(app => DataService.createAppointment(app)));
    // Refresh to be sure or just update state
    setAppointments(prev => [...prev, ...newAppointments]);
  };

  const handleCreateRecurringSeries = async (baseApt: Appointment, recurrence: RecurrenceType, occurrences: number) => {
    const newAppointments: Appointment[] = [];
    const recurrenceId = Math.random().toString(36).substr(2, 9);
    for (let i = 0; i < occurrences; i++) {
      const date = new Date(baseApt.date + 'T' + baseApt.startTime);
      const daysToAdd = recurrence === 'weekly' ? i * 7 : i * 14;
      date.setDate(date.getDate() + daysToAdd);
      const dateStr = date.toISOString().split('T')[0];
      newAppointments.push({
        ...baseApt,
        id: Math.random().toString(36).substr(2, 9),
        date: dateStr,
        recurrenceId,
        createdAt: new Date().toISOString()
      });
    }

    await Promise.all(newAppointments.map(app => DataService.createAppointment(app)));
    setAppointments(prev => [...prev, ...newAppointments]);
  };

  const updateAppointmentNotes = async (id: string, notes: string, feedback?: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      const updated = { ...apt, notes, patientFeedback: feedback ?? apt.patientFeedback };
      await DataService.updateAppointment(updated);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  const addBlock = async (block: Block) => {
    await DataService.saveBlock(block);
    setBlocks(prev => [...prev, block]);
  };

  const removeBlock = async (id: string) => {
    await DataService.deleteBlock(id);
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const cancelAppointment = async (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      const updated = { ...apt, status: 'cancelled' as const };
      await DataService.updateAppointment(updated);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  const deleteAppointment = async (id: string) => {
    await DataService.deleteAppointment(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const rescheduleAppointment = async (id: string, newDate?: string, newTime?: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      if (newDate && newTime) {
        // Direct update from Admin
        const updated = { ...apt, date: newDate, startTime: newTime };
        await DataService.updateAppointment(updated);
        setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      } else {
        // Wizard flow
        setSelectedService(services.find(s => s.id === apt.serviceId) || null);
        setPreFilledPatient({
          name: apt.patientName,
          email: apt.patientEmail,
          phone: apt.patientPhone,
          format: apt.format
        });
        await DataService.deleteAppointment(id);
        setAppointments(prev => prev.filter(a => a.id !== id));
        setView('booking');
      }
    }
  };

  const handleAddStaff = async (newStaff: Staff) => {
    await DataService.saveStaffMember(newStaff);
    setStaff(prev => [...prev, newStaff]);
  };

  const handleRemoveStaff = async (id: string) => {
    await DataService.deleteStaff(id);
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveSettings = async (settings: ClinicalSettings) => {
    await DataService.saveSettings(settings);
    setClinicalSettings(settings);
  };

  const handleSaveServices = async (newServices: Service[]) => {
    await DataService.saveServices(newServices);
    setServices(newServices);
  };

  const handleLogin = (email: string, pass: string) => {
    const found = staff.find(s => s.email === email && s.password === pass);
    if (found) {
      setActiveStaff(found);
    } else {
      alert("Credenciais inválidas.");
    }
  };

  const handleLogout = () => {
    setActiveStaff(null);
    setView('landing');
  };

  const handlePatientLogin = (email: string) => {
    setActivePatientEmail(email);
  };

  const handlePatientLogout = () => {
    setActivePatientEmail(null);
    setView('landing');
  };

  const handlePortalNewAppointment = () => {
    if (!activePatientEmail) return;
    const lastApt = appointments
      .filter(a => a.patientEmail && a.patientEmail.toLowerCase() === activePatientEmail.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (lastApt) {
      setPreFilledPatient({
        name: lastApt.patientName,
        email: lastApt.patientEmail,
        phone: lastApt.patientPhone,
        format: lastApt.format
      });
      setSelectedService(null); // Explicitly null to show service list
      setView('booking');
    }
  };

  const orderedServices = useMemo(() => {
    if (!preFilledPatient || !activePatientEmail || preFilledPatient.email !== activePatientEmail) {
      return services;
    }

    const lastApt = appointments
      .filter(a => a.patientEmail && a.patientEmail.toLowerCase() === activePatientEmail.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!lastApt) return services;

    const lastService = services.find(s => s.id === lastApt.serviceId);
    if (!lastService) return services;

    // If last service was 'initial', try to find 'regular' (Plan/Therapy) to prioritize
    // Otherwise prioritize the last used service
    let preferredService = lastService;
    if (lastService.type === 'initial') {
      const regular = services.find(s => s.type === 'regular');
      if (regular) preferredService = regular;
    }

    return [
      preferredService,
      ...services.filter(s => s.id !== preferredService.id)
    ];
  }, [services, preFilledPatient, activePatientEmail, appointments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-slate-200 relative" style={{ '--primary-color': clinicalSettings.theme.primary } as any}>
      <Navbar onNavigate={(v) => setView(v as View)} currentView={view} />
      <main className="flex-grow">
        {view === 'landing' && <LandingPage services={services} onStartBooking={startBooking} clinicalSettings={clinicalSettings} />}
        {view === 'booking' && (
          <BookingWizard
            services={orderedServices}
            initialService={selectedService}
            appointments={appointments}
            blocks={blocks}
            clinicalSettings={clinicalSettings}
            preFilledPatient={preFilledPatient}
            onCancel={() => setView('landing')}
            onComplete={finishBooking}
          />
        )}
        {view === 'admin' && (
          !activeStaff ? (
            <AdminLogin onLogin={handleLogin} />
          ) : (
            <AdminDashboard
              appointments={appointments}
              blocks={blocks}
              clinicalSettings={clinicalSettings}
              services={services}
              staff={staff}
              activeStaff={activeStaff}
              onLogout={handleLogout}
              onSaveSettings={handleSaveSettings}
              onSaveServices={handleSaveServices}
              onAddBlock={addBlock}
              onRemoveBlock={removeBlock}
              onCancelAppointment={cancelAppointment}
              onDeleteAppointment={deleteAppointment}
              onRescheduleAppointment={rescheduleAppointment}
              onScheduleFollowUp={scheduleFollowUp}
              onUpdateNotes={updateAppointmentNotes}
              onCreateSeries={handleCreateRecurringSeries}
              onAddStaff={handleAddStaff}
              onRemoveStaff={handleRemoveStaff}
              onBulkSchedule={handleBulkSchedule}
            />
          )
        )}
        {view === 'patient-portal' && (
          <PatientPortal
            appointments={appointments}
            onLogin={handlePatientLogin}
            onLogout={handlePatientLogout}
            activeEmail={activePatientEmail}
            services={services}
            clinicalSettings={clinicalSettings}
            onCancelAppointment={cancelAppointment}
            onNewAppointment={handlePortalNewAppointment}
          />
        )}
        {view === 'confirmation' && (
          <div className="max-w-2xl mx-auto py-40 px-6 text-center">
            <div className="bg-white p-16 rounded-[60px] shadow-2xl border border-slate-50">
              <div className="w-20 h-20 bg-[#7E9084]/10 rounded-full flex items-center justify-center mx-auto mb-10">
                <svg className="w-10 h-10 text-[#7E9084]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-4xl font-serif mb-6">Agendamento Realizado</h2>
              <p className="text-slate-500 mb-12 font-light text-lg">
                Olá, {lastAppointment?.patientName}. Sua reserva para o dia <span className="font-bold text-slate-900">{lastAppointment?.date}</span> às <span className="font-bold text-slate-900">{lastAppointment?.startTime}</span> foi processada.
              </p>
              <div className="mb-10 space-y-4">
                <p className="text-sm text-slate-400">Você pode acompanhar suas sessões no portal do paciente.</p>
                <button onClick={() => setView('patient-portal')} className="text-slate-900 font-bold underline text-sm">Acessar Portal do Paciente</button>
              </div>
              <button onClick={() => setView('landing')} className="w-full py-6 bg-slate-900 text-white rounded-full font-bold shadow-xl transition-all">
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer clinicalSettings={clinicalSettings} />
    </div>
  );
};

export default App;
