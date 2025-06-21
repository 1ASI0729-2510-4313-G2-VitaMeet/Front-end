import { Component, OnInit } from '@angular/core';
import { PatientHistoryService } from './service/patient-history.service';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';
import { Profile } from '../profile/services/profile.service';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
  imports: [
    NgForOf,
    RouterLink
  ]
})
export class PatientHistoryComponent implements OnInit {
  patients: Profile[] = [];

  constructor(private patientHistoryService: PatientHistoryService) {}

  ngOnInit() {
    this.loadPatientHistory();
  }

  loadPatientHistory() {
    this.patientHistoryService.getPatientHistory().subscribe({
      next: (data) => {
        // Filtra solo pacientes
        this.patients = data.filter(p => p.role === 'Paciente');
      },
      error: (err) => console.error('Error al cargar el historial de pacientes:', err),
    });
  }
}
