
import { Appointment, Service, GoogleBusySlot } from '../types';

// Nota: Em um ambiente real, o CLIENT_ID seria configurado via env.
// Configuração Real do Google Calendar
const CLIENT_ID = '656892295078-fkc1iftfvcgm98ua7gpbusc0htdr9jdb.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';

export class GoogleCalendarService {
  private static tokenClient: any = null;
  private static accessTokenResolver: ((token: string | null) => void) | null = null;

  static init() {
    if (typeof window === 'undefined' || !(window as any).google) {
      return;
    }

    // Se já inicializou, não faz nada
    if (this.tokenClient) return;

    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error !== undefined) {
          console.error('Erro no callback do Google:', response);
          if (this.accessTokenResolver) this.accessTokenResolver(null);
        } else {
          if (this.accessTokenResolver) this.accessTokenResolver(response.access_token);
        }
        this.accessTokenResolver = null;
      },
    });
  }

  static async requestAccessToken(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.tokenClient) {
        this.init();
        if (!this.tokenClient) {
          console.error('Google Token Client não pôde ser inicializado.');
          return resolve(null);
        }
      }

      // Se já houver uma requisição pendente, cancela a anterior (opcional)
      // Definimos o resolver atual para esta chamada
      this.accessTokenResolver = resolve;

      // Abre o popup
      this.tokenClient.requestAccessToken();
    });
  }

  static async createEvent(appointment: Appointment, service: Service, token: string): Promise<string | null> {
    try {
      const startDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`).toISOString();
      // Calcular fim baseado na duração
      const startObj = new Date(startDateTime);
      const endObj = new Date(startObj.getTime() + service.duration * 60000);
      const endDateTime = endObj.toISOString();

      const event = {
        summary: `Sessão: ${appointment.patientName} (${appointment.format})`,
        description: `Motivo: ${appointment.consultationReason || 'Não informado'}\nWhatsApp: ${appointment.patientPhone}\nServiço: ${service.name}`,
        start: { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' },
        end: { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' },
        reminders: { useDefault: true }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        console.error('Erro API Google:', await response.json());
        return null;
      }

      const data = await response.json();
      return data.id;
    } catch (e) {
      console.error('Exceção ao criar evento no Google:', e);
      return null;
    }
  }

  static async listEvents(minDate: Date, maxDate: Date, token: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        timeMin: minDate.toISOString(),
        timeMax: maxDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime'
      });

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Erro ao listar eventos Google:', await response.json());
        return [];
      }

      const data = await response.json();
      return data.items || [];
    } catch (e) {
      console.error('Exceção ao listar eventos Google:', e);
      return [];
    }
  }

  static async listCalendars(token: string): Promise<{ items: any[], error?: string }> {
    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Erro ao listar calendários:', err);
        return { items: [], error: JSON.stringify(err) };
      }

      const data = await response.json();
      return { items: data.items || [] };
    } catch (e: any) {
      console.error('Exceção ao listar calendários:', e);
      return { items: [], error: e.message || String(e) };
    }
  }

  static async getBusySlots(date: string, token: string): Promise<GoogleBusySlot[]> {


    try {
      // Usar horário local para definir início e fim do dia, convertendo para ISO (UTC)
      const startLocal = new Date(`${date}T00:00:00`);
      const endLocal = new Date(`${date}T23:59:59`);

      const timeMin = startLocal.toISOString();
      const timeMax = endLocal.toISOString();

      console.log(`[GoogleBusy] Buscando busy slots para ${date}`, { timeMin, timeMax });

      const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeMin,
          timeMax,
          items: [{ id: 'primary' }]
        })
      });

      if (!response.ok) {
        console.error('[GoogleBusy] Erro na resposta:', await response.json());
        return [];
      }
      const data = await response.json();
      const busy = data.calendars.primary.busy || [];
      console.log('[GoogleBusy] Slots encontrados:', busy);
      return busy;
    } catch (e) {
      console.error('Erro ao buscar slots ocupados no Google:', e);
      return [];
    }
  }
}
