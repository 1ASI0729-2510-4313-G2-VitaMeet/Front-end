import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

export interface Evaluation {
  id?: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  date: string;
  doctorName: string;
  patientName: string;
}

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  constructor(private http: HttpClient, private config: ConfigService) {}

  getEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(this.config.getEvaluationsUrl());
  }

  getEvaluationByAppointment(appointmentId: string): Observable<Evaluation[]> {
    if (this.config.isUsingBackend()) {
      return this.http.get<Evaluation[]>(`${this.config.getEvaluationsUrl()}?appointmentId=${appointmentId}`);
    } else {
      return this.http.get<Evaluation[]>(`${this.config.getEvaluationsUrl()}?appointmentId=${appointmentId}`);
    }
  }

  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.config.getEvaluationsUrl(), evaluation);
  }

  updateEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.config.getEvaluationsUrl()}/${evaluation.id}`, evaluation);
  }

  deleteEvaluation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.getEvaluationsUrl()}/${id}`);
  }
}
