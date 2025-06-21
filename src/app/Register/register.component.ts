import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterService } from './service/register.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  role = '';
  errorMessage = '';
  successMessage = '';

  constructor(private registerService: RegisterService, private router: Router) {
  }

  onRegister() {
    const newUser = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: this.role
    };

    this.registerService.registerUser(newUser).subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado exitosamente';
        this.errorMessage = '';
        this.username = '';
        this.email = '';
        this.password = '';
        this.role = '';
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Error al registrar el usuario';
        this.successMessage = '';
      },
    });
  }
}
