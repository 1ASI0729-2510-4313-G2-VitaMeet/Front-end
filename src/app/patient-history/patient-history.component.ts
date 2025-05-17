import { Component, OnInit } from '@angular/core';
import { PatientHistoryService } from './service/patient-history.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
  imports: [
    NgForOf
  ]
})
export class PatientHistoryComponent implements OnInit {
  medicalHistory: {
    name: string;
    age: number;
    phone: string;
    address: string;
    diagnosis: string;
    treatment: string;
    date: string;
  }[] = [];

  constructor(private patientHistoryService: PatientHistoryService) {}

  ngOnInit() {
    this.loadMedicalHistory();
  }

  loadMedicalHistory() {
    this.patientHistoryService.getMedicalHistory().subscribe({
      next: (data) => (this.medicalHistory = data),
      error: (err) => console.error('Error al cargar el historial médico:', err),
    });
  }
}
