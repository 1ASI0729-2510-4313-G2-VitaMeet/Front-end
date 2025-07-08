import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SecurityService } from './security.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private securityService: SecurityService,
    private router: Router,
    private toast: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    return this.securityService.isAuthenticated().pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.toast.show('Debe iniciar sesión para acceder a esta página', 'error');
          this.router.navigate(['/login']);
          return false;
        }

        // Verificar si la sesión ha expirado
        if (this.securityService.isSessionExpired()) {
          this.toast.show('Su sesión ha expirado. Por favor inicie sesión nuevamente.', 'error');
          this.router.navigate(['/login']);
          return false;
        }

        // Extender la sesión
        this.securityService.extendSession();

        // Verificar permisos de rol si están especificados en la ruta
        const requiredRole = route.data['role'];
        if (requiredRole) {
          // Esta verificación se puede mejorar para ser asíncrona
          // Por ahora, solo verificamos autenticación básica
        }

        return true;
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private securityService: SecurityService,
    private router: Router,
    private toast: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredRole = route.data['role'];
    if (!requiredRole) {
      return true; // No hay restricción de rol
    }

    return this.securityService.hasRole(requiredRole).pipe(
      map(hasRole => {
        if (!hasRole) {
          this.toast.show('No tiene permisos para acceder a esta página', 'error');
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}
