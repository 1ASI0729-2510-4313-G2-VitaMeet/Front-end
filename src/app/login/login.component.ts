import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { LoginService } from './service/login.service';
import {FormsModule} from '@angular/forms';
import { ProfileService } from '../profile/services/profile.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule,
    RouterLink
  ]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      alert('Debes ingresar email y contraseña.');
      return;
    }
    this.loginService.validateCredentials(this.email, this.password).subscribe({
      next: (users) => {
        if (users.length > 0) {
          const user = users[0];
          // Guarda el perfil del usuario logueado
          this.profileService.setProfile({
            name: user.name,
            email: user.email,
            role: user.role
          });
          if (user.role === 'Médico') {
            this.router.navigate(['/dates-management']);
          } else if (user.role === 'Paciente') {
            this.router.navigate(['/patients-dates-management-list']);
          }
        } else {
          alert('Credenciales incorrectas.');
        }
      },
      error: (err) => console.error('Error al iniciar sesión:', err),
    });
  }
}
