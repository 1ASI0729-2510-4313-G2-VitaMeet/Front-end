import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './Register/register.component';
import { DatesManagementComponent } from './dates-management/dates-management.component';
import { PatientHistoryComponent } from './patient-history/patient-history.component';
import { PatientsDatesManagementComponent } from './patients-dates-management/patients-dates-management.component';
import { PatientsDatesManagementListComponent } from './patients-dates-management-list/patients-dates-management-list.component';
import { ProfilePageComponent } from './profile/pages/profile-page/profile-page.component';
import { EvaluationComponent } from './evaluation/evaluation.component';
import { DoctorEvaluationsComponent } from './evaluation/doctor-evaluations.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dates-management', component: DatesManagementComponent },
  { path: 'patients-dates-management', component: PatientsDatesManagementComponent },
  { path: 'patients-dates-management-list', component: PatientsDatesManagementListComponent },
  { path: 'patient-history', component: PatientHistoryComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'evaluation', component: EvaluationComponent },
  { path: 'doctor-evaluations', component: DoctorEvaluationsComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full'},
];
