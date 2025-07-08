import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProfileService } from '../profile/services/profile.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  constructor(private profileService: ProfileService) {}

  // Verificar si el usuario está autenticado
  isAuthenticated(): Observable<boolean> {
    const profile = localStorage.getItem('profile');
    if (!profile) {
      return of(false);
    }

    try {
      const parsedProfile = JSON.parse(profile);
      return of(!!parsedProfile.id);
    } catch {
      return of(false);
    }
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(requiredRole: string): Observable<boolean> {
    return new Observable(observer => {
      this.profileService.getProfile().subscribe(profile => {
        observer.next(profile?.role === requiredRole);
        observer.complete();
      });
    });
  }

  // Verificar si el usuario puede acceder a un recurso
  canAccessResource(resourceOwnerId: string): Observable<boolean> {
    return new Observable(observer => {
      this.profileService.getProfile().subscribe(profile => {
        // El usuario puede acceder si es el propietario del recurso
        observer.next(profile?.id === resourceOwnerId);
        observer.complete();
      });
    });
  }

  // Verificar si es un médico
  isDoctor(): Observable<boolean> {
    return this.hasRole('Médico');
  }

  // Verificar si es un paciente
  isPatient(): Observable<boolean> {
    return this.hasRole('Paciente');
  }

  // Gestión de intentos de login fallidos
  recordFailedLoginAttempt(email: string): void {
    const key = `failed_attempts_${email}`;
    const attempts = this.getFailedAttempts(email) + 1;
    const data = {
      attempts,
      lastAttempt: Date.now(),
      lockoutUntil: attempts >= this.MAX_LOGIN_ATTEMPTS ? Date.now() + this.LOCKOUT_DURATION : null
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  getFailedAttempts(email: string): number {
    const key = `failed_attempts_${email}`;
    const data = localStorage.getItem(key);
    if (!data) return 0;

    try {
      const parsed = JSON.parse(data);
      // Si ha pasado el tiempo de bloqueo, resetear
      if (parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
        localStorage.removeItem(key);
        return 0;
      }
      return parsed.attempts || 0;
    } catch {
      return 0;
    }
  }

  isAccountLocked(email: string): boolean {
    const key = `failed_attempts_${email}`;
    const data = localStorage.getItem(key);
    if (!data) return false;

    try {
      const parsed = JSON.parse(data);
      return parsed.lockoutUntil && Date.now() < parsed.lockoutUntil;
    } catch {
      return false;
    }
  }

  getLockoutTimeRemaining(email: string): number {
    const key = `failed_attempts_${email}`;
    const data = localStorage.getItem(key);
    if (!data) return 0;

    try {
      const parsed = JSON.parse(data);
      if (!parsed.lockoutUntil) return 0;
      const remaining = parsed.lockoutUntil - Date.now();
      return Math.max(0, remaining);
    } catch {
      return 0;
    }
  }

  clearFailedAttempts(email: string): void {
    const key = `failed_attempts_${email}`;
    localStorage.removeItem(key);
  }

  // Gestión de sesión
  updateLastActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString());
  }

  isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return true;

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    return timeSinceLastActivity > this.SESSION_TIMEOUT;
  }

  extendSession(): void {
    this.updateLastActivity();
  }

  // Validar permisos para citas
  canManageAppointment(appointmentPatientId: string, appointmentDoctorId: string): Observable<boolean> {
    return new Observable(observer => {
      this.profileService.getProfile().subscribe(profile => {
        if (!profile) {
          observer.next(false);
          observer.complete();
          return;
        }

        // El usuario puede gestionar la cita si es el paciente o el doctor
        const canManage = profile.id === appointmentPatientId || profile.id === appointmentDoctorId;
        observer.next(canManage);
        observer.complete();
      });
    });
  }

  // Validar permisos para evaluaciones
  canSubmitEvaluation(appointmentPatientId: string): Observable<boolean> {
    return new Observable(observer => {
      this.profileService.getProfile().subscribe(profile => {
        if (!profile) {
          observer.next(false);
          observer.complete();
          return;
        }

        // Solo el paciente puede evaluar y debe ser un paciente
        const canEvaluate = profile.id === appointmentPatientId && profile.role === 'Paciente';
        observer.next(canEvaluate);
        observer.complete();
      });
    });
  }

  // Limpiar datos de seguridad
  clearSecurityData(): void {
    // Limpiar intentos de login fallidos al hacer logout
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('failed_attempts_')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('last_activity');
  }

  // Validar que el usuario puede registrarse
  canRegister(): boolean {
    // Implementar lógica adicional si es necesario
    // Por ejemplo, verificar si el registro está habilitado
    return true;
  }

  // Log de actividades de seguridad
  logSecurityEvent(event: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // En un entorno de producción, esto se enviaría a un servidor
    console.log('Security Event:', logEntry);
  }
}
