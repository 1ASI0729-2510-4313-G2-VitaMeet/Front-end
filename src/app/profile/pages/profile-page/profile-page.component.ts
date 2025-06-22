import { Component, OnInit } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { ProfileService, Profile } from '../../services/profile.service';
import {  FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule]
})
export class ProfilePageComponent implements OnInit {
  profile: Profile = { id: '', name: '', email: '', role: '' };
  editMode = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.profileService.getProfile().subscribe(data => {
      this.profile = data;
    });
  }

guardarCambios() {
  console.log('Guardando perfil:', this.profile);
  this.profileService.updateProfile(this.profile).subscribe(() => {
    this.editMode = false;
    alert('Perfil actualizado correctamente');
  });
}

  activarEdicion() {
    this.editMode = true;
  }

  cerrarSesion() {
    window.location.href = '/login';
  }
}
