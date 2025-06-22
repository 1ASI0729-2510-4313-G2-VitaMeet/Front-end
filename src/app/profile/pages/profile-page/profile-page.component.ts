import { Component, OnInit } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { ProfileService, Profile } from '../../services/profile.service';
import {  FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../../../shared/toast.component';
import { ToastService } from '../../../shared/toast.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, ToastComponent, NgIf]
})
export class ProfilePageComponent implements OnInit {
  profile: Profile = { id: '', fullname: '', email: '', role: '' };
  editMode = false;

  constructor(private profileService: ProfileService, public toast: ToastService) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe(data => {
      this.profile = data;
    });
  }

  guardarCambios() {
    this.profileService.updateProfile(this.profile).subscribe(() => {
      this.editMode = false;
      this.toast.show('Perfil actualizado correctamente', 'success');
    }, () => {
      this.toast.show('Error al actualizar el perfil', 'error');
    });
  }

  activarEdicion() {
    this.editMode = true;
  }

  cerrarSesion() {
    window.location.href = '/login';
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.photo = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  triggerPhotoInput() {
    const input = document.querySelector<HTMLInputElement>('input[type=file][#photoInput]') || document.querySelector<HTMLInputElement>('input[type=file]');
    if (input) input.click();
  }

  borrarFoto() {
    this.profile.photo = undefined;
  }
}
