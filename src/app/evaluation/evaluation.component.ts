import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorRating } from './models/doctor-rating.model';
import { EvaluationService } from './service/evaluation.service';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  evaluations: number;
  description: string;
  comments: number;
  staticRating: number;
}

interface AppointmentForEvaluation {
  id: string;
  date: string;
  time: string;
  place: string;
  doctor: {
    id: string;
    fullname: string;
    specialty: string;
    license: string;
    experience: number;
    email: string;
  };
  patient: {
    id: string;
    fullname: string;
    email: string;
  };
  completed: boolean;
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div *ngIf="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Cargando información...</p>
    </div>

    <div *ngIf="hasError" class="error-container">
      <h3>Error</h3>
      <p>{{ errorMessage }}</p>
      <button (click)="router.navigate(['/patient-dates'])">Volver al Dashboard</button>
    </div>

    <div *ngIf="isEvaluationSubmitted" class="success-container">
      <h3>¡Evaluación Enviada!</h3>
      <p>Gracias por tu evaluación. Te ayuda a otros pacientes a tomar mejores decisiones.</p>
      
      <div *ngIf="showDoctorEvaluations" class="doctor-evaluations-section">
        <h4>Otras evaluaciones de Dr. {{ doctorName }}</h4>
        <div class="evaluations-list">
          <div *ngFor="let eval of doctorEvaluations" class="evaluation-item">
            <div class="evaluation-header">
              <div class="rating-stars">
                <span *ngFor="let star of [1,2,3,4,5]" 
                      [class]="star <= eval.rating ? 'star filled' : 'star'">
                  ★
                </span>
                <span class="rating-text">({{ eval.rating }}/5)</span>
              </div>
              <span class="evaluation-date">{{ eval.date }}</span>
            </div>
            <p class="evaluation-comment">{{ eval.comment || eval.feedback }}</p>
            <p class="evaluation-patient">- {{ eval.patientName }}</p>
          </div>
        </div>
      </div>
      
      <p>Serás redirigido automáticamente...</p>
    </div>

    <div *ngIf="!isLoading && !hasError && !isEvaluationSubmitted" class="evaluation-container">
      <div class="evaluation-card">
        <h2>Evalúa a tu Doctor</h2>
        <p>¿Cómo fue tu cita con <strong>Dr. {{ doctorName }}</strong>?</p>
        <p class="help-text">Tu evaluación ayuda a otros pacientes a tomar decisiones informadas.</p>
        
        <div class="appointment-info" *ngIf="appointment">
          <p><strong>Fecha:</strong> {{ appointment.date }}</p>
          <p><strong>Hora:</strong> {{ appointment.time }}</p>
          <p><strong>Lugar:</strong> {{ appointment.place }}</p>
        </div>

        <div class="rating-buttons main-rating">
          <span *ngFor="let star of [1,2,3,4,5]">
            <button
              class="star"
              [class.selected]="star <= userRating"
              (click)="setUserRating(star)"
              type="button">
              ★
            </button>
          </span>
          <span class="user-rating-label" *ngIf="userRating > 0">({{userRating}} / 5)</span>
        </div>
        
        <textarea
          [(ngModel)]="feedback"
          placeholder="Cuéntanos sobre tu experiencia..."
          class="feedback-textarea"
        ></textarea>
        
        <button 
          (click)="submitFeedback()" 
          class="submit-btn"
          [disabled]="userRating === 0">
          Enviar Evaluación
        </button>
    
