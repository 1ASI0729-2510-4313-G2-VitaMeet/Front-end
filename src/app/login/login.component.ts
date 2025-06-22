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
  ) {}

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      this.toast.show('Por favor, complete todos los campos.', 'error');
      return;
    }
    this.loginService.validateCredentials(this.email, this.password).subscribe({
      next: (users) => {
        if (users.length > 0) {
          const user = users[0];
          // Buscar el perfil completo en medicalHistory
          this.http.get<Profile[]>(`http://localhost:3000/medicalHistory?id=${user.id}`).subscribe((profiles) => {
            if (profiles.length > 0) {
              // Si existe, usar el perfil completo
              this.profileService.setProfile(profiles[0]);
              this.navegarPorRol(user.role);
            } else {
              // Si no existe, crearlo y luego usarlo
              const newProfile: Profile = {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                age: 0, // Asignar un valor por defecto o solicitar al usuario
                phone: '',
                address: '',
                diagnosis: '',
                treatment: '',
                date: ''
              };
              this.http.post<Profile>('http://localhost:3000/medicalHistory', newProfile).subscribe((createdProfile) => {
                this.profileService.setProfile(createdProfile);
                this.navegarPorRol(user.role);
              });
            }
          });
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
    if (rol === 'Médico') {
      this.router.navigate(['/dates-management']);
    } else if (rol === 'Paciente') {
      this.router.navigate(['/patients-dates-management-list']);
    }
  }
}
