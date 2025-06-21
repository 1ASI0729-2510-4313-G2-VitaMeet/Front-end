import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsDatesManagementComponent } from './patients-dates-management.component';

describe('PatientsDatesManagementComponent', () => {
  let component: PatientsDatesManagementComponent;
  let fixture: ComponentFixture<PatientsDatesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientsDatesManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientsDatesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
