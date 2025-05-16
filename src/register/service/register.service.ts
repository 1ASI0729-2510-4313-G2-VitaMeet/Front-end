import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {
    private apiUrl = 'https://api.ejemplo.com/register'; // Cambia esto a tu URL real

    constructor(private http: HttpClient) {}

    registerUser(user: User): Observable<any> {
        return this.http.post<any>(this.apiUrl, user);
    }
}
