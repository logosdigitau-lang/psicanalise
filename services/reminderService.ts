
import { Appointment, IntegrationSettings } from '../types';

export class ReminderService {
  /**
   * Filtra agendamentos que precisam de lembrete (24h antes)
   */
  static getPendingReminders(appointments: Appointment[], settings: IntegrationSettings): Appointment[] {
    if (!settings.remindersEnabled) return [];

    const now = new Date();
    const targetWindow = settings.reminderHours * 60 * 60 * 1000; // converter horas em ms

    return appointments.filter(apt => {
      if (apt.reminderSent || apt.status !== 'confirmed') return false;

      const aptTime = new Date(`${apt.date}T${apt.startTime}:00`).getTime();
      const diff = aptTime - now.getTime();

      // Se o agendamento está dentro da janela (ex: menos de 24h) e não é no passado
      return diff > 0 && diff <= targetWindow;
    });
  }

  /**
   * Simula o envio de uma mensagem via WhatsApp
   */
  static async sendWhatsAppReminder(appointment: Appointment): Promise<boolean> {
    console.log(`[ReminderService] Enviando WhatsApp para ${appointment.patientName}: 
      "Olá! Passando para confirmar nossa sessão amanhã às ${appointment.startTime}. Até lá!"`);
    
    // Simulação de delay de API
    await new Promise(r => setTimeout(r, 1000));
    return true;
  }

  /**
   * Simula o envio de um e-mail
   */
  static async sendEmailReminder(appointment: Appointment): Promise<boolean> {
    console.log(`[ReminderService] Enviando E-mail para ${appointment.patientEmail}:
      Assunto: Confirmação de Sessão - Messias Tavares
      Corpo: Olá ${appointment.patientName}, este é um lembrete automático de sua sessão no dia ${appointment.date} às ${appointment.startTime}.`);
    
    await new Promise(r => setTimeout(r, 1000));
    return true;
  }
}
