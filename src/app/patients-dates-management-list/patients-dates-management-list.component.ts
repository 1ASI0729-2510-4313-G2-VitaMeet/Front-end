import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForOf, NgIf, CommonModule } from '@angular/common';
import { Appointment, PatientsDatesManagementService } from '../patients-dates-management/service/patients-dates-management.service';
import { ProfileService, Profile } from '../profile/services/profile.service';
import { EvaluationService } from '../evaluation/service/evaluation.service';

@Component({
  selector: 'app-patients-dates-management-list',
  templateUrl: './patients-dates-management-list.component.html',
  styleUrls: ['./patients-dates-management-list.component.css'],
  imports: [NgForOf, NgIf, CommonModule]
})
export class PatientsDatesManagementListComponent implements OnInit {
  appointments: Appointment[] = [];
  profile: Profile | null = null;
  evaluationsCache: { [appointmentId: string]: boolean } = {};

  constructor(
    private service: PatientsDatesManagementService,
    private router: Router,
    private profileService: ProfileService,
    private evaluationService: EvaluationService
  ) {}

  ngOnInit() {
    console.log('🔄 Iniciando PatientsDatesManagementListComponent...');
    
    // Verificar si hay datos en localStorage antes de continuar
    const storedProfile = localStorage.getItem('profile');
    console.log('📦 Profile en localStorage:', storedProfile);
    
    if (!storedProfile) {
      console.log('❌ No hay perfil en localStorage, redirigiendo al login');
      this.router.navigate(['/login']);
      return;
    }
    
    try {
      const parsedProfile = JSON.parse(storedProfile);
      console.log('👤 Perfil parseado:', parsedProfile);
      
      if (!parsedProfile.id) {
        console.log('❌ Perfil sin ID, redirigiendo al login');
        this.router.navigate(['/login']);
        return;
      }
      
      if (parsedProfile.role !== 'Paciente') {
        console.log('❌ Usuario no es paciente, redirigiendo');
        this.router.navigate(['/login']);
        return;
      }
    } catch (error) {
      console.error('❌ Error parsing profile, redirigiendo al login:', error);
      this.router.navigate(['/login']);
      return;
    }

    // Primero obtener el perfil del usuario actual
    this.profileService.getCurrentProfile().subscribe(profile => {
      this.profile = profile;
      console.log('Perfil del usuario actual:', profile);
      
      // Solo cargar citas después de tener el perfil
      if (profile) {
        this.loadUserAppointments();
        
        // Configurar auto-refresh cada 30 segundos
        this.setupAutoRefresh();
        
        // Refrescar cuando la ventana vuelva a tener foco
        this.setupFocusRefresh();
      } else {
        console.log('❌ ProfileService retornó null, redirigiendo al login');
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Configurar refresh automático cada 30 segundos
   */
  private setupAutoRefresh() {
    setInterval(() => {
      console.log('🔄 Auto-refresh de citas...');
      this.loadUserAppointments();
    }, 30000); // 30 segundos
  }

  /**
   * Configurar refresh cuando la ventana vuelva a tener foco
   */
  private setupFocusRefresh() {
    window.addEventListener('focus', () => {
      console.log('🔄 Ventana en foco - refrescando citas...');
      this.loadUserAppointments();
    });
  }

  loadUserAppointments() {
    console.log('🔄 Iniciando carga de citas del paciente...');
    
    // Debug: verificar datos del perfil
    this.service.debugProfileData();
    
    // Primero hacer test simple - usar el método específico para pacientes
    this.service.getSimpleAppointmentTestForPatient().subscribe();
    
    // Luego hacer la carga normal
    this.service.getPatientAppointments().subscribe({
      next: (data) => {
        console.log('✅ Citas cargadas para el usuario:', data);
        console.log('📊 Cantidad de citas:', data?.length || 0);
        if (data && data.length > 0) {
          console.log('📋 Estructura de la primera cita:', data[0]);
        }
        
        // Normalizar para que todos los doctores tengan 'fullname' y manejar casos undefined
        this.appointments = data.map(app => {
          console.log('Procesando cita:', app);
          console.log('Doctor en la cita:', app.doctor);
          
          return {
            ...app,
          doctor: app.doctor ? {
            ...app.doctor,
            fullname: app.doctor.fullname || 'Doctor no especificado'
          } : {
            id: '',
            fullname: 'Doctor no especificado',
            specialty: ''
          }
        };
      }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      
      // Cargar cache de evaluaciones
      this.loadEvaluationsCache();
    },
    error: (err) => {
      console.error('❌ Error al cargar citas del paciente:', err);
      console.error('📋 Status:', err.status);
      console.error('📄 Body:', err.error);
      console.error('🌐 URL:', err.url);
      this.appointments = [];
    }
    });
  }

  loadEvaluationsCache() {
    this.evaluationsCache = {};
    this.appointments.forEach(appointment => {
      if (appointment.id) {
        this.evaluationService.hasEvaluationForAppointment(appointment.id).subscribe(hasEvaluation => {
          this.evaluationsCache[appointment.id!] = hasEvaluation;
        });
      }
    });
  }

  hasEvaluation(appointmentId: string): boolean {
    return this.evaluationsCache[appointmentId] || false;
  }

  evaluateAppointment(appointmentId: string) {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (appointment && this.profile) {
      this.router.navigate(['/evaluation'], {
        queryParams: {
          appointmentId: appointmentId,
          patientId: this.profile.id
        }
      });
    }
  }

  viewEvaluation(appointmentId: string) {
    this.evaluationService.getEvaluationByAppointmentId(appointmentId).subscribe(evaluation => {
      if (evaluation) {
        // Mostrar la evaluación en un modal o navegar a una página de detalles
        alert(`Evaluación: ${evaluation.rating}/5 estrellas\nComentario: ${evaluation.feedback}`);
      }
    });
  }

  /**
   * Marcar una cita como completada
   */
  markAsCompleted(appointmentId: string) {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (!appointment) {
      console.error('Cita no encontrada');
      return;
    }

    console.log('📋 Cita ANTES de completar:', appointment);
    console.log('📋 Estado completed ANTES:', appointment.completed);

    // Confirmar antes de marcar como completada
    if (confirm('¿Está seguro de que desea marcar esta cita como completada?')) {
      const updatedAppointment = { ...appointment, completed: true };
      
      console.log('🔄 Cita con completed=true:', updatedAppointment);
      
      this.service.updateAppointment(updatedAppointment).subscribe({
        next: (response) => {
          console.log('✅ Respuesta del backend:', response);
          console.log('📊 Tipo de respuesta:', typeof response);
          console.log('📊 Claves de respuesta:', response ? Object.keys(response) : 'No hay claves');
          
          // Buscar el índice de la cita
          const index = this.appointments.findIndex(app => app.id === appointmentId);
          console.log('📍 Índice encontrado:', index);
          
          if (index !== -1) {
            // Actualizar con los datos de la respuesta si están disponibles
            if (response && typeof response === 'object') {
              // Si el backend devuelve la cita actualizada, usarla
              const backendAppointment = response as any;
              
              this.appointments[index] = {
                ...this.appointments[index],
                completed: true, // Forzar a true independientemente de lo que devuelva el backend
                // Si el backend devuelve status, mapear a completed
                ...(backendAppointment.status === 'COMPLETADA' && { completed: true })
              };
            } else {
              // Si no hay respuesta útil, solo actualizar completed
              this.appointments[index] = { 
                ...this.appointments[index], 
                completed: true 
              };
            }
            
            console.log('🔄 Cita local DESPUÉS de actualizar:', this.appointments[index]);
            console.log('📋 Estado completed DESPUÉS:', this.appointments[index].completed);
          }
          
          // Forzar detección de cambios para Angular
          this.appointments = [...this.appointments];
          
          // Recargar el cache de evaluaciones después de un pequeño delay
          setTimeout(() => {
            console.log('🔄 Recargando cache de evaluaciones...');
            this.loadEvaluationsCache();
          }, 500);
          
          alert('✅ Cita marcada como completada. Ahora puede evaluarla.');
        },
        error: (error) => {
          console.error('❌ Error al marcar cita como completada:', error);
          
          // Mostrar error específico
          let errorMessage = 'Error al marcar la cita como completada.';
          if (error.message) {
            errorMessage += ` Detalle: ${error.message}`;
          }
          
          alert(errorMessage + ' Por favor intente nuevamente.');
        }
      });
    }
  }

  /**
   * Cancelar una cita (eliminarla)
   */
  cancelAppointment(appointmentId: string) {
    const appointment = this.appointments.find(app => app.id === appointmentId);
    if (!appointment) {
      console.error('Cita no encontrada');
      return;
    }

    // Confirmar antes de cancelar
    if (confirm('¿Está seguro de que desea cancelar esta cita? Esta acción no se puede deshacer.')) {
      console.log('🗑️ Cancelando cita:', appointment);
      
      this.service.deleteAppointment(appointmentId).subscribe({
        next: (response) => {
          console.log('✅ Cita cancelada exitosamente:', response);
          
          // Remover la cita de la lista local
          this.appointments = this.appointments.filter(app => app.id !== appointmentId);
          
          alert('✅ Cita cancelada exitosamente.');
        },
        error: (error) => {
          console.error('❌ Error al cancelar cita:', error);
          
          let errorMessage = 'Error al cancelar la cita.';
          if (error.message) {
            errorMessage += ` Detalle: ${error.message}`;
          }
          
          alert(errorMessage + ' Por favor intente nuevamente.');
        }
      });
    }
  }

  /**
   * Verificar si una cita puede ser marcada como completada
   * Solo se puede completar si la fecha/hora ya pasó
   */
  canMarkAsCompleted(appointment: Appointment): boolean {
    if (appointment.completed) {
      return false; // Ya está completada
    }

    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    
    // Solo se puede marcar como completada si ya pasó la fecha/hora de la cita
    return appointmentDateTime <= now;
  }

  nuevaCita() {
    this.router.navigate(['/patients-dates-management']);
  }

  editarPerfil() {
    this.router.navigate(['/profile']);
  }
  
  backToDashboard() {
    // Ya estamos en la página principal del paciente, pero vamos a refrescar los datos
    this.loadUserAppointments();
  }
  
  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  /**
   * Método de prueba para verificar si una cita específica está completada
   */
  testAppointmentStatus(appointmentId: string) {
    console.log('🧪 Verificando estado de cita:', appointmentId);
    
    this.service.getPatientAppointments().subscribe({
      next: (appointments) => {
        console.log('📋 Todas las citas del paciente:', appointments);
        
        const targetAppointment = appointments.find(app => app.id === appointmentId);
        if (targetAppointment) {
          console.log('🎯 Cita específica encontrada:', targetAppointment);
          console.log('✅ Estado completed:', targetAppointment.completed);
          console.log('📊 Estructura completa:', JSON.stringify(targetAppointment, null, 2));
        } else {
          console.log('❌ Cita no encontrada');
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo citas:', error);
      }
    });
  }

  /**
   * Método para forzar una cita como completada localmente (solo para pruebas)
   */
  forceCompleteAppointment(appointmentId: string) {
    const index = this.appointments.findIndex(app => app.id === appointmentId);
    if (index !== -1) {
      console.log('🔧 Forzando cita como completada localmente:', appointmentId);
      this.appointments[index] = { ...this.appointments[index], completed: true };
      this.appointments = [...this.appointments]; // Forzar detección de cambios
      console.log('✅ Cita forzada como completada:', this.appointments[index]);
    }
  }

  /**
   * Refrescar la lista de citas
   */
  refreshAppointments() {
    console.log('🔄 Refrescando lista de citas manualmente...');
    
    // Mostrar feedback visual temporal
    const refreshBtn = document.querySelector('.refresh-btn') as HTMLElement;
    if (refreshBtn) {
      refreshBtn.style.opacity = '0.5';
      refreshBtn.style.transform = 'rotate(180deg)';
      
      setTimeout(() => {
        refreshBtn.style.opacity = '1';
        refreshBtn.style.transform = 'rotate(0deg)';
      }, 500);
    }
    
    this.loadUserAppointments();
  }
}
