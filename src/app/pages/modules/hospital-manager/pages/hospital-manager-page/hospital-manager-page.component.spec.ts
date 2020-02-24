import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalManagerPageComponent } from './hospital-manager-page.component';

describe('HospitalManagerPageComponent', () => {
  let component: HospitalManagerPageComponent;
  let fixture: ComponentFixture<HospitalManagerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HospitalManagerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HospitalManagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
