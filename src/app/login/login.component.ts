import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from './service/login.service';
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
  constructor(private loginService: LoginService, private router: Router) {}

  login(email: string, password: string) {
    this.loginService.validateCredentials(email, password).subscribe({
      next: (users: any[]) => {
        if (users.length > 0) {
          alert('Inicio de sesión exitoso');
          this.router.navigate(['/dates-management']);
        } else {
          alert('Credenciales incorrectas');
        }
      },
      error: (err: any) => console.error('Error al validar credenciales:', err),
    });
  }
}
