import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  private readonly REQUEST_TIMEOUT = 30000; // 30 segundos

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar headers de seguridad
    const secureReq = req.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    });

    // Aplicar timeout y manejo de errores
    return next.handle(secureReq).pipe(
      timeout(this.REQUEST_TIMEOUT),
      catchError(error => {
        // Log de errores de seguridad
        console.error('HTTP Error:', error);
        
        // Si es un error de autenticación, podrías redirigir al login
        if (error.status === 401) {
          // Aquí podrías inyectar Router y redirigir
          console.warn('Unauthorized access detected');
        }

        return throwError(() => error);
      })
    );
  }
}
