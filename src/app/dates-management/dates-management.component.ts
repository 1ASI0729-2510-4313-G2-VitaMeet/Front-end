import { Component, OnInit } from '@angular/core';
import { DatesManagementService } from './service/dates-management.service';
import { EvaluationService, Evaluation } from '../shared/evaluation.service';
import {NgForOf, NgIf, AsyncPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import { ToastService } from '../shared/toast.service';
import { ToastComponent } from '../shared/toast.component';

@Component({
  selector: 'app-dates-management',
  standalone: true,
  templateUrl: './dates-management.component.html',
  styleUrls: ['./dates-management.component.css'],
  imports: [
    NgForOf,
    NgIf,
    RouterLink,
    ToastComponent,
    AsyncPipe
  ]
})
export class DatesManagementComponent implements OnInit {
  appointments: { id: string; doctor: {fullname:string}; patient?: {id:string, fullname:string, email:string}; date: string; time: string; place?: string; completed?: boolean }[] = [];
  selectedEvaluation: Evaluation | null = null;
  showEvaluationModal = false;
  evaluationsCache: { [appointmentId: string]: boolean } = {};

  constructor(
    private datesService: DatesManagementService, 
    public toast: ToastService,
    private evaluationService: EvaluationService
  ) {}

  get toastData$() {
    return this.toast.toast$;
  }

  ngOnInit() {
    console.log('Iniciando DatesManagementComponent');
    this.loadAppointments();
    this.loadEvaluationsCache();
  }

  loadEvaluationsCache() {
    this.evaluationService.getEvaluations().subscribe({
      next: (evaluations) => {
        this.evaluationsCache = {};
        evaluations.forEach(evaluation => {
          this.evaluationsCache[evaluation.appointmentId] = true;
        });
      },
      error: (err) => console.error('Error al cargar evaluaciones:', err)
    });
  }

  loadAppointments() {
    console.log('Cargando citas...');
    this.datesService.getAppointments().subscribe({
      next: (data) => {
        console.log('Citas cargadas:', data);
        this.appointments = data;
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.toast.show('Error al cargar citas', 'error');
      },
    });
  }

  rescheduleAppointment(id: string) {
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

  cancelAppointment(id: string) {
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

  completeAppointment(id: string) {
    if (window.confirm('¿Está seguro de que desea marcar esta cita como terminada?')) {
      this.datesService.completeAppointment(id).subscribe({
        next: () => {
          this.toast.show('Cita terminada con éxito.', 'success');
          this.loadAppointments();
          this.loadEvaluationsCache(); // Refresh evaluations cache
        },
        error: (err) => {
          this.toast.show('Error al terminar cita.', 'error');
          console.error('Error al terminar cita:', err);
        },
      });
    }
  }

  viewEvaluation(appointmentId: string) {
    this.evaluationService.getEvaluationByAppointment(appointmentId).subscribe({
      next: (evaluations) => {
        if (evaluations.length > 0) {
          this.selectedEvaluation = evaluations[0];
          this.showEvaluationModal = true;
        } else {
          this.toast.show('No hay evaluación disponible para esta cita.', 'info');
        }
      },
      error: (err) => {
        this.toast.show('Error al cargar evaluación.', 'error');
        console.error('Error al cargar evaluación:', err);
      },
    });
  }

  closeEvaluationModal() {
    this.showEvaluationModal = false;
    this.selectedEvaluation = null;
  }

  hasEvaluation(appointmentId: string): boolean {
    return this.evaluationsCache[appointmentId] || false;
  }
}
