import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterService } from './service/register.service';
import {Router, RouterLink} from '@angular/router';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  fullname = '';
  email = '';
  password = '';
  role = '';
  // Campos adicionales para médicos
  specialty = '';
  license = '';
  experience: number | null = null;
  fullName = '';
  errorMessage = '';
  successMessage = '';

  constructor(private registerService: RegisterService, private router: Router, private toast: ToastService) {
  }

  onRegister() {
    const newUser: any = {
      fullname: this.fullname,
      email: this.email,
      password: this.password,
      role: this.role
    };
    if (this.role === 'Médico') {
      newUser.specialty = this.specialty;
      newUser.license = this.license;
      newUser.experience = this.experience;
      newUser.fullName = this.fullName;
    }
    this.registerService.registerUser(newUser).subscribe({
      next: () => {
        this.toast.show('Usuario registrado exitosamente', 'success');
        this.successMessage = '';
        this.errorMessage = '';
        this.fullname = '';
        this.email = '';
        this.password = '';
        this.role = '';
        this.specialty = '';
        this.license = '';
        this.experience = null;
        this.fullName = '';
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        this.toast.show('Error al registrar el usuario', 'error');
        this.errorMessage = '';
        this.successMessage = '';
      },
    });
  }
}
