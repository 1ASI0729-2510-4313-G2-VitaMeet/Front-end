import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private evaluationService: EvaluationService,
    private router: Router
  ) {}

  get toastData$() {
    return this.toast.toast$;
  }

  ngOnInit() {
    console.log('Iniciando DatesManagementComponent');
    
    // Verificar que tengamos un usuario logueado
    const profile = localStorage.getItem('profile');
    console.log('📦 Profile en localStorage:', profile);
    
    if (!profile) {
      console.log('❌ No hay perfil en localStorage, redirigiendo al login');
      this.router.navigate(['/login']);
      return;
    }
    
    try {
      const parsedProfile = JSON.parse(profile);
      console.log('👤 Perfil parseado:', parsedProfile);
      
      if (!parsedProfile.id) {
        console.log('❌ Perfil sin ID, redirigiendo al login');
        this.router.navigate(['/login']);
        return;
      }
      
      if (parsedProfile.role !== 'Médico') {
        console.log('❌ Usuario no es médico, redirigiendo');
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('❌ Error parsing profile, redirigiendo al login:', error);
      this.router.navigate(['/login']);
      return;
    }
    
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
    
    // Debug: verificar datos del perfil
    this.datesService.debugProfileData();
    
    // Primero hacer test simple
    this.datesService.getSimpleAppointmentTest().subscribe();
    
    // Luego hacer la carga normal
    this.datesService.getDoctorAppointments().subscribe({
      next: (data: any) => {
        console.log('✅ Citas cargadas exitosamente:', data);
        console.log('📊 Cantidad de citas:', data?.length || 0);
        this.appointments = data;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar citas:', err);
        console.error('📋 Status:', err.status);
        console.error('📄 Body:', err.error);
        console.error('🌐 URL:', err.url);
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
        error: (err: any) => {
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
        error: (err: any) => {
          this.toast.show('Error al cancelar cita.', 'error');
          console.error('Error al cancelar cita:', err);
        },
      });
    }
  }

  completeAppointment(id: string) {
    if (window.confirm('¿Está seguro de que desea marcar esta cita como terminada?')) {
      console.log('🔥 Intentando completar cita con ID:', id);
      
      this.datesService.completeAppointment(id).subscribe({
        next: (response: any) => {
          console.log('✅ Cita completada exitosamente - Respuesta:', response);
          this.toast.show('Cita terminada con éxito.', 'success');
          
          // Actualizar la cita local inmediatamente
          const appointmentIndex = this.appointments.findIndex(app => app.id === id);
          if (appointmentIndex !== -1) {
            this.appointments[appointmentIndex].completed = true;
            console.log('🔄 Cita local actualizada:', this.appointments[appointmentIndex]);
          }
          
          // Recargar la lista completa después de un pequeño delay para dar tiempo al backend
          setTimeout(() => {
            console.log('🔄 Recargando lista de citas después de completar...');
            this.loadAppointments();
            this.loadEvaluationsCache(); // Refresh evaluations cache
          }, 1000);
        },
        error: (err: any) => {
          console.error('❌ Error al terminar cita:', err);
          console.error('📋 Status:', err.status);
          console.error('📄 Body:', err.error);
          this.toast.show('Error al terminar cita.', 'error');
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

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
