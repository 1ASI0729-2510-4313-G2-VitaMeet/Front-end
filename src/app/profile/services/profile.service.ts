import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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
  private medicalHistoryUrl = 'http://localhost:3000/medicalHistory';

  constructor(private http: HttpClient) {
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
    // Actualiza en backend y local
    return this.http.put(`${this.medicalHistoryUrl}/${profile.id}`, profile).pipe(
      tap(() => {
        this.setProfile(profile);
      })
    );
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