import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  age?: number;
  phone?: string;
  address?: string;
  diagnosis?: string;
  treatment?: string;
  date?: string;
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
    this.profileSubject.next(profile);
    localStorage.setItem('profile', JSON.stringify(profile));
  }

  getProfile(): Observable<Profile> {
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
}