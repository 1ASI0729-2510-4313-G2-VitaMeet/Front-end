import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DoctorRating } from './models/doctor-rating.model';

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

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="evaluation-card">
      <h2>Rate Your Doctor</h2>
      <p>How was your visit with <strong>Dr. {{ doctorName }}</strong>?</p>
      <p class="help-text">Your feedback helps other patients make informed decisions.</p>
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
        placeholder="Tell us about your experience..."
      ></textarea>
      <button (click)="submitFeedback()">Send</button>
    </div>

    <div class="other-doctors-section">
      <h3>Other Doctors</h3>
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
  `,
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent {
  doctorName = 'Smith';
  feedback = '';
  userRating: number = 0;

  otherDoctors: Doctor[] = [
    {
      id: '201',
      name: 'Dr. Juan Torres',
      specialty: 'Cardiólogo',
      imageUrl: 'https://randomuser.me/api/portraits/men/31.jpg',
      evaluations: 34,
      description: 'Especialista en cardiología con más de 20 años de experiencia.',
      comments: 14,
      staticRating: 5
    },
    {
      id: '202',
      name: 'Dr. Mariana López',
      specialty: 'Dermatóloga',
      imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      evaluations: 21,
      description: 'Experta en el tratamiento de enfermedades de la piel.',
      comments: 9,
      staticRating: 5
    },
    {
      id: '203',
      name: 'Dr. Pablo Méndez',
      specialty: 'Pediatra',
      imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      evaluations: 40,
      description: 'Pediatra apasionado por la salud y el bienestar infantil.',
      comments: 18,
      staticRating: 3
    },
    {
      id: '204',
      name: 'Dr. Laura Sánchez',
      specialty: 'Neuróloga',
      imageUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      evaluations: 29,
      description: 'Atención integral en enfermedades neurológicas.',
      comments: 11,
      staticRating: 3
    },
    {
      id: '205',
      name: 'Dr. Ricardo Fernández',
      specialty: 'Traumatólogo',
      imageUrl: 'https://randomuser.me/api/portraits/men/33.jpg',
      evaluations: 17,
      description: 'Amplia experiencia en traumatología y recuperación de lesiones.',
      comments: 7,
      staticRating: 4
    },
    {
      id: '206',
      name: 'Dra. Camila Rivas',
      specialty: 'Ginecóloga',
      imageUrl: 'https://randomuser.me/api/portraits/women/69.jpg',
      evaluations: 25,
      description: 'Ginecóloga enfocada en el bienestar integral de la mujer.',
      comments: 13,
      staticRating: 3
    }
  ];

  setUserRating(rating: number) {
    this.userRating = rating;
  }

  submitFeedback() {
    const newRating: DoctorRating = {
      doctorId: '123',
      rating: this.userRating || 5,
      feedback: this.feedback,
      createdAt: new Date().toISOString()
    };
    alert('Thank you for your feedback!\n\n' + JSON.stringify(newRating, null, 2));
  }
}
