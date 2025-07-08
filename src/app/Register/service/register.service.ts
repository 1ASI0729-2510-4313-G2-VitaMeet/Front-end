import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private apiUrl = 'http://localhost:3000/register';
  private medicalHistoryUrl = 'http://localhost:3000/medicalHistory';

  constructor(private http: HttpClient) {}

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email.toLowerCase()}`).pipe(
      map(users => users.length > 0),
      catchError(() => of(false))
    );
  }

  checkLicenseExists(license: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}?license=${license.toUpperCase()}&role=Médico`).pipe(
      map(doctors => doctors.length > 0),
      catchError(() => of(false))
    );
  }

  registerUser(user: { id?: string; fullname: string; fullName?: string; email: string; password: string; role?: string; specialty?: string; license?: string; experience?: number }): Observable<any> {
    // Generar un id único si no viene
    const id = user.id || Math.random().toString(16).slice(2);
    const role = user.role || 'Paciente';
    
    // Normalizar datos
    const userWithId = { 
      ...user, 
      id, 
      role,
      email: user.email.toLowerCase().trim(),
      fullname: user.fullname.trim(),
      license: user.license ? user.license.toUpperCase().trim() : undefined
    };
    
    // Crear registro en medicalHistory
    const medicalHistory: any = {
      id,
      fullname: user.fullName || user.fullname,
      email: user.email.toLowerCase().trim(),
      role,
      age: null,
      phone: '',
      address: '',
      diagnosis: '',
      treatment: '',
      date: ''
    };
    
    if (role === 'Médico') {
      // Guardar en doctors y en register
      return forkJoin([
        this.http.post('http://localhost:3000/doctors', userWithId),
        this.http.post(this.apiUrl, userWithId)
      ]);
    } else {
      // Guardar en patients, register y medicalHistory
      return forkJoin([
        this.http.post('http://localhost:3000/patients', userWithId),
        this.http.post(this.apiUrl, userWithId),
        this.http.post(this.medicalHistoryUrl, medicalHistory)
      ]);
    }
  }
}
