import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import { DatesManagementComponent } from './dates-management/dates-management.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DatesManagementComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gestion-citas-ari';
}
