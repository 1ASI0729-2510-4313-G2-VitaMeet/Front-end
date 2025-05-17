import { Routes } from '@angular/router';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { DatesManagementComponent } from './dates-management/dates-management.component';

export const routes: Routes = [
  { path: '', component: DatesManagementComponent }, // Ruta predeterminada
  { path: 'patient-history', component: PatientHistoryComponent },
];
