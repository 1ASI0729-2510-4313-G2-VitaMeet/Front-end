import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { LoginService } from './service/login.service';
import {FormsModule} from '@angular/forms';
import { ProfileService, Profile } from '../profile/services/profile.service';
import { HttpClient } from '@angular/common/http';
import { ToastComponent } from '../shared/toast.component';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../shared/toast.service';
import { SecurityService } from '../shared/security.service';
import { ValidationService } from '../shared/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    RouterLink,
    ToastComponent,
    AsyncPipe
  ]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    private profileService: ProfileService,
    private http: HttpClient,
    public toast: ToastService,
    private securityService: SecurityService
  ) {
    // Limpiar localStorage al inicializar el componente de login
    localStorage.clear();
  }

  login() {
    // Verificar si está bloqueado
    if (this.securityService.isAccountLocked(this.email)) {
      const remainingTime = this.securityService.getLockoutTimeRemaining(this.email);
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      this.toast.show(`Cuenta bloqueada. Intente de nuevo en ${minutes}:${seconds.toString().padStart(2, '0')}`, 'error');
      return;
    }

    // Validar campos básicos
    const validationError = this.validateLoginForm();
    if (validationError) {
      this.toast.show(validationError, 'error');
      return;
    }
    
    console.log('Iniciando login con:', this.email);
    
    // Limpiar localStorage completamente al inicio (excepto datos de seguridad)
    this.securityService.clearSecurityData();
    
    this.loginService.validateCredentials(this.email, this.password).subscribe({
      next: (users) => {
        console.log('Usuarios encontrados:', users);
        
        if (users.length > 0) {
          const user = users[0];
          console.log('Usuario logueado:', user);
          console.log('Rol del usuario:', user.role);
          
          // Login exitoso - limpiar intentos fallidos
          this.securityService.clearFailedAttempts(this.email);
          
          // Establecer perfil directamente desde el usuario de register
          const profileData: Profile = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            age: 0,
            phone: '',
            address: '',
            diagnosis: '',
            treatment: '',
            date: '',
            // Agregar campos específicos de médico si es necesario
            specialty: user.specialty || '',
            license: user.license || '',
            experience: user.experience || 0
          };
          
          console.log('Estableciendo perfil:', profileData);
          this.profileService.setProfile(profileData);
          
          // Inicializar actividad de sesión
          this.securityService.updateLastActivity();
          
          // Log del evento de seguridad
          this.securityService.logSecurityEvent('LOGIN_SUCCESS', { email: this.email, role: user.role });
          
          // Mostrar mensaje de éxito
          this.toast.show('Inicio de sesión exitoso', 'success');
          
          // Pequeño delay para asegurar que el perfil se establezca
          setTimeout(() => {
            this.navegarPorRol(user.role);
          }, 100);
        } else {
          // Login fallido - registrar intento
          this.handleFailedLogin();
        }
      },
      error: (err) => {
        // Error de red o servidor - también cuenta como intento fallido
        this.handleFailedLogin();
        console.error('Error al iniciar sesión:', err);
      },
    });
  }

  private validateLoginForm(): string | null {
    if (!this.email || !this.email.trim()) {
      return 'El email es requerido';
    }
    if (!this.password || !this.password.trim()) {
      return 'La contraseña es requerida';
    }
    if (this.email.trim().length > 255) {
      return 'El email es demasiado largo';
    }
    if (!ValidationService.isValidEmail(this.email.trim())) {
      return 'Por favor ingrese un email válido';
    }
    return null;
  }

  private handleFailedLogin() {
    this.securityService.recordFailedLoginAttempt(this.email);
    
    const attempts = this.securityService.getFailedAttempts(this.email);
    const maxAttempts = 5; // Debería venir de una configuración
    
    if (this.securityService.isAccountLocked(this.email)) {
      this.securityService.logSecurityEvent('LOGIN_LOCKED', { email: this.email });
      this.toast.show('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.', 'error');
    } else {
      const remainingAttempts = maxAttempts - attempts;
      this.securityService.logSecurityEvent('LOGIN_FAILED', { email: this.email, attempts });
      this.toast.show(`Credenciales incorrectas. Intentos restantes: ${remainingAttempts}`, 'error');
    }
  }

  private navegarPorRol(rol: string) {
    console.log('Navegando por rol:', rol);
    
    // Asegurarse de que el rol esté limpio
    const rolLimpio = rol.trim();
    
    if (rolLimpio === 'Médico') {
      console.log('Redirigiendo a dates-management (médico)');
      this.router.navigate(['/dates-management']).then(success => {
        console.log('Navegación exitosa a dates-management:', success);
      }).catch(error => {
        console.error('Error en navegación:', error);
      });
    } else if (rolLimpio === 'Paciente') {
      console.log('Redirigiendo a patients-dates-management-list (paciente)');
      this.router.navigate(['/patients-dates-management-list']).then(success => {
        console.log('Navegación exitosa a patients-dates-management-list:', success);
      }).catch(error => {
        console.error('Error en navegación:', error);
      });
    } else {
      console.error('Rol no reconocido:', rolLimpio);
      this.toast.show('Rol de usuario no reconocido', 'error');
    }
  }
}
