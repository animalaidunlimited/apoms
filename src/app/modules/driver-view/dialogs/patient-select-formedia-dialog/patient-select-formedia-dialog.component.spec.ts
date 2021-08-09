import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSelectFormediaDialogComponent } from './patient-select-formedia-dialog.component';

describe('PatientSelectFormediaDialogComponent', () => {
  let component: PatientSelectFormediaDialogComponent;
  let fixture: ComponentFixture<PatientSelectFormediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientSelectFormediaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSelectFormediaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
