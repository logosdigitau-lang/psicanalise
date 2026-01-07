
import { Service, ClinicalSettings } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Consulta Psicanalítica Inicial',
    description: 'Sessão destinada à escuta inicial, compreensão da demanda e definição da indicação terapêutica. Fundamental para iniciar o percurso.',
    price: 170,
    duration: 60,
    type: 'initial'
  },
  {
    id: 's2',
    name: 'Pacote Essencial (4 Sessões)',
    description: 'Indicado para o início do processo terapêutico e organização da demanda. Favorece a constância necessária nas primeiras semanas.',
    price: 540,
    duration: 50,
    type: 'plan'
  },
  {
    id: 's3',
    name: 'Pacote Continuidade (8 Sessões)',
    description: 'Indicado para aprofundamento do trabalho analítico e maior constância no acompanhamento psicanalítico.',
    price: 1040,
    duration: 50,
    type: 'plan'
  },
  {
    id: 's4',
    name: 'Pacote Processo Terapêutico (12 Sessões)',
    description: 'Indicado para quem busca um processo terapêutico contínuo, estruturado e com compromisso de longo prazo com a análise.',
    price: 1500,
    duration: 50,
    type: 'plan'
  }
];

export const COLORS = {
  primary: '#0F172A',
  secondary: '#64748B',
  accent: '#7E9084',
  warm: '#A67C6A',
  background: '#FAF9F6',
  white: '#FFFFFF',
  text: '#0F172A'
};

export const CLINIC_ADDRESS = "Rua Porto Alegre, 1508 B, Cerejeiras - RO";

export const CANCELLATION_POLICY = "Reagendamentos são permitidos com até 24h de antecedência. Cancelamentos após este período ou ausências não justificadas implicam na cobrança integral da sessão conforme o código de ética profissional.";

export const PIX_MOCK_KEY = "00020126580014br.gov.bcb.pix0136msig12@gmail.com5204000053039865802BR5925Messias Tavares Psicanali6010Cerejeiras62070503***6304ABCD";


export const MESSIAS_BIO = "Messias Tavares é psicanalista clínico, com atuação baseada na psicanálise de orientação freudiana e lacaniana. Oferece um espaço de escuta ética, acolhedora e profissional, voltado ao cuidado da saúde emocional. Atua no acompanhamento de adultos, jovens e casais, trabalhando questões como ansiedade, traumas, relacionamentos, conflitos emocionais, identidade, depressão e crises existenciais. Sua prátia respeita a singularidade de cada pessoa e o tempo do processo analítico, favorecendo o autoconhecimento e o amadurecimento emocional.";

export const DEFAULT_SETTINGS: ClinicalSettings = {
  defaultSessionDuration: 50,
  workingDays: [
    { day: 0, isOpen: false, periods: [{ start: '09:00', end: '18:00' }] },
    { day: 1, isOpen: true, periods: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '19:00' }] },
    { day: 2, isOpen: true, periods: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '19:00' }] },
    { day: 3, isOpen: true, periods: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '19:00' }] },
    { day: 4, isOpen: true, periods: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '19:00' }] },
    { day: 5, isOpen: true, periods: [{ start: '09:00', end: '12:00' }, { start: '13:30', end: '18:00' }] },
    { day: 6, isOpen: false, periods: [{ start: '09:00', end: '13:00' }] },
  ],
  theme: {
    primary: COLORS.primary,
    accent: COLORS.accent,
    warm: COLORS.warm
  },
  integrations: {
    googleCalendarConnected: false,
    googleBookingUrl: "https://calendar.app.google/UgXV1aC4ztWPC9Ui6",
    whatsappEnabled: true,
    mercadoPagoConnected: false,
    infinitePayConnected: false,
    remindersEnabled: true,
    reminderChannel: 'whatsapp',
    reminderHours: 24
  },
  content: {
    heroTitle: "A escuta que transforma silêncio em sentido.",
    heroSubtitle: "Psicanálise Clínica",
    heroDescription: "Messias Tavares oferece um percurso ético para a investigação do inconsciente. Um espaço seguro, sigiloso e acolhedor para a sua subjetividade.",
    heroImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    bioTitle: "Messias Tavares",
    bioSubtitle: "Trajetória e Ética",
    bioText: MESSIAS_BIO,
    bioImageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=1000",
    clinicAddress: "Rua Porto Alegre, 1508 B",
    clinicEmail: "msig12@gmail.com",
    clinicPhone: "(69) 99282-1283",
    clinicCity: "Cerejeiras - RO",
    instagramUrl: "https://www.instagram.com/messiastavarespr/"
  },
  patientSummaries: {}
};
