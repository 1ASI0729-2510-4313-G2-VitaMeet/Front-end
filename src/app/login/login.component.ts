import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { LoginService } from './service/login.service';
import {FormsModule} from '@angular/forms';
import { ProfileService, Profile } from '../profile/services/profile.service';
import { HttpClient } from '@angular/common/http';
import { ToastComponent } from '../shared/toast.component';
import { AsyncPipe } from '@angular/common';
import { ToastService } from '../shared/toast.service';

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
    public toast: ToastService
  ) {
    // Limpiar localStorage al inicializar el componente de login
    localStorage.clear();
  }

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      this.toast.show('Por favor, complete todos los campos.', 'error');
      return;
    }
    
    console.log('Iniciando login con:', this.email, this.password);
    
    // Limpiar localStorage completamente al inicio
    localStorage.clear();
    
    this.loginService.validateCredentials(this.email, this.password).subscribe({
      next: (users) => {
        console.log('Usuarios encontrados:', users);
        
        if (users.length > 0) {
          const user = users[0];
          console.log('Usuario logueado:', user);
          console.log('Rol del usuario:', user.role);
          
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
          
          // Mostrar mensaje de éxito
          this.toast.show('Inicio de sesión exitoso', 'success');
          
          // Pequeño delay para asegurar que el perfil se establezca
          setTimeout(() => {
            this.navegarPorRol(user.role);
          }, 100);
        } else {
          this.toast.show('Credenciales incorrectas.', 'error');
        }
      },
      error: (err) => {
        this.toast.show('Error al iniciar sesión.', 'error');
        console.error('Error al iniciar sesión:', err);
      },
    });
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
