import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/register';

  constructor(private http: HttpClient) {}

  validateCredentials(email: string, password: string): Observable<any> {
    // Buscar en register, patients y doctors
    const register$ = this.http.get<any[]>(`${this.apiUrl}?email=${email}&password=${password}`);
    const patients$ = this.http.get<any[]>(`http://localhost:3000/patients?email=${email}&password=${password}`);
    const doctors$ = this.http.get<any[]>(`http://localhost:3000/doctors?email=${email}&password=${password}`);
    return new Observable(observer => {
      let found = false;
      register$.subscribe(users => {
        if (users.length > 0) {
          found = true;
          observer.next(users);
          observer.complete();
        } else {
          patients$.subscribe(patients => {
            if (patients.length > 0) {
              found = true;
              observer.next(patients);
              observer.complete();
            } else {
              doctors$.subscribe(doctors => {
                observer.next(doctors);
                observer.complete();
              });
            }
          });
        }
      });
    });
  }
}
