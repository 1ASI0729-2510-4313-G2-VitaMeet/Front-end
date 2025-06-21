import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatesManagementService {
  private apiUrl = 'http://localhost:3000/appointments'; // Endpoint del JSON Server

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/appointments?_expand=patient');
  }

  updateAppointment(id: number, updatedData: { date: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updatedData);
  }

  deleteAppointment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
