import { Component, OnInit } from '@angular/core';
import { DatesManagementService } from './service/dates-management.service';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-dates-management',
  standalone: true,
  templateUrl: './dates-management.component.html',
  styleUrls: ['./dates-management.component.css'],
  imports: [
    NgForOf,
    RouterLink
  ]
})
export class DatesManagementComponent implements OnInit {
  appointments: { id: number; doctor: string; date: string; time: string }[] = [];

  constructor(private datesService: DatesManagementService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.datesService.getAppointments().subscribe({
      next: (data) => (this.appointments = data),
      error: (err) => console.error('Error al cargar citas:', err),
    });
  }

  rescheduleAppointment(id: number) {
    const newDate = prompt('Ingrese la nueva fecha (YYYY-MM-DD):');
    if (newDate) {
      this.datesService.updateAppointment(id, { date: newDate }).subscribe({
        next: () => {
          alert('Cita reprogramada con éxito.');
          this.loadAppointments();
        },
        error: (err) => console.error('Error al reprogramar cita:', err),
      });
    }
  }

  cancelAppointment(id: number) {
    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
      this.datesService.deleteAppointment(id).subscribe({
        next: () => {
          alert('Cita cancelada con éxito.');
          this.loadAppointments();
        },
        error: (err) => console.error('Error al cancelar cita:', err),
      });
    }
  }
}
