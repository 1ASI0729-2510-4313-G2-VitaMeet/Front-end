import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile } from '../../profile/services/profile.service';

export interface Appointment {
  id?: number;
  date: string;
  time: string;
  doctor: {
    id: number;
    fullname: string;
    specialty: string;
  };
  patient?: {
    id: string;
    fullname: string;
    email: string;
  };
  place: string;
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

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.apiUrl);
  }

  getDoctors(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.doctorsUrl);
  }

  getPatients(): Observable<Profile[]> {
    return this.http.get<Profile[]>(this.patientsUrl);
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${appointment.id}`, appointment);
  }
}
