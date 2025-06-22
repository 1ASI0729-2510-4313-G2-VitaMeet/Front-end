import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { Appointment, PatientsDatesManagementService } from '../patients-dates-management/service/patients-dates-management.service';
import { ProfileService, Profile } from '../profile/services/profile.service';

interface Doctor {
  id: number;
  fullname: string;
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
  doctors: Profile[] = [];
  selectedDoctor: Profile | null = null;
  place = 'VitaMeet Clinic';
  minDate: string;
  step = 1;

  constructor(
    private router: Router,
    private patientsDatesManagementService: PatientsDatesManagementService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    // Cargar médicos desde la nueva API de doctors
    this.patientsDatesManagementService.getDoctors().subscribe((docs) => {
      this.doctors = docs;
    });
  }

  selectDoctor(doctor: Profile) {
    this.selectedDoctor = doctor;
  }

  confirmarCita() {
    if (!this.selectedDate || !this.selectedTime || !this.selectedDoctor) return;
    // Guardar todos los datos del médico seleccionado en la cita
    const appointment: Appointment = {
      date: this.selectedDate!,
      time: this.selectedTime!,
      doctor: {
        id: this.selectedDoctor.id,
        fullname: this.selectedDoctor.fullname,
        specialty: this.selectedDoctor.specialty || '',
        license: this.selectedDoctor.license || '',
        experience: this.selectedDoctor.experience || 0,
        email: this.selectedDoctor.email || ''
      },
      place: this.place
    } as any;
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

  irAListaCitas() {
    this.router.navigate(['/patients-dates-management-list']);
  }
}
