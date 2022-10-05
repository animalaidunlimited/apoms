import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffRotationPageComponent } from './staff-rotation-page.component';

describe('StaffRotationPageComponent', () => {
  let component: StaffRotationPageComponent;
  let fixture: ComponentFixture<StaffRotationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffRotationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRotationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
