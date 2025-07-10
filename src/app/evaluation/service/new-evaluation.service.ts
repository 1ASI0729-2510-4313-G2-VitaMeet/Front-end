import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { DoctorRating } from '../models/doctor-rating.model';
import { ConfigService } from '../../shared/config.service';

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

  constructor(private http: HttpClient, private config: ConfigService) {}

  // Obtener cita por ID
  getAppointment(appointmentId: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.config.getAppointmentsUrl()}/${appointmentId}`);
  }

  // Obtener doctor por ID
  getDoctor(doctorId: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.config.getDoctorsUrl()}/${doctorId}`);
  }

  // Obtener paciente por ID
  getPatient(patientId: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.config.getPatientsUrl()}/${patientId}`);
  }

  // Obtener todas las evaluaciones de un doctor
  getDoctorEvaluations(doctorId: string): Observable<DoctorRating[]> {
    if (this.config.isUsingBackend()) {
      // Backend real - endpoint específico
      return this.http.get<DoctorRating[]>(`${this.config.getEvaluationsUrl()}/doctor/${doctorId}`);
    } else {
      // JSON Server - query param
      return this.http.get<DoctorRating[]>(`${this.config.getEvaluationsUrl()}?doctorId=${doctorId}`);
    }
  }

  // Obtener cita por ID desde el endpoint appointments
  getAppointmentFromAppointments(appointmentId: string): Observable<any> {
    return this.http.get<any>(`${this.config.getAppointmentsUrl()}/${appointmentId}`);
  }

  // Crear una nueva evaluación
  createEvaluation(evaluation: DoctorRating): Observable<DoctorRating> {
    console.log('🔥 Creando evaluación - Backend activo:', this.config.isUsingBackend());
    console.log('📄 Evaluación a crear:', evaluation);
    
    if (this.config.isUsingBackend()) {
      // Backend real - estructura específica
      const backendEvaluation = {
        doctorId: evaluation.doctorId,
        patientId: evaluation.patientId,
        appointmentId: evaluation.appointmentId,
        rating: evaluation.rating,
        comment: evaluation.comment,
        date: evaluation.date
      };
      
      console.log('🚀 Payload para backend:', backendEvaluation);
      
      return this.http.post<DoctorRating>(`${this.config.getEvaluationsUrl()}`, backendEvaluation, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).pipe(
        tap(response => console.log('✅ Evaluación creada:', response)),
        catchError(error => {
          console.error('❌ Error al crear evaluación:', error);
          console.error('📋 Status:', error.status);
          console.error('📄 Body:', error.error);
          throw error;
        })
      );
    } else {
      // JSON Server - POST /evaluation
      return this.http.post<DoctorRating>(`${this.config.getEvaluationsUrl()}`, evaluation);
    }
  }

  // Marcar cita como evaluada
  markAppointmentAsEvaluated(appointmentId: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.config.getAppointmentsUrl()}/${appointmentId}`, {
      evaluated: true
    });
  }

  // Verificar si una cita ya fue evaluada
  isAppointmentEvaluated(appointmentId: number): Observable<boolean> {
    return this.getAppointment(appointmentId).pipe(
      map(appointment => appointment.evaluated || false),
      catchError(() => of(false))
    );
  }

  // Verificar si existe evaluación para una cita específica
  hasEvaluationForAppointment(appointmentId: string): Observable<boolean> {
    if (this.config.isUsingBackend()) {
      return this.http.get<DoctorRating[]>(`${this.config.getEvaluationsUrl()}?appointmentId=${appointmentId}`).pipe(
        map(evaluations => evaluations.length > 0),
        catchError(() => of(false))
      );
    } else {
      return this.http.get<DoctorRating[]>(`${this.config.getEvaluationsUrl()}?appointmentId=${appointmentId}`).pipe(
        map(evaluations => evaluations.length > 0),
        catchError(() => of(false))
      );
    }
  }

  // Obtener evaluación por ID de cita
  getEvaluationByAppointmentId(appointmentId: string): Observable<DoctorRating | null> {
    if (this.config.isUsingBackend()) {
      return this.http.get<DoctorRating[]>(`${this.config.getEvaluationsUrl()}?appointmentId=${appointmentId}`).pipe(
        map(evaluations => evaluations.length > 0 ? evaluations[0] : null),
        catchError(() => of(null))
      );
    } else {
      return this.http.get<DoctorRating[]>(`${this.config.getEvaluationsUrl()}?appointmentId=${appointmentId}`).pipe(
        map(evaluations => evaluations.length > 0 ? evaluations[0] : null),
        catchError(() => of(null))
      );
    }
  }

  // Obtener todas las citas completadas y no evaluadas
  getCompletedUnevaluatedAppointments(patientId: string): Observable<Appointment[]> {
    if (this.config.isUsingBackend()) {
      return this.http.get<Appointment[]>(`${this.config.getAppointmentsUrl()}/patient/${patientId}/completed-unevaluated`);
    } else {
      return this.http.get<Appointment[]>(`${this.config.getAppointmentsUrl()}?patientId=${patientId}&completed=true&evaluated=false`);
    }
  }

  // Obtener todos los doctores
  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.config.getDoctorsUrl()}`);
  }

  // Calcular promedio de calificaciones de un doctor
  getDoctorAverageRating(doctorId: string): Observable<number> {
    return this.getDoctorEvaluations(doctorId).pipe(
      map(evaluations => {
        if (evaluations.length === 0) return 0;
        const total = evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
        return total / evaluations.length;
      }),
      catchError(() => of(0))
    );
  }
}
