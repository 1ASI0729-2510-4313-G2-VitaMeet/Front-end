import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { Appointment, PatientsDatesManagementService } from '../patients-dates-management/service/patients-dates-management.service';
import { ProfileService, Profile } from '../profile/services/profile.service';

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
    NgForOf,
    NgIf,
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
  step = 1;

  constructor(
    private router: Router,
    private patientsDatesManagementService: PatientsDatesManagementService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  get filteredDoctors(): Doctor[] {
    return this.doctors.filter(d =>
      d.name.toLowerCase().includes(this.search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  selectDoctor(doctor: Doctor) {
    this.selectedDoctor = doctor;
  }

  confirmarCita() {
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

  cancel() {
    this.router.navigate(['/patients-dates-management-list']);
  }
   editarPerfil() {
    this.router.navigate(['/profile']);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
