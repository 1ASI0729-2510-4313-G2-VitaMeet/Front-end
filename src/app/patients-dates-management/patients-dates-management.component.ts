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
    private patientsDatesManagementService: PatientsDatesManagementService,
    private profileService: ProfileService
  ) {
    console.log('Inicializando PatientsDatesManagementComponent');
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    // Cargar médicos desde la nueva API de doctors
    this.patientsDatesManagementService.getDoctors().subscribe((docs) => {
      console.log('Médicos cargados:', docs);
      this.doctors = docs;
    });
  }

  selectDoctor(doctor: Profile) {
    this.selectedDoctor = doctor;
  }

  confirmarCita() {
    console.log('Confirmando cita...');
    console.log('Fecha:', this.selectedDate);
    console.log('Hora:', this.selectedTime);
    console.log('Doctor:', this.selectedDoctor);
    
    if (!this.selectedDate || !this.selectedTime || !this.selectedDoctor) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }
    
    // Obtener información del paciente actual
    this.profileService.getCurrentProfile().subscribe(currentPatient => {
      if (!currentPatient) {
        alert('Error: No se pudo obtener información del paciente.');
        return;
      }

      console.log('Paciente actual:', currentPatient);
      
      // Validar que el doctor y el paciente no sean la misma persona
      if (currentPatient.id === this.selectedDoctor!.id) {
        alert('No puedes agendar una cita contigo mismo.');
        return;
      }
      
      // Validar que el usuario actual sea un paciente
      if (currentPatient.role !== 'Paciente') {
        alert('Solo los pacientes pueden agendar citas.');
        return;
      }

      const appointment: Appointment = {
        date: this.selectedDate!,
        time: this.selectedTime!,
        doctor: {
          id: this.selectedDoctor!.id,
          fullname: this.selectedDoctor!.fullname,
          specialty: this.selectedDoctor!.specialty || '',
        },
        patient: {
          id: currentPatient.id,
          fullname: currentPatient.fullname,
          email: currentPatient.email
        },
        place: this.place,
        completed: false
      };

      console.log('Validando reglas de negocio para la cita:', appointment);

      // Validar reglas de negocio antes de crear la cita
      this.patientsDatesManagementService.validateAppointmentBusinessRules(appointment).subscribe({
        next: (validationError) => {
          if (validationError) {
            alert(`Error de validación: ${validationError}`);
            return;
          }

          // Si todas las validaciones pasan, crear la cita
          console.log('Creando cita:', appointment);
          this.patientsDatesManagementService.addAppointment(appointment).subscribe({
            next: (response) => {
              console.log('Cita creada exitosamente:', response);
              this.router.navigate(['/patients-dates-management-list']);
            },
            error: (error) => {
              console.error('Error al crear cita:', error);
              if (error.message && error.message.includes('Ya existe una cita')) {
                alert('Ya existe una cita con estos datos. Por favor seleccione otra fecha u hora.');
              } else {
                alert('Error al crear la cita. Por favor intente nuevamente.');
              }
            }
          });
        },
        error: (error) => {
          console.error('Error al validar cita:', error);
          alert('Error al validar la cita. Por favor intente nuevamente.');
        }
      });
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
