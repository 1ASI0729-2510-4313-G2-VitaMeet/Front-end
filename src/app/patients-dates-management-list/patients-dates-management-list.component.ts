import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf } from '@angular/common';
import { Appointment, PatientsDatesManagementService } from '../patients-dates-management/service/patients-dates-management.service';

@Component({
  selector: 'app-patients-dates-management-list',
  templateUrl: './patients-dates-management-list.component.html',
  styleUrls: ['./patients-dates-management-list.component.css'],
  imports: [NgForOf]
})

export class PatientsDatesManagementListComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(
    private service: PatientsDatesManagementService,
    private router: Router
  ) {}

  ngOnInit() {
    this.service.getAppointments().subscribe(data => {
      this.appointments = data.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    });
  }

  nuevaCita() {
    this.router.navigate(['/patients-dates-management']);
  }

  editarPerfil() {
    // No hace nada por ahora
  }

  cerrarSesion() {
    // Aquí podrías limpiar el estado de autenticación si lo tuvieras
    this.router.navigate(['/login']);
  }
}
