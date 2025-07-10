import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, tap, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';

export interface Profile {
  id: string;
  fullname: string;
  email: string;
  role: string;
  age?: number;
  phone?: string;
  address?: string;
  diagnosis?: string;
  treatment?: string;
  date?: string;
  photo?: string; // base64
  specialty?: string;
  license?: string;
  experience?: number;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private profileSubject = new BehaviorSubject<Profile | null>(null);

  constructor(private http: HttpClient, private config: ConfigService) {
    // Cargar perfil desde localStorage si existe
    const stored = localStorage.getItem('profile');
    if (stored) {
      this.profileSubject.next(JSON.parse(stored));
    }
  }

  setProfile(profile: Profile) {
    console.log('Estableciendo perfil:', profile);
    
    // Verificar si el perfil ha cambiado realmente para evitar actualizaciones innecesarias
    const currentProfile = this.profileSubject.value;
    if (currentProfile && JSON.stringify(currentProfile) === JSON.stringify(profile)) {
      console.log('Perfil sin cambios, omitiendo actualización');
      return;
    }
    
    this.profileSubject.next(profile);
    localStorage.setItem('profile', JSON.stringify(profile));
    console.log('Perfil guardado en localStorage');
  }

  getProfile(): Observable<Profile> {
    console.log('Obteniendo perfil actual...');
    return this.profileSubject.asObservable().pipe(
      filter((profile: Profile | null): profile is Profile => profile !== null)
    );
  }

  updateProfile(profile: Profile): Observable<any> {
    console.log('🔥 Actualizando perfil - Backend activo:', this.config.isUsingBackend());
    console.log('📄 Perfil a actualizar:', profile);
    
    if (this.config.isUsingBackend()) {
      // Backend real - adaptar estructura según el rol
      const url = profile.role === 'Paciente' 
        ? `${this.config.getPatientsUrl()}/${profile.id}`
        : `${this.config.getDoctorsUrl()}/${profile.id}`;
      
      // Estructura para backend (solo campos necesarios)
      const backendData: any = {
        name: profile.fullname,
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || ''
      };
      
      // Agregar campos específicos según el rol
      if (profile.role === 'Médico') {
        backendData.specialty = profile.specialty || '';
        backendData.license = profile.license || '';
        backendData.experience = profile.experience || 0;
      } else {
        backendData.age = profile.age || null;
      }
      
      console.log('🚀 Payload para backend:', backendData);
      console.log('🌐 URL destino:', url);
        
      return this.http.put(url, backendData, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).pipe(
        tap(response => {
          console.log('✅ Perfil actualizado exitosamente:', response);
          this.setProfile(profile);
        }),
        catchError(error => {
          console.error('❌ Error al actualizar perfil:', error);
          console.error('📋 Status:', error.status);
          console.error('📄 Body:', error.error);
          throw error;
        })
      );
    } else {
      // JSON Server - usar medicalHistory
      return this.http.put(`${this.config.getMedicalRecordsUrl()}/${profile.id}`, profile).pipe(
        tap(() => {
          this.setProfile(profile);
        })
      );
    }
  }

  getCurrentProfile(): Observable<Profile | null> {
    return new Observable(observer => {
      const currentProfile = this.profileSubject.value;
      observer.next(currentProfile);
      observer.complete();
    });
  }

  // Obtener perfil síncrono
  getCurrentProfileSync(): Profile | null {
    return this.profileSubject.value;
  }

  // Método para limpiar la suscripción y evitar memory leaks
  clearProfile(): void {
    this.profileSubject.next(null);
    localStorage.removeItem('profile');
  }
}