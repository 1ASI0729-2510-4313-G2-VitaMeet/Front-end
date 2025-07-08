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

}
