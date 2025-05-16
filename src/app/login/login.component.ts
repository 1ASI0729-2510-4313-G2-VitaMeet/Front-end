import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    const newUser = { username: this.username, password: this.password };

    this.http.post('http://localhost:3000/users', newUser).subscribe({
      next: () => {
        this.successMessage = 'Usuario guardado exitosamente';
        this.errorMessage = '';
        this.username = '';
        this.password = '';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al guardar el usuario';
        this.successMessage = '';
      }
    });
  }
}
