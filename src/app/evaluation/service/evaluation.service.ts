import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DoctorRating } from '../models/doctor-rating.model';

export interface Appointment {
  id: number;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  evaluated: boolean;
}

export interface Doctor {
  id: string;
  fullname: string;
  email: string;
  role: string;
  specialty: string;
  license: string;
  experience: number;
}

export interface Patient {
  id: string;
  fullname: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Obtener cita por ID
  getAppointment(appointmentId: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/appointments/${appointmentId}`);
  }

  // Obtener doctor por ID
  getDoctor(doctorId: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.baseUrl}/doctors/${doctorId}`);
  }

  // Obtener paciente por ID
  getPatient(patientId: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/patients/${patientId}`);
  }

  // Obtener todas las evaluaciones de un doctor
  getDoctorEvaluations(doctorId: string): Observable<DoctorRating[]> {
    return this.http.get<DoctorRating[]>(`${this.baseUrl}/evaluations?doctorId=${doctorId}`);
  }

  // Obtener cita por ID desde el endpoint appointments
  getAppointmentFromAppointments(appointmentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appointments/${appointmentId}`);
  }

  // Crear una nueva evaluación
  createEvaluation(evaluation: DoctorRating): Observable<DoctorRating> {
    return this.http.post<DoctorRating>(`${this.baseUrl}/evaluation`, evaluation);
  }

  // Marcar cita como evaluada
  markAppointmentAsEvaluated(appointmentId: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${appointmentId}`, {
      evaluated: true
    });
  }

  // Verificar si una cita ya fue evaluada
  isAppointmentEvaluated(appointmentId: number): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getAppointment(appointmentId).subscribe(appointment => {
        observer.next(appointment.evaluated);
        observer.complete();
      });
    });
  }

  // Obtener evaluación por ID de cita
  getEvaluationByAppointmentId(appointmentId: string): Observable<DoctorRating | null> {
    return this.http.get<DoctorRating[]>(`${this.baseUrl}/evaluation?appointmentId=${appointmentId}`).pipe(
      map(evaluations => evaluations.length > 0 ? evaluations[0] : null)
    );
  }

  // Verificar si existe una evaluación para una cita específica
  hasEvaluationForAppointment(appointmentId: string): Observable<boolean> {
    return this.http.get<DoctorRating[]>(`${this.baseUrl}/evaluation?appointmentId=${appointmentId}`).pipe(
      map(evaluations => evaluations.length > 0)
    );
  }

  // Obtener citas completadas no evaluadas por paciente
  getCompletedUnevaluatedAppointments(patientId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments?patientId=${patientId}&status=completed&evaluated=false`);
  }

  // Obtener todos los doctores
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.baseUrl}/doctors`);
  }

  // Calcular rating promedio de un doctor
  getDoctorAverageRating(doctorId: string): Observable<number> {
    return new Observable<number>(observer => {
      this.getDoctorEvaluations(doctorId).subscribe(evaluations => {
        if (evaluations.length === 0) {
          observer.next(0);
        } else {
          const total = evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
          observer.next(total / evaluations.length);
        }
        observer.complete();
      });
    });
  }
}
