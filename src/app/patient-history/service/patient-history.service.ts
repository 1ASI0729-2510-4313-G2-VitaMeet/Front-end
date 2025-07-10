import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ConfigService } from '../../shared/config.service';

@Injectable({
  providedIn: 'root',
})
export class PatientHistoryService {

  constructor(private http: HttpClient, private config: ConfigService) {}

  getPatientHistory(): Observable<any[]> {
    if (this.config.isUsingBackend()) {
      // Backend real - obtener todos los registros médicos
      return this.http.get<any[]>(`${this.config.getMedicalRecordsUrl()}`).pipe(
        switchMap((medicalRecords: any[]) => {
          console.log('Registros médicos del backend:', medicalRecords);
          
          if (medicalRecords.length === 0) {
            return of([]);
          }
          
          // Para cada registro médico, obtener datos del paciente
          const recordsWithPatientData = medicalRecords.map(record => {
            if (record.patientId) {
              return this.http.get<any>(`${this.config.getPatientByIdUrl(record.patientId)}`).pipe(
                map(patient => ({
                  ...record,
                  patient: {
                    id: patient.id,
                    fullname: patient.name || patient.fullname,
                    email: patient.email,
                    age: patient.age,
                    phone: patient.phone,
                    address: patient.address
                  }
                })),
                catchError(error => {
                  console.error(`Error obteniendo paciente ${record.patientId}:`, error);
                  return of({
                    ...record,
                    patient: {
                      id: record.patientId,
                      fullname: 'Paciente no disponible',
                      email: '',
                      age: null,
                      phone: '',
                      address: ''
                    }
                  });
                })
              );
            } else {
              return of({
                ...record,
                patient: {
                  id: '',
                  fullname: 'Sin paciente asociado',
                  email: '',
                  age: null,
                  phone: '',
                  address: ''
                }
              });
            }
          });
          
          // Combinar todas las promesas
          return recordsWithPatientData.length > 0 ? 
            recordsWithPatientData.reduce((acc, curr) => 
              acc.pipe(switchMap(records => 
                curr.pipe(map(record => [...records, record]))
              ))
            , of([] as any[])) : of([]);
        }),
        map((records: any[]) => {
          console.log('Registros médicos con datos de pacientes:', records);
          return records;
        }),
        catchError(error => {
          console.error('Error obteniendo historial médico:', error);
          return of([]);
        })
      );
    } else {
      // JSON Server - estructura original
      return this.http.get<any[]>(`${this.config.getMedicalRecordsUrl()}`);
    }
  }
}
