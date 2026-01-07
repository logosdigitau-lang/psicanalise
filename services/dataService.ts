
import { supabase } from './supabaseClient';
import { Appointment, Service, Block, Staff, ClinicalSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

// Validates if a string is a valid UUID
const isValidUUID = (id: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(id);
};

// --- Mappers ---

const mapAppointmentFromDB = (db: any): Appointment => ({
    id: db.id,
    serviceId: db.service_id,
    patientName: db.patient_name,
    patientEmail: db.patient_email,
    patientPhone: db.patient_phone,
    consultationReason: db.consultation_reason,
    date: db.date,
    startTime: db.start_time,
    endTime: db.end_time || '',
    format: db.format,
    status: db.status,
    paymentId: db.payment_id,
    googleEventId: db.google_event_id,
    notes: db.notes,
    patientFeedback: db.patient_feedback,
    nextSessionContext: db.next_session_context,
    createdAt: db.created_at,
    recurrenceId: db.recurrence_id,
    reminderSent: db.reminder_sent
});

const mapAppointmentToDB = (app: Appointment) => ({
    id: app.id,
    service_id: app.serviceId,
    patient_name: app.patientName,
    patient_email: app.patientEmail,
    patient_phone: app.patientPhone,
    consultation_reason: app.consultationReason,
    date: app.date,
    start_time: app.startTime,
    end_time: app.endTime,
    format: app.format,
    status: app.status,
    payment_id: app.paymentId,
    google_event_id: app.googleEventId,
    notes: app.notes,
    patient_feedback: app.patientFeedback,
    next_session_context: app.nextSessionContext,
    created_at: app.createdAt,
    recurrence_id: app.recurrenceId,
    reminder_sent: app.reminderSent
});

// --- Services ---

export const DataService = {
    // Appointments
    async getAppointments(): Promise<Appointment[]> {
        const { data, error } = await supabase.from('appointments').select('*');
        if (error) {
            console.error('Error fetching appointments:', error);
            return [];
        }
        return data.map(mapAppointmentFromDB);
    },

    async createAppointment(app: Appointment) {
        const { error } = await supabase.from('appointments').insert(mapAppointmentToDB(app));
        if (error) console.error('Error creating appointment:', error);
        return !error;
    },

    async updateAppointment(app: Appointment) {
        const { error } = await supabase.from('appointments').update(mapAppointmentToDB(app)).eq('id', app.id);
        if (error) console.error('Error updating appointment:', error);
        return !error;
    },

    async deleteAppointment(id: string) {
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) console.error('Error deleting appointment:', error);
        return !error;
    },

    // Patient Management (Batch Operations)
    async updatePatientProfile(oldEmail: string, newProfile: { name: string, email: string, phone: string }) {
        // Update all appointments for this patient
        const { error } = await supabase.from('appointments')
            .update({
                patient_name: newProfile.name,
                patient_email: newProfile.email,
                patient_phone: newProfile.phone
            })
            .eq('patient_email', oldEmail);

        if (error) console.error('Error updating patient profile:', error);
        return !error;
    },

    async deletePatient(email: string) {
        // Delete all appointments for this patient
        const { error } = await supabase.from('appointments').delete().eq('patient_email', email);
        if (error) console.error('Error deleting patient:', error);
        return !error;
    },

    // Services
    async getServices(): Promise<Service[]> {
        const { data, error } = await supabase.from('services').select('*').order('price', { ascending: true });
        if (error) {
            console.error('Error fetching services:', error);
            return [];
        }
        // Simple mapping as keys match mostly, but let's be explicit
        return data.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            type: s.type
        }));
    },

    async saveServices(services: Service[]) {
        // Delete all and insert (easiest for sync list) or upsert. 
        // Given the app structure, upsert is safer.
        const dbServices = services.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
            type: s.type
        }));

        const { error } = await supabase.from('services').upsert(dbServices);
        if (error) console.error('Error saving services:', error);
        return !error;
    },

    // Blocks
    async getBlocks(): Promise<Block[]> {
        const { data, error } = await supabase.from('blocks').select('*');
        if (error) {
            console.error('Error fetching blocks:', error);
            return [];
        }
        return data.map(b => ({
            id: b.id,
            startDate: b.start_date,
            endDate: b.end_date,
            startTime: b.start_time,
            endTime: b.end_time,
            isAllDay: b.is_all_day,
            reason: b.reason
        }));
    },

    async saveBlock(block: Block) {
        const dbBlock = {
            id: block.id,
            start_date: block.startDate,
            end_date: block.endDate,
            start_time: block.startTime,
            end_time: block.endTime,
            is_all_day: block.isAllDay,
            reason: block.reason
        };
        const { error } = await supabase.from('blocks').insert(dbBlock);
        if (error) console.error('Error saving block:', error);
        return !error;
    },

    async deleteBlock(id: string) {
        const { error } = await supabase.from('blocks').delete().eq('id', id);
        if (error) console.error('Error deleting block:', error);
        return !error;
    },

    // Staff
    async getStaff(): Promise<Staff[]> {
        const { data, error } = await supabase.from('staff').select('*');
        if (error) {
            console.error('Error fetching staff:', error);
            return [];
        }
        return data as Staff[];
    },

    async saveStaffMember(staff: Staff) {
        const { error } = await supabase.from('staff').insert(staff);
        if (error) console.error('Error saving staff:', error);
        return !error;
    },

    async deleteStaff(id: string) {
        const { error } = await supabase.from('staff').delete().eq('id', id);
        if (error) console.error('Error deleting staff:', error);
        return !error;
    },

    // Settings
    async getSettings(): Promise<ClinicalSettings | null> {
        const { data, error } = await supabase.from('settings').select('data').eq('id', 1).single();
        if (error) {
            // If not found, create default
            if (error.code === 'PGRST116') {
                await supabase.from('settings').insert({ id: 1, data: DEFAULT_SETTINGS as any });
                return null; // Let caller use default
            }
            console.error('Error fetching settings:', error);
            return null;
        }
        return data.data as ClinicalSettings;
    },

    async saveSettings(settings: ClinicalSettings) {
        const { error } = await supabase.from('settings').upsert({ id: 1, data: settings as any });
        if (error) console.error('Error saving settings:', error);
        return !error;
    }
};
