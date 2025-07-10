import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ConfigService } from '../../shared/config.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

  constructor(private http: HttpClient, private config: ConfigService) {}

  checkEmailExists(email: string): Observable<boolean> {
    if (this.config.isUsingBackend()) {
      // Para backend real, deshabilitar verificación temporal
      // Tu backend manejará la validación de email duplicado
      console.log('🔍 Saltando checkEmailExists para backend real');
      return of(false); // Asumir que el email NO existe
    } else {
      // JSON Server
      return this.http.get<any[]>(`${this.config.getAuthRegisterUrl()}?email=${email.toLowerCase()}`).pipe(
        map(users => users.length > 0),
        catchError(() => of(false))
      );
    }
  }

  checkLicenseExists(license: string): Observable<boolean> {
    if (this.config.isUsingBackend()) {
      // Para backend real, usar endpoint de doctores
      return this.http.get<any[]>(`${this.config.getDoctorsUrl()}`).pipe(
        map(doctors => doctors.some(doc => doc.license === license.toUpperCase())),
        catchError(() => of(false))
      );
    } else {
      // JSON Server
      return this.http.get<any[]>(`${this.config.getAuthRegisterUrl()}?license=${license.toUpperCase()}&role=Médico`).pipe(
        map(doctors => doctors.length > 0),
        catchError(() => of(false))
      );
    }
  }

  registerUser(user: { id?: string; fullname?: string; fullName?: string; name?: string; email: string; password: string; role?: string; specialty?: string; license?: string; experience?: number }): Observable<any> {
    console.log('🔥 INICIO registerUser - Backend activo:', this.config.isUsingBackend());
    const role = user.role || 'Paciente';
    
    if (this.config.isUsingBackend()) {
      console.log('🎯 Entrando en rama del backend');
      // Backend real - solo campos básicos + específicos según rol
      const userName = user.name || user.fullname || user.fullName || '';
      const userData: any = { 
        name: userName.trim(),
        email: user.email.toLowerCase().trim(),
        password: user.password,
        role: role
      };
      
      // Solo agregar campos específicos de médicos si es médico
      if (role === 'Médico') {
        userData.specialty = user.specialty?.trim() || '';
        userData.license = user.license?.toUpperCase().trim() || '';
        userData.experience = user.experience || 0;
      }
      
      console.log('🚀 Payload simplificado para backend:', userData);
      console.log('🌐 URL destino:', this.config.getAuthRegisterUrl());
      
      return this.http.post(`${this.config.getAuthRegisterUrl()}`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).pipe(
        tap(response => console.log('✅ Respuesta exitosa:', response)),
        catchError(error => {
          console.error('❌ Error del backend:', error);
          console.error('📋 Status:', error.status);
          console.error('📄 Body:', error.error);
          console.error('🔍 Message:', error.error?.message);
          console.error('🔍 Error completo:', JSON.stringify(error.error, null, 2));
          throw error;
        })
      );
    } else {
      // JSON Server - múltiples endpoints
      const id = user.id || Math.random().toString(16).slice(2);
      const userName = user.name || user.fullname || user.fullName || '';
      
      const userWithId = { 
        ...user, 
        id, 
        role,
        email: user.email.toLowerCase().trim(),
        fullname: userName.trim(),
        license: user.license ? user.license.toUpperCase().trim() : undefined
      };
      
      // Crear registro en medicalHistory para JSON Server
      const medicalHistory: any = {
        id,
        fullname: userName,
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
          this.http.post(`${this.config.getDoctorsUrl()}`, userWithId),
          this.http.post(`${this.config.getAuthRegisterUrl()}`, userWithId)
        ]);
      } else {
        // Guardar en patients, register y medicalHistory
        return forkJoin([
          this.http.post(`${this.config.getPatientsUrl()}`, userWithId),
          this.http.post(`${this.config.getAuthRegisterUrl()}`, userWithId),
          this.http.post(`${this.config.getMedicalRecordsUrl()}`, medicalHistory)
        ]);
      }
    }
  }
}
