import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ValidationService } from '../../shared/validation.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/register';

  constructor(private http: HttpClient) {}

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
    
    // Buscar primero en register que es el endpoint principal
    return this.http.get<any[]>(`${this.apiUrl}?email=${normalizedEmail}&password=${password}`).pipe(
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

  // Verificar si un email existe (para recuperación de contraseña, etc.)
  checkEmailExists(email: string): Observable<boolean> {
    if (!ValidationService.isValidEmail(email)) {
      return of(false);
    }

    const normalizedEmail = email.toLowerCase().trim();
    return this.http.get<any[]>(`${this.apiUrl}?email=${normalizedEmail}`).pipe(
      map(users => users.length > 0),
      catchError(() => of(false))
    );
  }

  // Obtener información básica del usuario por email (sin contraseña)
  getUserByEmail(email: string): Observable<any | null> {
    if (!ValidationService.isValidEmail(email)) {
      return of(null);
    }

    const normalizedEmail = email.toLowerCase().trim();
    return this.http.get<any[]>(`${this.apiUrl}?email=${normalizedEmail}`).pipe(
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
