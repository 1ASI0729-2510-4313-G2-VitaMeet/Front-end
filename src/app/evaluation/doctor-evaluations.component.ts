import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EvaluationService } from '../evaluation/service/evaluation.service';
import { DoctorRating } from '../evaluation/models/doctor-rating.model';

@Component({
  selector: 'app-doctor-evaluations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doctor-evaluations-container">
      <h2>Mis Evaluaciones</h2>
      
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando evaluaciones...</p>
      </div>

      <div *ngIf="!isLoading && evaluations.length === 0" class="no-evaluations">
        <p>No tienes evaluaciones aún.</p>
      </div>

      <div *ngIf="!isLoading && evaluations.length > 0" class="evaluations-content">
        <div class="stats-summary">
          <div class="stat">
            <h3>{{ averageRating.toFixed(1) }}</h3>
            <p>Rating Promedio</p>
          </div>
          <div class="stat">
            <h3>{{ evaluations.length }}</h3>
            <p>Total Evaluaciones</p>
          </div>
          <div class="stat">
            <h3>{{ ratingDistribution[5] || 0 }}</h3>
            <p>5 Estrellas</p>
          </div>
        </div>

        <div class="rating-distribution">
          <h3>Distribución de Ratings</h3>
          <div class="rating-bars">
            <div *ngFor="let rating of [5,4,3,2,1]" class="rating-bar">
              <span class="rating-label">{{ rating }} ★</span>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getRatingPercentage(rating)"></div>
              </div>
              <span class="rating-count">{{ ratingDistribution[rating] || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="evaluations-list">
          <h3>Comentarios Recientes</h3>
          <div class="evaluation-card" *ngFor="let evaluation of evaluations">
            <div class="evaluation-header">
              <div class="rating-stars">
                <span *ngFor="let star of [1,2,3,4,5]" 
                      class="star" 
                      [class.selected]="star <= evaluation.rating">
                  ★
                </span>
              </div>
              <span class="evaluation-date">{{ formatDate(evaluation.createdAt) }}</span>
            </div>
            <p class="evaluation-feedback" *ngIf="evaluation.feedback">
              "{{ evaluation.feedback }}"
            </p>
            <p class="evaluation-feedback" *ngIf="!evaluation.feedback">
              <em>Sin comentarios adicionales</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./doctor-evaluations.component.css']
})
export class DoctorEvaluationsComponent implements OnInit {
  evaluations: DoctorRating[] = [];
  isLoading = false;
  averageRating = 0;
  ratingDistribution: { [key: number]: number } = {};
  doctorId: string = '';

  constructor(
    private route: ActivatedRoute,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    // Obtener doctorId de los parámetros de la ruta o del localStorage
    this.doctorId = this.route.snapshot.params['doctorId'] || localStorage.getItem('userId') || '';
    
    if (this.doctorId) {
      this.loadEvaluations();
    }
  }

  loadEvaluations() {
    this.isLoading = true;
    this.evaluationService.getDoctorEvaluations(this.doctorId).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats() {
    if (this.evaluations.length === 0) return;

    // Calcular rating promedio
    const total = this.evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0);
    this.averageRating = total / this.evaluations.length;

    // Calcular distribución de ratings
    this.ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      this.ratingDistribution[i] = this.evaluations.filter(evaluation => evaluation.rating === i).length;
    }
  }

  getRatingPercentage(rating: number): number {
    if (this.evaluations.length === 0) return 0;
    return ((this.ratingDistribution[rating] || 0) / this.evaluations.length) * 100;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
