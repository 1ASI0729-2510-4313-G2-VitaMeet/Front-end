import { Component, OnInit } from '@angular/core';
import { DatesManagementService } from './service/dates-management.service';
import {NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import { ToastService } from '../shared/toast.service';

@Component({
  selector: 'app-dates-management',
  standalone: true,
  templateUrl: './dates-management.component.html',
  styleUrls: ['./dates-management.component.css'],
  imports: [
    NgForOf,
    NgIf,
    RouterLink
  ]
})
export class DatesManagementComponent implements OnInit {
  appointments: { id: number; doctor: {fullname:string}; patient?: {id:string, fullname:string, email:string}; date: string; time: string; place?: string }[] = [];

  constructor(private datesService: DatesManagementService, private toast: ToastService) {}

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
    // Reemplazar prompt por un input simple
    const newDate = window.prompt('Ingrese la nueva fecha (YYYY-MM-DD):');
    if (newDate) {
      this.datesService.updateAppointment(id, { date: newDate }).subscribe({
        next: () => {
          this.toast.show('Cita reprogramada con éxito.', 'success');
          this.loadAppointments();
        },
        error: (err) => {
          this.toast.show('Error al reprogramar cita.', 'error');
          console.error('Error al reprogramar cita:', err);
        },
      });
    }
  }

  cancelAppointment(id: number) {
    // Reemplazar confirm por toast y lógica simple
    if (window.confirm('¿Está seguro de que desea cancelar esta cita?')) {
      this.datesService.deleteAppointment(id).subscribe({
        next: () => {
          this.toast.show('Cita cancelada con éxito.', 'success');
          this.loadAppointments();
        },
        error: (err) => {
          this.toast.show('Error al cancelar cita.', 'error');
          console.error('Error al cancelar cita:', err);
        },
      });
    }
  }
}
