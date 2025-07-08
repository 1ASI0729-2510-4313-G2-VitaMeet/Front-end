import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EvaluationService, Appointment, Doctor } from '../evaluation/service/evaluation.service';

@Component({
  selector: 'app-pending-evaluations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pending-evaluations-container">
      <h2>Citas Pendientes de Evaluación</h2>
      
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando citas...</p>
      </div>

      <div *ngIf="!isLoading && pendingAppointments.length === 0" class="no-appointments">
        <p>No tienes citas pendientes de evaluación.</p>
      </div>

      <div *ngIf="!isLoading && pendingAppointments.length > 0" class="appointments-list">
        <div class="appointment-card" *ngFor="let appointment of pendingAppointments">
          <div class="appointment-info">
            <h3>Dr. {{ getDoctorName(appointment.doctorId) }}</h3>
            <p><strong>Fecha:</strong> {{ appointment.date }}</p>
            <p><strong>Hora:</strong> {{ appointment.time }}</p>
            <p><strong>Motivo:</strong> {{ appointment.reason }}</p>
            <p><strong>Estado:</strong> {{ appointment.status }}</p>
          </div>
          <div class="appointment-actions">
            <button 
              class="evaluate-btn" 
              (click)="evaluateAppointment(appointment)">
              Evaluar Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-evaluations-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .pending-evaluations-container h2 {
      color: #2c3e50;
      margin-bottom: 20px;
      text-align: center;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading-spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-appointments {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 18px;
    }

    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .appointment-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .appointment-info h3 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .appointment-info p {
      margin: 5px 0;
      color: #666;
    }

    .appointment-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .evaluate-btn {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .evaluate-btn:hover {
      background-color: #218838;
    }

    @media (max-width: 768px) {
      .appointment-card {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }
    }
  `]
})
export class PendingEvaluationsComponent implements OnInit {
  pendingAppointments: Appointment[] = [];
  doctors: { [key: string]: Doctor } = {};
  isLoading = false;
  patientId: string = '';

  constructor(
    private router: Router,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    // Obtener patientId del localStorage o parámetros
    this.patientId = localStorage.getItem('userId') || '';
    
    if (this.patientId) {
      this.loadPendingAppointments();
    }
  }

  loadPendingAppointments() {
    this.isLoading = true;
    
    this.evaluationService.getCompletedUnevaluatedAppointments(this.patientId).subscribe({
      next: (appointments) => {
        this.pendingAppointments = appointments;
        this.loadDoctorsInfo();
      },
      error: (error) => {
        console.error('Error loading pending appointments:', error);
        this.isLoading = false;
      }
    });
  }

  loadDoctorsInfo() {
    const doctorIds = [...new Set(this.pendingAppointments.map(app => app.doctorId))];
    
    const doctorPromises = doctorIds.map(doctorId => 
      this.evaluationService.getDoctor(doctorId).toPromise()
    );

    Promise.all(doctorPromises).then(doctors => {
      doctors.forEach(doctor => {
        if (doctor) {
          this.doctors[doctor.id] = doctor;
        }
      });
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading doctors info:', error);
      this.isLoading = false;
    });
  }

  getDoctorName(doctorId: string): string {
    return this.doctors[doctorId]?.fullname || 'Doctor';
  }

  evaluateAppointment(appointment: Appointment) {
    // Navegar al componente de evaluación con los parámetros necesarios
    this.router.navigate(['/evaluation'], {
      queryParams: {
        appointmentId: appointment.id,
        patientId: this.patientId
      }
    });
  }
}
