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

      <div class="other-doctors-section">
        <h3>Otros Doctores</h3>
        <div class="doctors-list">
          <div class="doctor-card" *ngFor="let doctor of otherDoctors">
            <img [src]="doctor.imageUrl" alt="{{doctor.name}}" class="doctor-image" />
            <div class="doctor-info">
              <h4>{{doctor.name}}</h4>
              <p class="specialty">{{doctor.specialty}}</p>
              <p class="evaluations">Evaluaciones: {{doctor.evaluations}}</p>
              <p class="description">{{doctor.description}}</p>
              <div class="rating-buttons static-rating">
                <ng-container *ngFor="let star of [1,2,3,4,5]">
                  <span
                    class="star"
                    [class.selected]="star <= doctor.staticRating">
                    ★
                  </span>
                </ng-container>
              </div>
              <button class="comments-btn">
                💬 Comentarios ({{doctor.comments}})
              </button>
            </div>
          </div>
        </div>
      </div>
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
    
    this.loadOtherDoctors();
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

  loadOtherDoctors() {
    this.evaluationService.getAllDoctors().subscribe({
      next: (doctors) => {
        // Transformar los datos para mostrar
        const doctorPromises = doctors.map(doctor => 
          new Promise<Doctor>((resolve) => {
            this.evaluationService.getDoctorEvaluations(doctor.id).subscribe({
              next: (evaluations) => {
                const avgRating = evaluations.length > 0 
                  ? evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0) / evaluations.length 
                  : 0;
                
                resolve({
                  id: doctor.id,
                  name: doctor.fullname,
                  specialty: doctor.specialty,
                  imageUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99) + 1}.jpg`,
                  evaluations: evaluations.length,
                  description: `${doctor.specialty} con ${doctor.experience} años de experiencia`,
                  comments: evaluations.length,
                  staticRating: Math.round(avgRating)
                });
              },
              error: () => {
                resolve({
                  id: doctor.id,
                  name: doctor.fullname,
                  specialty: doctor.specialty,
                  imageUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99) + 1}.jpg`,
                  evaluations: 0,
                  description: `${doctor.specialty} con ${doctor.experience} años de experiencia`,
                  comments: 0,
                  staticRating: 0
                });
              }
            });
          })
        );

        Promise.all(doctorPromises).then(doctorDisplays => {
          this.otherDoctors = doctorDisplays;
        });
      },
      error: (error) => {
        console.error('Error al cargar otros doctores:', error);
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

    if (this.userRating === 0) {
      this.hasError = true;
      this.errorMessage = 'Por favor, selecciona una puntuación antes de enviar';
      return;
    }

    this.isLoading = true;
    
    const newRating: DoctorRating = {
      id: Date.now().toString(),
      appointmentId: this.appointmentId,
      patientId: this.patientId,
      doctorId: this.appointment.doctor.id,
      rating: this.userRating,
      comment: this.feedback,
      feedback: this.feedback,
      date: new Date().toISOString().split('T')[0],
      doctorName: this.appointment.doctor.fullname,
      patientName: this.appointment.patient?.fullname || 'Paciente'
    };

    // Crear la evaluación
    this.evaluationService.createEvaluation(newRating).subscribe({
      next: (evaluation) => {
        this.isEvaluationSubmitted = true;
        this.isLoading = false;
        
        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/patients-dates-management-list']);
        }, 3000);
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
}
