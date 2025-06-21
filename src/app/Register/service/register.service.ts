import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private apiUrl = 'http://localhost:3000/register';
  private medicalHistoryUrl = 'http://localhost:3000/medicalHistory';

  constructor(private http: HttpClient) {}

  registerUser(user: { id?: string; username: string; email: string; password: string; role?: string }): Observable<any> {
    // Generar un id único si no viene
    const id = user.id || Math.random().toString(16).slice(2);
    const role = user.role || 'Paciente';
    const userWithId = { ...user, id, role };
    // Crear registro en medicalHistory
    const medicalHistory = {
      id,
      name: user.username,
      email: user.email,
      role,
      age: null,
      phone: '',
      address: '',
      diagnosis: '',
      treatment: '',
      date: ''
    };
    return forkJoin([
      this.http.post(this.apiUrl, userWithId),
      this.http.post(this.medicalHistoryUrl, medicalHistory)
    ]);
  }
}
