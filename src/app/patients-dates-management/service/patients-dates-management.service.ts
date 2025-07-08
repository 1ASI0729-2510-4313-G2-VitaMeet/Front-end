import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Profile } from '../../profile/services/profile.service';

export interface Appointment {
  id?: string;
  date: string;
  time: string;
  doctor: {
    id: string;
    fullname: string;
    specialty: string;
  };
  patient?: {
    id: string;
    fullname: string;
    email: string;
  };
  place: string;
  completed?: boolean;
}


@Injectable({ providedIn: 'root' })
export class PatientsDatesManagementService {
  private apiUrl = 'http://localhost:3000/appointments';
  private doctorsUrl = 'http://localhost:3000/doctors'; // Ahora solo médicos
  private patientsUrl = 'http://localhost:3000/patients';

  constructor(private http: HttpClient) {}

  getPatientFullName(): string | null {
    const profile = localStorage.getItem('profile');
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      return parsedProfile.fullname || null;
    }
    return null;
  }

  getPatientId(): string | null {
    const profile = localStorage.getItem('profile');
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      return parsedProfile.id || null;
    }
    return null;
  }

  getAppointments(): Observable<Appointment[]> {
    console.log('Obteniendo citas desde el servicio...');
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      map((appointments: Appointment[]) => {
        console.log('Citas obtenidas:', appointments);
        return appointments;
      })
    );
  }

  getDoctors(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.doctorsUrl);
  }

  getPatients(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.patientsUrl);
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    // Generar un ID único más robusto
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    const appointmentWithId = { ...appointment, id: uniqueId };
    
    // Verificar duplicados antes de crear la cita
    return this.checkAppointmentConflicts(appointmentWithId).pipe(
      switchMap((hasConflict: boolean) => {
        if (hasConflict) {
          throw new Error('Ya existe una cita con los mismos datos');
        }
        
        console.log('Creando nueva cita con ID:', uniqueId);
        return this.http.post<Appointment>(this.apiUrl, appointmentWithId);
      })
    );
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${appointment.id}`, appointment);
  }

  getPatientAppointments(): Observable<Appointment[]> {
    const patientId = this.getPatientId();
    console.log('ID del paciente actual:', patientId);
    
    if (!patientId) {
      console.log('No hay ID de paciente, retornando array vacío');
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      map((appointments: Appointment[]) => {
        console.log('Todas las citas obtenidas del servidor:', appointments);
        console.log('Filtrando citas para el paciente con ID:', patientId);
        
        // Filtrar solo las citas donde el paciente coincide con el usuario actual
        const filteredAppointments = appointments.filter(appointment => {
          const matches = appointment.patient && appointment.patient.id === patientId;
          console.log(`Cita ${appointment.id}: paciente ID ${appointment.patient?.id}, coincide: ${matches}`);
          return matches;
        });
        
        console.log('Citas filtradas para el paciente:', filteredAppointments);
        return filteredAppointments;
      })
    );
  }

  // Validaciones de reglas de negocio
  validateAppointmentBusinessRules(appointment: Appointment): Observable<string | null> {
    const patientId = this.getPatientId();
    
    if (!patientId) {
      return new Observable(observer => {
        observer.next('No se pudo identificar al paciente');
        observer.complete();
      });
    }

    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      map((existingAppointments: Appointment[]) => {
        // 1. Verificar que la fecha no sea en el pasado
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const now = new Date();
        
        if (appointmentDate <= now) {
          return 'No se pueden agendar citas en fechas pasadas';
        }

        // 2. Verificar que no sea domingo
        if (appointmentDate.getDay() === 0) {
          return 'No se pueden agendar citas los domingos';
        }

        // 3. Verificar horario laboral (8:00 AM - 6:00 PM)
        const hour = appointmentDate.getHours();
        if (hour < 8 || hour >= 18) {
          return 'Las citas solo pueden agendarse entre 8:00 AM y 6:00 PM';
        }

        // 4. Verificar que no haya más de 2 citas por paciente por día
        const sameDay = existingAppointments.filter(apt => 
          apt.patient?.id === patientId && 
          apt.date === appointment.date
        );
        
        if (sameDay.length >= 2) {
          return 'No puede tener más de 2 citas por día';
        }

        // 5. Verificar que no haya citas duplicadas (mismo doctor, mismo día, misma hora)
        const duplicate = existingAppointments.find(apt => 
          apt.doctor.id === appointment.doctor.id &&
          apt.date === appointment.date &&
          apt.time === appointment.time
        );
        
        if (duplicate) {
          return 'Ya existe una cita con este doctor en esa fecha y hora';
        }

        // 6. Verificar que el paciente no tenga más de 5 citas pendientes
        const pendingAppointments = existingAppointments.filter(apt => 
          apt.patient?.id === patientId && 
          !apt.completed &&
          new Date(`${apt.date}T${apt.time}`) > now
        );
        
        if (pendingAppointments.length >= 5) {
          return 'No puede tener más de 5 citas pendientes al mismo tiempo';
        }

        // 7. Verificar que haya al menos 30 minutos entre citas del mismo paciente el mismo día
        const sameDayAppointments = existingAppointments.filter(apt => 
          apt.patient?.id === patientId && 
          apt.date === appointment.date
        );
        
        for (const existingApt of sameDayAppointments) {
          const existingTime = new Date(`${existingApt.date}T${existingApt.time}`);
          const timeDiff = Math.abs(appointmentDate.getTime() - existingTime.getTime());
          const minutesDiff = timeDiff / (1000 * 60);
          
          if (minutesDiff < 30) {
            return 'Debe haber al menos 30 minutos entre citas';
          }
        }

        return null; // Sin errores
      })
    );
  }

  checkAppointmentConflicts(appointment: Appointment): Observable<boolean> {
    return this.http.get<Appointment[]>(this.apiUrl).pipe(
      map((appointments: Appointment[]) => {
        return appointments.some(apt => 
          apt.doctor.id === appointment.doctor.id &&
          apt.patient?.id === appointment.patient?.id &&
          apt.date === appointment.date &&
          apt.time === appointment.time &&
          apt.id !== appointment.id // Excluir la cita actual si es una actualización
        );
      })
    );
  }
}
