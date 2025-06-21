import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { LoginService } from './service/login.service';
import {FormsModule} from '@angular/forms';

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

  constructor(private loginService: LoginService, private router: Router) {}

  login() {
    this.loginService.validateCredentials(this.email, this.password).subscribe({
      next: (users) => {
        if (users.length > 0) {
          const user = users[0];
          if (user.role === 'Médico') {
            this.router.navigate(['/dates-management']);
          } else if (user.role === 'Paciente') {
            alert('Inicio de sesión exitoso, pero no hay contenido para pacientes.');
          }
        } else {
          alert('Credenciales incorrectas.');
        }
      },
      error: (err) => console.error('Error al iniciar sesión:', err),
    });
  }
}
