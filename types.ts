
export type ServiceType = 'initial' | 'regular' | 'plan';
export type FormatType = 'online' | 'presencial';
export type AppointmentStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'completed';
export type RecurrenceType = 'none' | 'weekly' | 'biweekly';
export type ReminderChannel = 'whatsapp' | 'email' | 'both';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  type: ServiceType;
}

export interface WorkingPeriod {
  start: string;
  end: string;
  enabled?: boolean;
}

export interface WorkingDay {
  day: number; // 0 (Dom) a 6 (Sáb)
  isOpen: boolean;
  periods: WorkingPeriod[];
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha para acesso administrativo
  role: 'analyst' | 'secretary';
}

export interface ThemeConfig {
  primary: string;
  accent: string;
  warm: string;
}

export interface PageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  bioTitle: string;
  bioSubtitle: string;
  bioText: string;
  bioImageUrl: string;
  clinicAddress: string;
  clinicEmail: string;
  clinicPhone: string;
  clinicCity: string;
  instagramUrl: string;
}

export interface IntegrationSettings {
  googleCalendarConnected: boolean;
  googleAccessToken?: string;
  googleEmail?: string;
  googleCalendarId?: string;
  googleBookingUrl?: string;
  whatsappEnabled: boolean;
  // Mercado Pago
  mercadoPagoConnected: boolean;
  mercadoPagoPublicKey?: string;
  mercadoPagoAccessToken?: string;
  // InfinitePay
  infinitePayConnected: boolean;
  infinitePayApiKey?: string;
  infinitePayUserToken?: string;
  // Lembretes
  remindersEnabled: boolean;
  reminderChannel: ReminderChannel;
  reminderHours: number;
}

export interface ClinicalSettings {
  defaultSessionDuration: number;
  workingDays: WorkingDay[];
  theme: ThemeConfig;
  integrations: IntegrationSettings;
  content: PageContent;
  patientSummaries?: { [email: string]: string }; // Email -> General Advice
}

export interface Appointment {
  id: string;
  serviceId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  consultationReason?: string;
  date: string;
  startTime: string;
  endTime: string;
  format: FormatType;
  status: AppointmentStatus;
  paymentStatus?: 'paid' | 'pending';
  paymentId?: string;
  googleEventId?: string;
  notes?: string;
  patientFeedback?: string; // Novo: Notas que o paciente pode ver
  nextSessionContext?: string;
  createdAt: string;
  recurrenceId?: string;
  reminderSent?: boolean;
}

export interface Block {
  id: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  reason: string;
}

export interface GoogleBusySlot {
  start: string;
  end: string;
}
