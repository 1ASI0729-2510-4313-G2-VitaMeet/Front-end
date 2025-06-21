import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, PatientsDatesManagementService } from './service/patients-dates-management.service';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

@Component({
  selector: 'app-patients-dates-management',
  templateUrl: './patients-dates-management.component.html',
  styleUrls: ['./patients-dates-management.component.css'],
  imports: [
    FormsModule,
    NgForOf
  ],
  providers: [PatientsDatesManagementService]
})
export class PatientsDatesManagementComponent {
  selectedDate: string | null = null;
  times = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  selectedTime: string | null = null;
  doctors: Doctor[] = [
    { id: 1, name: 'Dr. Ana López', specialty: 'Cardiología' },
    { id: 2, name: 'Dr. Juan Pérez', specialty: 'Dermatología' },
    { id: 3, name: 'Dr. María García', specialty: 'Pediatría' }
  ];
  search = '';
  selectedDoctor: Doctor | null = null;
  place = 'VitaMeet Clinic';
  minDate: string;

  constructor(
    private router: Router,
    private patientsDatesManagementService: PatientsDatesManagementService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  get filteredDoctors() {
    return this.doctors.filter(d =>
      d.name.toLowerCase().includes(this.search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  selectDoctor(doctor: Doctor) {
    this.selectedDoctor = doctor;
  }

  cancel() {
    this.router.navigate(['/patients-dates-management-list']);
  }

  confirm() {
    if (!this.selectedDate || !this.selectedTime || !this.selectedDoctor) return;
    const appointment: Appointment = {
      date: this.selectedDate!,
      time: this.selectedTime!,
      doctor: this.selectedDoctor!,
      place: this.place
    };
    this.patientsDatesManagementService.addAppointment(appointment).subscribe(() => {
      this.router.navigate(['/patients-dates-management-list']);
    });
  }
}
