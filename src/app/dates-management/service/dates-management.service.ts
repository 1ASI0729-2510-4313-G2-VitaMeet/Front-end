import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { ConfigService } from '../../shared/config.service';

@Injectable({
  providedIn: 'root',
})
export class DatesManagementService {

  constructor(private http: HttpClient, private config: ConfigService) {}

  getAppointments(): Observable<any[]> {
    console.log('Obteniendo citas para médico...');
    
    if (this.config.isUsingBackend()) {
      // Backend real
      return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
        map((appointments: any[]) => {
          console.log('Citas obtenidas para médico:', appointments);
          return appointments;
        })
      );
    } else {
      // JSON Server con expand
      return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}?_expand=patient`).pipe(
        map((appointments: any[]) => {
          console.log('Citas obtenidas para médico:', appointments);
          return appointments;
        })
      );
    }
  }

  updateAppointment(id: string, updatedData: { date: string, time?: string, place?: string }): Observable<any> {
    console.log('🔥 Actualizando cita (médico) - Backend activo:', this.config.isUsingBackend());
    console.log('📄 Datos a actualizar:', updatedData);
    
    if (this.config.isUsingBackend()) {
      // Backend real - estructura específica usando el formato correcto
      const backendUpdate = {
        appointmentDate: updatedData.date,
        appointmentTime: updatedData.time || '10:00',  // Tiempo por defecto si no se proporciona
        reason: updatedData.place || 'Cita reprogramada',
        status: 'REPROGRAMADA'  // Usar enum en español que espera el backend
      };
      
      console.log('🚀 Payload para backend:', backendUpdate);
      
      return this.http.put(`${this.config.getAppointmentsUrl()}/${id}`, backendUpdate, {
        headers: {
          'Content-Type': 'application/json'
        }
      }).pipe(
        tap((response: any) => console.log('✅ Cita actualizada:', response)),
        catchError((error: any) => {
          console.error('❌ Error al actualizar cita:', error);
          console.error('📋 Status:', error.status);
          console.error('📄 Body:', error.error);
          
          // Si hay error de validación, intentar con diferentes formatos de status
          if (error.status === 400 && error.error?.message?.includes('status')) {
            console.log('🔄 Reintentando con status PROGRAMADA...');
            const retryPayload = { ...backendUpdate, status: 'PROGRAMADA' };
            return this.http.put(`${this.config.getAppointmentsUrl()}/${id}`, retryPayload, {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          throw error;
        })
      );
    } else {
      // JSON Server - PATCH
      return this.http.patch(`${this.config.getAppointmentsUrl()}/${id}`, updatedData);
    }
  }

  deleteAppointment(id: string): Observable<any> {
    console.log('🔥 Eliminando cita - Backend activo:', this.config.isUsingBackend());
    console.log('📄 ID de cita:', id);
    
    return this.http.delete(`${this.config.getAppointmentsUrl()}/${id}`).pipe(
      tap((response: any) => console.log('✅ Cita eliminada:', response)),
      catchError((error: any) => {
        console.error('❌ Error al eliminar cita:', error);
        console.error('📋 Status:', error.status);
        console.error('📄 Body:', error.error);
        throw error;
      })
    );
  }

  completeAppointment(id: string): Observable<any> {
    console.log('🔥🔥🔥 INICIANDO PROCESO DE COMPLETAR CITA 🔥🔥🔥');
    console.log('📄 ID de cita:', id);
    console.log('🌐 Backend activo:', this.config.isUsingBackend());
    console.log('🌐 URL base appointments:', this.config.getAppointmentsUrl());
    
    if (this.config.isUsingBackend()) {
      // Primero obtener los datos completos de la cita
      const getUrl = `${this.config.getAppointmentsUrl()}/${id}`;
      console.log('🔍 URL para obtener cita:', getUrl);
      
      return this.http.get<any>(getUrl).pipe(
        tap((appointment: any) => {
          console.log('📋📋📋 CITA OBTENIDA DEL BACKEND 📋📋📋');
          console.log('🔍 Estructura completa:', JSON.stringify(appointment, null, 2));
          console.log('🔍 Estado actual:', appointment.status);
          console.log('🔍 Tipo de estado:', typeof appointment.status);
        }),
        switchMap((appointment: any) => {
          // Backend real - enviar todos los campos necesarios
          const completeData = {
            patientId: appointment.patientId,
            doctorId: appointment.doctorId,
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            reason: appointment.reason || 'Consulta médica',
            status: 'COMPLETADA'  // Cambiar solo el status
          };
          
          const putUrl = `${this.config.getAppointmentsUrl()}/${id}`;
          console.log('🚀🚀🚀 ENVIANDO ACTUALIZACIÓN AL BACKEND 🚀🚀🚀');
          console.log('🌐 URL PUT:', putUrl);
          console.log('📦 Payload completo:', JSON.stringify(completeData, null, 2));
          console.log('🔄 Status cambiando de:', appointment.status, 'a:', completeData.status);
          
          return this.http.put(putUrl, completeData, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).pipe(
            tap((response: any) => {
              console.log('✅✅✅ RESPUESTA DEL BACKEND EXITOSA ✅✅✅');
              console.log('📦 Respuesta completa:', JSON.stringify(response, null, 2));
              console.log('🔍 Nuevo estado en respuesta:', response?.status);
            }),
            catchError((error: any) => {
              console.error('❌❌❌ ERROR AL ACTUALIZAR CITA ❌❌❌');
              console.error('📋 HTTP Status:', error.status);
              console.error('🌐 URL que falló:', error.url);
              console.error('📄 Error body completo:', JSON.stringify(error.error, null, 2));
              console.error('📄 Error message:', error.message);
              
              // Manejar errores específicos
              if (error.status === 400) {
                const errorMessage = error.error?.error || error.error?.message || error.error;
                console.error('🔍 Mensaje de error específico:', errorMessage);
                if (typeof errorMessage === 'string') {
                  throw new Error(`Error al completar la cita: ${errorMessage}`);
                }
              } else if (error.status === 404) {
                console.error('🔍 Cita no encontrada - ID:', id);
                throw new Error(`La cita con ID ${id} no fue encontrada en el servidor.`);
              } else if (error.status === 500) {
                console.error('🔍 Error interno del servidor');
                throw new Error('Error interno del servidor al completar la cita.');
              }
              
              throw new Error(`Error del servidor (${error.status}) al completar la cita. Por favor intente nuevamente.`);
            })
          );
        }),
        catchError((error: any) => {
          console.error('❌❌❌ ERROR AL OBTENER DATOS DE LA CITA ❌❌❌');
          console.error('📋 HTTP Status:', error.status);
          console.error('🌐 URL que falló:', error.url);
          console.error('📄 Error completo:', JSON.stringify(error, null, 2));
          throw new Error(`No se pudieron obtener los datos de la cita (${error.status}). Verifique que la cita exista.`);
        })
      );
    } else {
      // JSON Server usa PATCH
      console.log('📡 Usando JSON Server - PATCH');
      return this.http.patch(`${this.config.getAppointmentsUrl()}/${id}`, { completed: true });
    }
  }

  getDoctorId(): string | null {
    const profile = localStorage.getItem('profile');
    console.log('🔍 Obteniendo ID del doctor desde localStorage...');
    console.log('📦 Profile raw:', profile);
    
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        console.log('👤 Profile parsed:', parsedProfile);
        console.log('🆔 Profile ID:', parsedProfile.id);
        console.log('🎭 Profile role:', parsedProfile.role);
        console.log('📧 Profile email:', parsedProfile.email);
        
        const id = parsedProfile.id?.toString() || null;
        console.log('🔢 ID final (como string):', id);
        return id;
      } catch (error) {
        console.error('❌ Error parsing profile JSON:', error);
        return null;
      }
    } else {
      console.log('❌ No profile found in localStorage');
      return null;
    }
  }

  getDoctorAppointments(): Observable<any[]> {
    const doctorId = this.getDoctorId();
    console.log('ID del médico actual:', doctorId);
    
    if (!doctorId) {
      console.log('No hay ID de médico, retornando array vacío');
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }
    
    if (this.config.isUsingBackend()) {
      // Backend real - obtener todas las citas y filtrar por doctor
      return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
        switchMap((allAppointments: any[]) => {
          console.log('Todas las citas del backend:', allAppointments);
          
          // Filtrar citas del doctor actual
          const doctorAppointments = allAppointments.filter(app => {
            const matches = app.doctorId?.toString() === doctorId;
            console.log(`🔍 Cita ${app.id}: doctorId=${app.doctorId}, buscando=${doctorId}, coincide=${matches}`);
            return matches;
          });
          
          console.log('Citas filtradas del doctor:', doctorAppointments);
          
          if (doctorAppointments.length === 0) {
            return of([]);
          }
          
          // Obtener información de pacientes para cada cita (usar getPatientByIdUrl)
          const appointmentPromises = doctorAppointments.map(backendApp => {
            return this.http.get<any>(`${this.config.getPatientByIdUrl(backendApp.patientId)}`).pipe(
              map(patient => ({
                id: backendApp.id?.toString(),
                date: backendApp.appointmentDate,
                time: backendApp.appointmentTime,
                patient: {
                  id: patient.id?.toString(),
                  fullname: patient.name || patient.fullname,
                  email: patient.email || ''
                },
                doctor: {
                  id: doctorId,
                  fullname: 'Doctor actual', // TODO: Obtener nombre real del doctor
                  specialty: ''
                },
                place: backendApp.reason || 'Consulta médica',
                completed: backendApp.status === 'COMPLETADA',
                status: backendApp.status
              })),
              catchError(error => {
                console.error(`Error obteniendo paciente ${backendApp.patientId}:`, error);
                console.error('Status:', error.status, 'Message:', error.message);
                
                // Si no se puede obtener el paciente, usar datos por defecto pero más informativos
                return of({
                  id: backendApp.id?.toString(),
                  date: backendApp.appointmentDate,
                  time: backendApp.appointmentTime,
                  patient: {
                    id: backendApp.patientId?.toString(),
                    fullname: `Paciente ID: ${backendApp.patientId}`,
                    email: ''
                  },
                  doctor: {
                    id: doctorId,
                    fullname: 'Doctor actual',
                    specialty: ''
                  },
                  place: backendApp.reason || 'Consulta médica',
                  completed: backendApp.status === 'COMPLETADA',
                  status: backendApp.status
                });
              })
            );
          });
          
          // Combinar todas las promesas
          return appointmentPromises.length > 0 ? 
            appointmentPromises.reduce((acc, curr) => 
              acc.pipe(switchMap(appointments => 
                curr.pipe(map(appointment => [...appointments, appointment]))
              ))
            , of([] as any[])) : of([]);
        }),
        map((appointments: any[]) => {
          console.log('🔄🔄🔄 MAPEO FINAL DE CITAS PARA DOCTOR 🔄🔄🔄');
          console.log('📊 Cantidad total de citas:', appointments.length);
          
          appointments.forEach((app, index) => {
            console.log(`📋 Cita ${index + 1}:`);
            console.log(`   - ID: ${app.id}`);
            console.log(`   - Fecha: ${app.date} ${app.time}`);
            console.log(`   - Paciente: ${app.patient?.fullname || 'N/A'}`);
            console.log(`   - Estado backend (status): ${app.status}`);
            console.log(`   - Campo completed: ${app.completed}`);
            console.log(`   - Tipo completed: ${typeof app.completed}`);
            console.log(`   - ¿Es COMPLETADA?: ${app.status === 'COMPLETADA'}`);
            console.log('   ________________');
          });
          
          return appointments;
        })
      );
    } else {
      // JSON Server - obtener todas y filtrar
      return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
        map((appointments: any[]) => {
          console.log('Todas las citas obtenidas del servidor:', appointments);
          console.log('Filtrando citas para el médico con ID:', doctorId);
          
          // Filtrar solo las citas donde el doctor coincide con el usuario actual
          const filteredAppointments = appointments.filter(appointment => {
            const matches = appointment.doctor && appointment.doctor.id === doctorId;
            console.log(`Cita ${appointment.id}: doctor ID ${appointment.doctor?.id}, coincide: ${matches}`);
            return matches;
          });
          
          console.log('Citas filtradas para el médico:', filteredAppointments);
          return filteredAppointments;
        })
      );
    }
  }

  /**
   * Debug: Método simple para probar endpoint de appointments y ver estructura real
   */
  getSimpleAppointmentTest(): Observable<any> {
    console.log('🧪 Test simple de appointments - URL:', this.config.getAppointmentsUrl());
    
    return this.http.get<any[]>(`${this.config.getAppointmentsUrl()}`).pipe(
      tap(appointments => {
        console.log('📊 TODAS las citas del backend (sin filtrar):', appointments);
        console.log('📊 Cantidad total de citas:', appointments?.length || 0);
        
        if (appointments && appointments.length > 0) {
          console.log('📋 Estructura de la primera cita:', appointments[0]);
          console.log('📋 Campos disponibles:', Object.keys(appointments[0]));
          
          // Mostrar todos los IDs de doctores disponibles
          const doctorIds = [...new Set(appointments.map(a => a.doctorId))];
          console.log('👨‍⚕️ IDs de doctores en las citas:', doctorIds);
          
          // Mostrar todos los IDs de pacientes disponibles  
          const patientIds = [...new Set(appointments.map(a => a.patientId))];
          console.log('🧑‍🤝‍🧑 IDs de pacientes en las citas:', patientIds);
        }
        
        // Comparar con el ID del doctor actual
        const currentDoctorId = this.getDoctorId();
        console.log('🆔 ID del doctor actual en localStorage:', currentDoctorId);
        
        // Ver si hay coincidencias
        if (appointments && currentDoctorId) {
          const matches = appointments.filter(a => a.doctorId?.toString() === currentDoctorId);
          console.log('✅ Citas que coinciden con doctor actual:', matches.length);
        }
      }),
      catchError(error => {
        console.error('❌ Error en test simple de appointments:', error);
        return of([]);
      })
    );
  }

  /**
   * Debug: Verificar datos de perfil en localStorage
   */
  debugProfileData(): void {
    console.log('🔍 DEBUG: Datos del perfil en localStorage');
    
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

}
