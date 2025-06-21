import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Profile {
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private profileSubject = new BehaviorSubject<Profile | null>(null);

  constructor() {
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

  updateProfile(profile: Profile): Observable<void> {
    this.setProfile(profile);
    return of();
  }
}