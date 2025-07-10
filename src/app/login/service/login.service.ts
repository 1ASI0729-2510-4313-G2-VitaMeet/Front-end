import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ValidationService } from '../../shared/validation.service';
import { ConfigService } from '../../shared/config.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  constructor(private http: HttpClient, private config: ConfigService) {}

  validateCredentials(email: string, password: string): Observable<any> {
    console.log('Validando credenciales para:', email);
    
    // Validaciones básicas de entrada
    if (!email || !password) {
      return of([]);
    }

    // Validar formato de email
    if (!ValidationService.isValidEmail(email)) {
      return of([]);
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();
    
    if (this.config.isUsingBackend()) {
      // Usar backend real - POST /api/auth/login
      return this.http.post<any>(`${this.config.getAuthLoginUrl()}`, {
        email: normalizedEmail,
        password: password
      }).pipe(
        map(response => {
          // El backend devuelve un AuthResponse
          return response ? [response] : [];
        }),
        catchError(error => {
          console.error('Error al validar credenciales:', error);
          return of([]);
        })
      );
    } else {
      // Usar JSON Server - GET con query params
      return this.http.get<any[]>(`${this.config.getAuthLoginUrl()}?email=${normalizedEmail}&password=${password}`).pipe(
        map(users => {
          // Validar que los usuarios encontrados sean válidos
          return users.filter(user => 
            user && 
            user.email === normalizedEmail && 
            user.password === password &&
            user.id &&
            user.fullname &&
            user.role
          );
        }),
        catchError(error => {
          console.error('Error al validar credenciales:', error);
          return of([]);
        })
      );
    }
  }

  // Verificar si un email existe (para recuperación de contraseña, etc.)
  checkEmailExists(email: string): Observable<boolean> {
    if (!ValidationService.isValidEmail(email)) {
      return of(false);
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (this.config.isUsingBackend()) {
      // Para backend real, podrías necesitar un endpoint específico
      // Por ahora usar el mismo endpoint de login pero manejando el error
      return this.http.post<any>(`${this.config.getAuthLoginUrl()}`, {
        email: normalizedEmail,
        password: 'dummy' // Solo para verificar si existe el email
      }).pipe(
        map(() => true), // Si no da error, el email existe
        catchError(() => of(false)) // Si da error, el email no existe o es incorrecto
      );
    } else {
      // JSON Server
      return this.http.get<any[]>(`${this.config.getAuthLoginUrl()}?email=${normalizedEmail}`).pipe(
        map(users => users.length > 0),
        catchError(() => of(false))
      );
    }
  }

  // Obtener información básica del usuario por email (sin contraseña)
  getUserByEmail(email: string): Observable<any | null> {
    if (!ValidationService.isValidEmail(email)) {
      return of(null);
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    if (this.config.isUsingBackend()) {
      // Para backend real, necesitarías un endpoint específico para obtener info del usuario
      // Por ahora retornar null ya que no hay endpoint específico
      return of(null);
    } else {
      // JSON Server
      return this.http.get<any[]>(`${this.config.getAuthLoginUrl()}?email=${normalizedEmail}`).pipe(
        map(users => {
          if (users.length > 0) {
            const user = users[0];
            // Remover la contraseña antes de retornar
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          }
          return null;
        }),
        catchError(() => of(null))
      );
    }
  }
}
