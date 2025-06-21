import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsDatesManagementListComponent } from './patients-dates-management-list.component';

describe('PatientsDatesManagementListComponent', () => {
  let component: PatientsDatesManagementListComponent;
  let fixture: ComponentFixture<PatientsDatesManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientsDatesManagementListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientsDatesManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
