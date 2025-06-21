import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf } from '@angular/common';
import { Appointment, PatientsDatesManagementService } from '../patients-dates-management/service/patients-dates-management.service';
import { ProfileService, Profile } from '../profile/services/profile.service';

@Component({
  selector: 'app-patients-dates-management-list',
  templateUrl: './patients-dates-management-list.component.html',
  styleUrls: ['./patients-dates-management-list.component.css'],
  imports: [NgForOf]
})
export class PatientsDatesManagementListComponent implements OnInit {
  appointments: Appointment[] = [];
  profile: Profile | null = null;

  constructor(
    private service: PatientsDatesManagementService,
    private router: Router,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.service.getAppointments().subscribe(data => {
      this.appointments = data.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    });
    this.profileService.getProfile().subscribe(profile => {
      this.profile = profile;
    });
  }

  nuevaCita() {
    this.router.navigate(['/patients-dates-management']);
  }

  editarPerfil() {
    this.router.navigate(['/profile']);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