    </div>
  `,
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent implements OnInit {
  appointmentId: string | null = null;
  appointment: AppointmentForEvaluation | null = null;
  currentDoctor: any | null = null;
  patientId: string = '';
  
  feedback = '';
  userRating: number = 0;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  isEvaluationSubmitted = false;

  otherDoctors: Doctor[] = [];
  doctorEvaluations: any[] = [];
  showDoctorEvaluations = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    // Obtener appointmentId y patientId de los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.appointmentId = params['appointmentId'] || null;
      this.patientId = params['patientId'] || '';
      
      if (this.appointmentId && this.patientId) {
        this.loadAppointmentData();
      } else {
        this.hasError = true;
        this.errorMessage = 'Faltan parámetros requeridos (appointmentId y patientId)';
      }
    });
  
  }

  loadAppointmentData() {
    if (!this.appointmentId) return;
    
    this.isLoading = true;
    this.evaluationService.getAppointmentFromAppointments(this.appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        
        // Verificar si ya existe una evaluación para esta cita
        this.evaluationService.hasEvaluationForAppointment(this.appointmentId!).subscribe({
          next: (hasEvaluation) => {
            if (hasEvaluation) {
              this.hasError = true;
              this.errorMessage = 'Esta cita ya ha sido evaluada anteriormente';
              this.isLoading = false;
              return;
            }
            
            this.currentDoctor = appointment.doctor;
            this.isLoading = false;
          },
          error: (error) => {
            this.hasError = true;
            this.errorMessage = 'Error al verificar evaluación';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = 'Error al cargar información de la cita';
        this.isLoading = false;
      }
    });
  }


  setUserRating(rating: number) {
    this.userRating = rating;
  }

  submitFeedback() {
    if (!this.appointmentId || !this.appointment || !this.currentDoctor) {
      this.hasError = true;
      this.errorMessage = 'Faltan datos requeridos para enviar la evaluación';
      return;
    }

    // Validaciones de seguridad
    if (this.userRating === 0) {
      this.hasError = true;
      this.errorMessage = 'Por favor, selecciona una puntuación antes de enviar';
      return;
    }

    if (this.userRating < 1 || this.userRating > 5) {
      this.hasError = true;
      this.errorMessage = 'La puntuación debe estar entre 1 y 5';
      return;
    }

    // Validar longitud del comentario
    if (this.feedback.length > 1000) {
      this.hasError = true;
      this.errorMessage = 'El comentario no puede exceder 1000 caracteres';
      return;
    }

    // Sanitizar el feedback (eliminar scripts maliciosos básicos)
    const sanitizedFeedback = this.feedback
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();

    // Verificar que no contenga contenido inapropiado básico
    const inappropriateWords = ['script', 'eval(', 'alert(', 'document.', 'window.'];
    if (inappropriateWords.some(word => sanitizedFeedback.toLowerCase().includes(word))) {
      this.hasError = true;
      this.errorMessage = 'El comentario contiene contenido no permitido';
      return;
    }

    this.isLoading = true;
    
    const newRating: DoctorRating = {
      id: Date.now().toString(),
      appointmentId: this.appointmentId,
      patientId: this.patientId,
      doctorId: this.appointment.doctor.id,
      rating: this.userRating,
      comment: sanitizedFeedback,
      feedback: sanitizedFeedback,
      date: new Date().toISOString().split('T')[0],
      doctorName: this.appointment.doctor.fullname,
      patientName: this.appointment.patient?.fullname || 'Paciente'
    };

    // Crear la evaluación
    this.evaluationService.createEvaluation(newRating).subscribe({
      next: (evaluation) => {
        this.isEvaluationSubmitted = true;
        this.isLoading = false;
        
        // Cargar evaluaciones del médico para mostrarlas
        this.loadDoctorEvaluations();
        
        // Redirigir después de 5 segundos para dar tiempo a ver las evaluaciones
        setTimeout(() => {
          this.router.navigate(['/patients-dates-management-list']);
        }, 5000);
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = 'Error al enviar la evaluación';
        this.isLoading = false;
      }
    });
  }

  get doctorName(): string {
    return this.currentDoctor?.fullname || 'Doctor';
  }

  loadDoctorEvaluations() {
    if (!this.currentDoctor) return;
    
    this.evaluationService.getDoctorEvaluations(this.currentDoctor.id).subscribe({
      next: (evaluations) => {
        this.doctorEvaluations = evaluations;
        this.showDoctorEvaluations = true;
      },
      error: (error) => {
        console.error('Error al cargar evaluaciones del médico:', error);
      }
    });
  }
}
