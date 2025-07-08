import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DatesManagementService {
  private apiUrl = 'http://localhost:3000/appointments'; // Endpoint del JSON Server

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any[]> {
    console.log('Obteniendo citas para médico...');
    return this.http.get<any[]>('http://localhost:3000/appointments?_expand=patient').pipe(
      map((appointments: any[]) => {
        console.log('Citas obtenidas para médico:', appointments);
        return appointments;
      })
    );
  }

  updateAppointment(id: string, updatedData: { date: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updatedData);
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  completeAppointment(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { completed: true });
  }

  getDoctorId(): string | null {
    const profile = localStorage.getItem('profile');
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      return parsedProfile.id || null;
    }
    return null;
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
    
    return this.http.get<any[]>(this.apiUrl).pipe(
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
