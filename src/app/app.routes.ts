import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './Register/register.component';
import { DatesManagementComponent } from './dates-management/dates-management.component';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dates-management', component: DatesManagementComponent },
  { path: 'patient-history', component: PatientHistoryComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
];
