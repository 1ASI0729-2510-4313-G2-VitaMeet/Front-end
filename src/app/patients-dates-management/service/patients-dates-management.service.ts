import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Profile, ProfileService } from '../../profile/services/profile.service';
import { ConfigService } from '../../shared/config.service';

export interface Appointment {
  id?: string;
  date: string;
  time: string;
  doctor: {
    id: string;
    fullname: string;
    specialty: string;
  };
  patient?: {
    id: string;
    fullname: string;
    email: string;
  };
  place: string;
  completed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PatientsDatesManagementService {

  constructor(
    private http: HttpClient, 
    private config: ConfigService,
    private profileService: ProfileService
  ) {}

  getPatientFullName(): string | null {
    const profile = this.profileService.getCurrentProfileSync();
    return profile?.fullname || null;
  }

  getPatientId(): Observable<string | null> {
    return this.profileService.getCurrentProfile().pipe(
      map(profile => {
        console.log('🔍 Obteniendo ID del paciente desde ProfileService...');
        console.log('👤 Profile:', profile);
        
        if (profile?.id) {
          const id = profile.id.toString();
          console.log('🔢 ID final (como string):', id);
          return id;
        } else {
          console.log('❌ No profile found or no ID');
          return null;
        }
      })
    );
  }

  getAppointments(): Observable<Appointment[]> {
    console.log('Obteniendo citas desde el servicio...');
    return this.http.get<Appointment[]>(`${this.config.getAppointmentsUrl()}`).pipe(
      map((appointments: Appointment[]) => {
        console.log('Citas obtenidas:', appointments);
        return appointments;
      })
    );
  }

  getDoctors(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.config.getDoctorsUrl()}`);
  }

  getPatients(): Observable<Profile[]> {
    if (this.config.isUsingBackend()) {
      // Backend no soporta GET all patients, retornar array vacío
      console.warn('⚠️ Backend no soporta listar todos los pacientes. Use getPatientById() en su lugar.');
      return of([]);
    } else {
      // JSON Server sí soporta GET all patients
      return this.http.get<Profile[]>(`${this.config.getPatientsUrl()}`);
    }
  }

  /**
   * Obtener un paciente específico por ID (compatible con backend)
   */
  getPatientById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.config.getPatientByIdUrl(id)}`);
  }

  addAppointment(appointment: Appointment): Observable<Appointment> {
    console.log('🔥 Creando cita - Backend activo:', this.config.isUsingBackend());
    console.log('📄 Cita a crear:', appointment);
    
    if (this.config.isUsingBackend()) {
      // Esperar el ID del paciente antes de crear la cita
      return this.getPatientId().pipe(
        switchMap(patientId => {
          const backendAppointment = {
            patientId: parseInt(patientId || '0'),
            doctorId: parseInt(appointment.doctor.id),
            appointmentDate: appointment.date,  // yyyy-MM-dd
            appointmentTime: appointment.time,  // HH:mm
            reason: appointment.place || 'Cita médica'  // El backend espera 'reason' en lugar de 'place'
          };
          
          console.log('🚀 Payload para backend:', backendAppointment);
          console.log('🌐 URL destino:', this.config.getAppointmentsUrl());
          
          // Intentar crear en el backend, con fallbacks a endpoints alternativos
          return this.http.post<Appointment>(this.config.getAppointmentsUrl(), backendAppointment, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).pipe(
            tap(response => console.log('✅ Cita creada:', response)),
            catchError(error => {
              console.error('❌ Error al crear cita con endpoint principal:', error);
              console.error('📋 Status:', error.status);
              console.error('📄 Body:', error.error);
              
              if (error.status === 404) {
                // El endpoint principal no existe, intentar endpoints alternativos
                console.log('🔄 Intentando endpoints alternativos...');
                return this.tryAlternativeAppointmentEndpoints(backendAppointment);
              } else if (error.status === 400) {
                // Bad request - distinguir entre error de validación de negocio y error de datos
                const errorMessage = error.error?.error || error.error?.message || error.error;
                
                // Si es un error de validación de negocio (horario ocupado, etc.), usar el mensaje del backend
                if (typeof errorMessage === 'string' && (
                    errorMessage.includes('horario') || 
                    errorMessage.includes('ocupado') || 
                    errorMessage.includes('disponible') ||
                    errorMessage.includes('conflicto')
                  )) {
                  throw new Error(errorMessage);
                } else {
                  // Error de datos enviados
                  throw new Error(`Error en los datos de la cita: ${errorMessage}`);
                }
              } else {
                throw new Error('Error del servidor al crear la cita. Por favor intente nuevamente.');
              }
            })
          );
        })
      );
    } else {
      // JSON Server - generar ID y mantener estructura
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      const appointmentWithId = { ...appointment, id: uniqueId };
      
      // Verificar duplicados antes de crear la cita
      return this.checkAppointmentConflicts(appointmentWithId).pipe(
        switchMap((hasConflict: boolean) => {
          if (hasConflict) {
            throw new Error('Ya existe una cita con los mismos datos');
          }
          
          console.log('Creando nueva cita con ID:', uniqueId);
          return this.http.post<Appointment>(`${this.config.getAppointmentsUrl()}`, appointmentWithId);
        })
      );
    }
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.getAppointmentsUrl()}/${id}`);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    console.log('🔥 Actualizando cita - Backend activo:', this.config.isUsingBackend());
    console.log('📄 Cita a actualizar:', appointment);
    
    if (this.config.isUsingBackend()) {
      // Backend real - enviar todos los campos necesarios
      return this.getPatientId().pipe(
        switchMap(patientId => {
          const backendUpdate = {
            patientId: parseInt(patientId || '0'),
            doctorId: parseInt(appointment.doctor.id),
            appointmentDate: appointment.date,
            appointmentTime: appointment.time,
            reason: appointment.place || 'Consulta médica',
            status: appointment.completed ? 'COMPLETADA' : 'PROGRAMADA'
          };
          
          console.log('🚀 Payload completo para backend:', backendUpdate);
          console.log('🌐 URL destino:', `${this.config.getAppointmentsUrl()}/${appointment.id}`);
          
          return this.http.put<Appointment>(`${this.config.getAppointmentsUrl()}/${appointment.id}`, backendUpdate, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).pipe(
            tap(response => console.log('✅ Cita actualizada:', response)),
            catchError(error => {
              console.error('❌ Error al actualizar cita:', error);
              console.error('📋 Status:', error.status);
              console.error('📄 Body:', error.error);
              
              // Manejar errores específicos
              if (error.status === 400) {
                const errorMessage = error.error?.error || error.error?.message || error.error;
                if (typeof errorMessage === 'string') {
                  throw new Error(`Error al actualizar la cita: ${errorMessage}`);
                }
              }
              
              throw new Error('Error del servidor al actualizar la cita. Por favor intente nuevamente.');
            })
          );
        })
      );
    } else {
      // JSON Server - enviar objeto completo
      return this.http.put<Appointment>(`${this.config.getAppointmentsUrl()}/${appointment.id}`, appointment);
    }
  }

  getPatientAppointments(): Observable<Appointment[]> {
    return this.getPatientId().pipe(
      switchMap(patientId => {
        console.log('ID del paciente actual:', patientId);
        
        if (!patientId) {
          console.log('No hay ID de paciente, retornando array vacío');
          return of([]);
        }
        
        if (this.config.isUsingBackend()) {
          // Backend real - obtener todas las citas y filtrar por paciente
          return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
            switchMap((allAppointments: any[]) => {
              console.log('📊 Todas las citas del backend para paciente:', allAppointments);
              console.log('📊 Cantidad total de citas en backend:', allAppointments?.length || 0);
              
              if (allAppointments && allAppointments.length > 0) {
                console.log('📋 Estructura de la primera cita del backend:', allAppointments[0]);
                console.log('📋 Campos disponibles:', Object.keys(allAppointments[0]));
                
                // Mostrar todos los estados disponibles
                const statuses = [...new Set(allAppointments.map(a => a.status))];
                console.log('📊 Estados disponibles en citas:', statuses);
              }
              
              // Filtrar citas del paciente actual
              const patientAppointments = allAppointments.filter(app => {
                const appPatientId = app.patientId?.toString();
                const matches = appPatientId === patientId;
                console.log(`🔍 Cita ${app.id}: patientId=${app.patientId} (como string: ${appPatientId}), buscando=${patientId}, coincide=${matches}, status=${app.status}`);
                return matches;
              });
              
              console.log('Citas filtradas del paciente:', patientAppointments);
              
              if (patientAppointments.length === 0) {
                return of([]);
              }
              
              // Obtener TODOS los doctores primero (el backend solo soporta GET all doctors, no por ID)
              return this.http.get<Profile[]>(`${this.config.getDoctorsUrl()}`).pipe(
                map(doctors => {
                  console.log('👨‍⚕️ Todos los doctores del backend:', doctors);
                  
                  // Crear un mapa de doctores por ID para búsqueda rápida
                  const doctorsMap = new Map<string, Profile>();
                  doctors.forEach(doctor => {
                    const doctorId = doctor.id?.toString();
                    doctorsMap.set(doctorId, doctor);
                    console.log(`🗺️ Agregando doctor al mapa: ID="${doctorId}" -> ${doctor.fullname}`);
                  });
                  
                  console.log('🗺️ Mapa de doctores creado:', doctorsMap);
                  console.log('🔑 Claves en el mapa:', Array.from(doctorsMap.keys()));
                  
                  // Mapear citas con información de doctores
                  const appointmentsWithDoctors = patientAppointments.map(backendApp => {
                    const appointmentDoctorId = backendApp.doctorId?.toString();
                    const doctor = doctorsMap.get(appointmentDoctorId);
                    
                    console.log(`🔍 Cita ${backendApp.id}:`);
                    console.log(`   - doctorId en cita: ${backendApp.doctorId} (tipo: ${typeof backendApp.doctorId})`);
                    console.log(`   - doctorId como string: "${appointmentDoctorId}"`);
                    console.log(`   - Doctor encontrado:`, doctor);
                    
                    if (!doctor) {
                      console.log(`❌ Doctor ${appointmentDoctorId} NO encontrado en el mapa`);
                      console.log(`🔑 IDs disponibles en mapa:`, Array.from(doctorsMap.keys()));
                    }
                    
                    return {
                      id: backendApp.id?.toString(),
                      date: backendApp.appointmentDate,
                      time: backendApp.appointmentTime,
                      doctor: doctor ? {
                        id: doctor.id?.toString(),
                        fullname: doctor.fullname,
                        specialty: doctor.specialty || ''
                      } : {
                        // Si no se encuentra el doctor específico, usar el primer doctor disponible como fallback
                        id: appointmentDoctorId,
                        fullname: doctors.length > 0 ? `${doctors[0].fullname} (ID: ${appointmentDoctorId})` : 'Doctor no disponible',
                        specialty: doctors.length > 0 ? doctors[0].specialty || '' : ''
                      },
                      patient: {
                        id: patientId,
                        fullname: this.getPatientFullName() || '',
                        email: ''
                      },
                      place: backendApp.reason || 'Consulta médica',
                      completed: backendApp.status === 'COMPLETADA'
                    } as Appointment;
                  });
                  
                  console.log('🔄🔄🔄 MAPEO FINAL DE CITAS PARA PACIENTE 🔄🔄🔄');
                  console.log('📊 Cantidad total de citas:', appointmentsWithDoctors.length);
                  
                  appointmentsWithDoctors.forEach((app, index) => {
                    console.log(`📋 Cita ${index + 1}:`);
                    console.log(`   - ID: ${app.id}`);
                    console.log(`   - Fecha: ${app.date} ${app.time}`);
                    console.log(`   - Doctor: ${app.doctor?.fullname || 'N/A'}`);
                    console.log(`   - Estado backend (status): ${(appointmentsWithDoctors as any)[index]?.status || 'N/A'}`);
                    console.log(`   - Campo completed: ${app.completed}`);
                    console.log(`   - Tipo completed: ${typeof app.completed}`);
                    console.log('   ________________');
                  });
                  
                  console.log('✅ Citas finales con información de doctores:', appointmentsWithDoctors);
                  return appointmentsWithDoctors;
                }),
                catchError(error => {
                  console.error('❌ Error obteniendo doctores:', error);
                  // Si no se pueden obtener los doctores, devolver citas con datos por defecto
                  return of(patientAppointments.map(backendApp => ({
                    id: backendApp.id?.toString(),
                    date: backendApp.appointmentDate,
                    time: backendApp.appointmentTime,
                    doctor: {
                      id: backendApp.doctorId?.toString(),
                      fullname: 'Doctor no disponible',
                      specialty: ''
                    },
                    patient: {
                      id: patientId,
                      fullname: this.getPatientFullName() || '',
                      email: ''
                    },
                    place: backendApp.reason || 'Consulta médica',
                    completed: backendApp.status === 'COMPLETADA'
                  } as Appointment)));
                })
              );
            }),
            map((appointments: Appointment[]) => {
              console.log('Citas transformadas para el frontend:', appointments);
              return appointments;
            })
          );
        } else {
          // JSON Server - obtener todas y filtrar
          return this.http.get<Appointment[]>(`${this.config.getAppointmentsUrl()}`).pipe(
            map((appointments: Appointment[]) => {
              console.log('Todas las citas obtenidas del servidor:', appointments);
              console.log('Filtrando citas para el paciente con ID:', patientId);
              
              // Filtrar solo las citas donde el paciente coincide con el usuario actual
              const filteredAppointments = appointments.filter(appointment => {
                const matches = appointment.patient && appointment.patient.id === patientId;
                console.log(`Cita ${appointment.id}: paciente ID ${appointment.patient?.id}, coincide: ${matches}`);
                return matches;
              });
              
              console.log('Citas filtradas para el paciente:', filteredAppointments);
              return filteredAppointments;
            })
          );
        }
      })
    );
  }

  // Validaciones de reglas de negocio
  validateAppointmentBusinessRules(appointment: Appointment): Observable<string | null> {
    console.log('🔍 Validando reglas de negocio para cita:', appointment);
    
    // Si estamos usando el backend y no tiene endpoint de appointments, 
    // realizar validaciones básicas localmente sin consultar el servidor
    if (this.config.isUsingBackend()) {
      console.log('⚡ Backend activo - usando validaciones básicas locales');
      
      // Validaciones básicas que no requieren datos del servidor
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
      const now = new Date();
      
      // 1. Verificar que la fecha no sea en el pasado
      if (appointmentDate <= now) {
        return of('No se pueden agendar citas en fechas pasadas');
      }

      // 2. Verificar que no sea domingo
      if (appointmentDate.getDay() === 0) {
        return of('No se pueden agendar citas los domingos');
      }

      // 3. Verificar horario laboral (8:00 AM - 6:00 PM)
      const hour = appointmentDate.getHours();
      if (hour < 8 || hour >= 18) {
        return of('Las citas solo pueden agendarse entre 8:00 AM y 6:00 PM');
      }

      // Para el backend, las validaciones de conflictos las manejará el servidor
      // durante la creación de la cita
      console.log('✅ Validaciones básicas pasadas - el backend manejará conflictos');
      return of(null); // Sin errores
    }
    
    // Validaciones completas para JSON Server
    return this.getPatientId().pipe(
      switchMap(patientId => {
        if (!patientId) {
          return of('No se pudo identificar al paciente');
        }

        return this.http.get<Appointment[]>(`${this.config.getAppointmentsUrl()}`).pipe(
          map((existingAppointments: Appointment[]) => {
            // 1. Verificar que la fecha no sea en el pasado
            const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
            const now = new Date();
            
            if (appointmentDate <= now) {
              return 'No se pueden agendar citas en fechas pasadas';
            }

            // 2. Verificar que no sea domingo
            if (appointmentDate.getDay() === 0) {
              return 'No se pueden agendar citas los domingos';
            }

            // 3. Verificar horario laboral (8:00 AM - 6:00 PM)
            const hour = appointmentDate.getHours();
            if (hour < 8 || hour >= 18) {
              return 'Las citas solo pueden agendarse entre 8:00 AM y 6:00 PM';
            }

            // 4. Verificar que no haya más de 2 citas por paciente por día
            const sameDay = existingAppointments.filter(apt => 
              apt.patient?.id === patientId && 
              apt.date === appointment.date
            );
            
            if (sameDay.length >= 2) {
              return 'No puede tener más de 2 citas por día';
            }

            // 5. Verificar que no haya citas duplicadas (mismo doctor, mismo día, misma hora)
            const duplicate = existingAppointments.find(apt => 
              apt.doctor.id === appointment.doctor.id &&
              apt.date === appointment.date &&
              apt.time === appointment.time
            );
            
            if (duplicate) {
              return 'Ya existe una cita con este doctor en esa fecha y hora';
            }

            // 6. Verificar que el paciente no tenga más de 5 citas pendientes
            const pendingAppointments = existingAppointments.filter(apt => 
              apt.patient?.id === patientId && 
              !apt.completed &&
              new Date(`${apt.date}T${apt.time}`) > now
            );
            
            if (pendingAppointments.length >= 5) {
              return 'No puede tener más de 5 citas pendientes al mismo tiempo';
            }

            // 7. Verificar que haya al menos 30 minutos entre citas del mismo paciente el mismo día
            const sameDayAppointments = existingAppointments.filter(apt => 
              apt.patient?.id === patientId && 
              apt.date === appointment.date
            );
            
            for (const existingApt of sameDayAppointments) {
              const existingTime = new Date(`${existingApt.date}T${existingApt.time}`);
              const timeDiff = Math.abs(appointmentDate.getTime() - existingTime.getTime());
              const minutesDiff = timeDiff / (1000 * 60);
              
              if (minutesDiff < 30) {
                return 'Debe haber al menos 30 minutos entre citas';
              }
            }

            return null; // Sin errores
          })
        );
      })
    );
  }

  checkAppointmentConflicts(appointment: Appointment): Observable<boolean> {
    return this.http.get<Appointment[]>(`${this.config.getAppointmentsUrl()}`).pipe(
      map((appointments: Appointment[]) => {
        return appointments.some(apt => 
          apt.doctor.id === appointment.doctor.id &&
          apt.patient?.id === appointment.patient?.id &&
          apt.date === appointment.date &&
          apt.time === appointment.time &&
          apt.id !== appointment.id // Excluir la cita actual si es una actualización
        );
      })
    );
  }

  // Método para intentar crear cita con endpoints alternativos
  private tryAlternativeAppointmentEndpoints(appointment: any): Observable<Appointment> {
    const alternativeUrls = this.config.getAlternativeAppointmentsUrls();
    
    // Función recursiva para probar cada URL
    const tryNextUrl = (urlIndex: number): Observable<Appointment> => {
      if (urlIndex >= alternativeUrls.length) {
        throw new Error('Ningún endpoint de citas está disponible en el backend. El backend necesita implementar un controlador para citas.');
      }
      
      const url = alternativeUrls[urlIndex];
      console.log(`🔄 Intentando URL alternativa ${urlIndex + 1}/${alternativeUrls.length}: ${url}`);
      
      return this.http.post<Appointment>(url, appointment, {
        headers: { 'Content-Type': 'application/json' }
      }).pipe(
        tap(response => console.log(`✅ Cita creada exitosamente con URL alternativa: ${url}`, response)),
        catchError(error => {
          console.log(`❌ Falló URL ${url}:`, error.status);
          if (error.status === 404 && urlIndex < alternativeUrls.length - 1) {
            // Si es 404, intentar la siguiente URL
            return tryNextUrl(urlIndex + 1);
          } else {
            // Si no es 404 o es la última URL, propagar el error
            throw error;
          }
        })
      );
    };
    
    return tryNextUrl(0);
  }

  /**
   * Debug: Método simple para probar endpoint de appointments y ver estructura real
   */
  getSimpleAppointmentTest(): Observable<any> {
    console.log('🧪 Test simple de appointments desde pacientes - URL:', this.config.getAppointmentsUrl());
    
    return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
      tap(appointments => {
        console.log('📊 TODAS las citas del backend (desde pacientes):', appointments);
        console.log('📊 Cantidad total de citas:', appointments?.length || 0);
        
        if (appointments && appointments.length > 0) {
          console.log('📋 Estructura de la primera cita:', appointments[0]);
          console.log('📋 Campos disponibles:', Object.keys(appointments[0]));
          
          // Mostrar todos los IDs de pacientes disponibles  
          const patientIds = [...new Set(appointments.map(a => a.patientId))];
          console.log('🧑‍🤝‍🧑 IDs de pacientes en las citas:', patientIds);
          
          // Mostrar todos los IDs de doctores disponibles
          const doctorIds = [...new Set(appointments.map(a => a.doctorId))];
          console.log('👨‍⚕️ IDs de doctores en las citas:', doctorIds);
        }
        
        // Comparar con el ID del paciente actual
        const currentPatientId = this.getPatientId();
        console.log('🆔 ID del paciente actual en localStorage:', currentPatientId);
        
        // Ver si hay coincidencias
        if (appointments && currentPatientId) {
          const matches = appointments.filter(a => a.patientId?.toString() === currentPatientId);
          console.log('✅ Citas que coinciden con paciente actual:', matches.length);
        }
      }),
      catchError(error => {
        console.error('❌ Error en test simple de appointments desde pacientes:', error);
        return of([]);
      })
    );
  }

  /**
   * Debug: Verificar datos de perfil en localStorage
   */
  debugProfileData(): void {
    console.log('🔍 DEBUG: Datos del perfil en localStorage (desde servicio paciente)');
    
    const profile = localStorage.getItem('profile');
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        console.log('👤 Perfil completo:', parsedProfile);
        console.log('🆔 ID:', parsedProfile.id);
        console.log('🎭 Rol:', parsedProfile.role);
        console.log('📧 Email:', parsedProfile.email);
        console.log('👤 Nombre:', parsedProfile.fullname || parsedProfile.name);
        
        // Verificar el tipo de datos del ID
        console.log('🔢 Tipo de ID:', typeof parsedProfile.id);
        console.log('🔢 ID como string:', parsedProfile.id?.toString());
      } catch (error) {
        console.error('❌ Error parsing profile JSON:', error);
      }
    } else {
      console.log('❌ No hay perfil en localStorage');
    }
  }

  /**
   * Debug: Método simple para probar endpoint de appointments y ver estructura real desde la vista del paciente
   */
  getSimpleAppointmentTestForPatient(): Observable<any> {
    console.log('🧪 Test simple de appointments (paciente) - URL:', this.config.getAppointmentsUrl());
    
    return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
      tap(appointments => {
        console.log('📊 TODAS las citas del backend (sin filtrar) - Vista paciente:', appointments);
        console.log('📊 Cantidad total de citas:', appointments?.length || 0);
        
        if (appointments && appointments.length > 0) {
          console.log('📋 Estructura de la primera cita:', appointments[0]);
          console.log('📋 Campos disponibles:', Object.keys(appointments[0]));
          
          // Mostrar todos los estados disponibles
          const statuses = [...new Set(appointments.map(a => a.status))];
          console.log('📊 Estados disponibles en las citas:', statuses);
          
          // Contar citas por estado
          statuses.forEach(status => {
            const count = appointments.filter(a => a.status === status).length;
            console.log(`   - ${status}: ${count} citas`);
          });
          
          // Mostrar todos los IDs de pacientes disponibles  
          const patientIds = [...new Set(appointments.map(a => a.patientId))];
          console.log('🧑‍🤝‍🧑 IDs de pacientes en las citas:', patientIds);
        }
        
        // Comparar con el ID del paciente actual
        this.getPatientId().subscribe(currentPatientId => {
          console.log('🆔 ID del paciente actual:', currentPatientId);
          
          // Ver si hay coincidencias
          if (appointments && currentPatientId) {
            const matches = appointments.filter(a => a.patientId?.toString() === currentPatientId);
            console.log('✅ Citas que coinciden con paciente actual:', matches.length);
            matches.forEach(match => {
              console.log(`   - Cita ${match.id}: ${match.appointmentDate} ${match.appointmentTime} - Estado: ${match.status}`);
            });
          }
        });
      }),
      catchError(error => {
        console.error('❌ Error en test simple de appointments (paciente):', error);
        return of([]);
      })
    );
  }

}
