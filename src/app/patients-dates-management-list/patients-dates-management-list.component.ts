import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgIf, CommonModule } from '@angular/common';
import { Appointment, PatientsDatesManagementService } from '../patients-dates-management/service/patients-dates-management.service';
import { ProfileService, Profile } from '../profile/services/profile.service';
import { EvaluationService } from '../evaluation/service/evaluation.service';

@Component({
  selector: 'app-patients-dates-management-list',
  templateUrl: './patients-dates-management-list.component.html',
  styleUrls: ['./patients-dates-management-list.component.css'],
  imports: [NgForOf, NgIf, CommonModule]
})
export class PatientsDatesManagementListComponent implements OnInit {
  appointments: Appointment[] = [];
  profile: Profile | null = null;
  evaluationsCache: { [appointmentId: string]: boolean } = {};

  constructor(
    private service: PatientsDatesManagementService,
    private router: Router,
    private profileService: ProfileService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    this.service.getAppointments().subscribe(data => {
      // Normalizar para que todos los doctores tengan 'fullname'
      this.appointments = data.map(app => ({
        ...app,
        doctor: {
          ...app.doctor,
          fullname: app.doctor.fullname || ''
        }
      })).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      
      // Cargar cache de evaluaciones
      this.loadEvaluationsCache();
    });
    this.profileService.getProfile().subscribe(profile => {
      this.profile = profile;
    });
  }

  loadEvaluationsCache() {
    this.evaluationsCache = {};
    this.appointments.forEach(appointment => {
      if (appointment.id) {
        this.evaluationService.hasEvaluationForAppointment(appointment.id).subscribe(hasEvaluation => {
          this.evaluationsCache[appointment.id!] = hasEvaluation;
        });
      }
    });
  }

  hasEvaluation(appointmentId: string): boolean {
    return this.evaluationsCache[appointmentId] || false;
  }

  evaluateAppointment(appointmentId: string) {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment && this.profile) {
      this.router.navigate(['/evaluation'], {
        queryParams: {
          appointmentId: appointmentId,
          patientId: this.profile.id
        }
      });
    }
  }

  viewEvaluation(appointmentId: string) {
    this.evaluationService.getEvaluationByAppointmentId(appointmentId).subscribe(evaluation => {
      if (evaluation) {
        // Mostrar la evaluación en un modal o navegar a una página de detalles
        alert(`Evaluación: ${evaluation.rating}/5 estrellas\nComentario: ${evaluation.feedback}`);
      }
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
