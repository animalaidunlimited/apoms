import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyCaseDialogComponent } from './emergency-case-dialog.component';

describe('EmergencyCaseDialogComponent', () => {
  let component: EmergencyCaseDialogComponent;
  let fixture: ComponentFixture<EmergencyCaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyCaseDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyCaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
