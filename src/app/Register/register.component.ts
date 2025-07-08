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
    // Validaciones de seguridad y reglas de negocio
    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage = validationError;
      this.toast.show(validationError, 'error');
      return;
    }

    const newUser: any = {
      fullname: this.fullname.trim(),
      email: this.email.toLowerCase().trim(),
      password: this.password,
      role: this.role
    };
    
    if (this.role === 'Médico') {
      newUser.specialty = this.specialty.trim();
      newUser.license = this.license.toUpperCase().trim();
      newUser.experience = this.experience;
      newUser.fullName = this.fullName.trim();
    }

    // Verificar si el email ya existe
    this.registerService.checkEmailExists(newUser.email).subscribe({
      next: (emailExists) => {
        if (emailExists) {
          this.errorMessage = 'El email ya está registrado';
          this.toast.show('El email ya está registrado', 'error');
          return;
        }

        // Si es médico, verificar también la colegiatura
        if (this.role === 'Médico') {
          this.registerService.checkLicenseExists(newUser.license).subscribe({
            next: (licenseExists) => {
              if (licenseExists) {
                this.errorMessage = 'La colegiatura ya está registrada';
                this.toast.show('La colegiatura ya está registrada', 'error');
                return;
              }
              this.proceedWithRegistration(newUser);
            },
            error: (error) => {
              this.errorMessage = 'Error al verificar colegiatura';
              this.toast.show('Error al verificar colegiatura', 'error');
            }
          });
        } else {
          this.proceedWithRegistration(newUser);
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al verificar email';
        this.toast.show('Error al verificar email', 'error');
      }
    });
  }

  private proceedWithRegistration(user: any) {
    this.registerService.registerUser(user).subscribe({
      next: () => {
        this.toast.show('Usuario registrado exitosamente', 'success');
        this.clearForm();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Error al registrar usuario';
        this.toast.show('Error al registrar usuario', 'error');
      }
    });
  }

  validateForm(): string | null {
    // Validar nombre completo
    if (!this.fullname || this.fullname.trim().length < 2) {
      return 'El nombre completo debe tener al menos 2 caracteres';
    }
    if (this.fullname.trim().length > 100) {
      return 'El nombre completo no puede exceder 100 caracteres';
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.fullname.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }

    // Validar email
    if (!this.email || !this.isValidEmail(this.email)) {
      return 'Por favor ingrese un email válido';
    }
    if (this.email.length > 255) {
      return 'El email no puede exceder 255 caracteres';
    }

    // Validar contraseña
    const passwordValidation = this.validatePassword(this.password);
    if (passwordValidation) {
      return passwordValidation;
    }

    // Validar rol
    if (!this.role || (this.role !== 'Paciente' && this.role !== 'Médico')) {
      return 'Debe seleccionar un rol válido';
    }

    // Validaciones específicas para médicos
    if (this.role === 'Médico') {
      if (!this.specialty || this.specialty.trim().length < 3) {
        return 'La especialidad debe tener al menos 3 caracteres';
      }
      if (this.specialty.trim().length > 50) {
        return 'La especialidad no puede exceder 50 caracteres';
      }

      // Validar colegiatura (5 dígitos)
      if (!this.license || !/^\d{5}$/.test(this.license.trim())) {
        return 'La colegiatura debe tener exactamente 5 dígitos';
      }

      // Validar experiencia
      if (!this.experience || this.experience < 0 || this.experience > 50) {
        return 'La experiencia debe estar entre 0 y 50 años';
      }
    }

    return null;
  }

  validatePassword(password: string): string | null {
    if (!password) {
      return 'La contraseña es requerida';
    }
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (password.length > 128) {
      return 'La contraseña no puede exceder 128 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'La contraseña debe contener al menos un carácter especial (@$!%*?&)';
    }
    return null;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  clearForm() {
    this.fullname = '';
    this.email = '';
    this.password = '';
    this.role = '';
    this.specialty = '';
    this.license = '';
    this.experience = null;
    this.fullName = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}
