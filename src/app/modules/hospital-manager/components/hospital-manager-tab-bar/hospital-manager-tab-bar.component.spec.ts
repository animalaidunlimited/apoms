import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalManagerTabBarComponent } from './hospital-manager-tab-bar.component';

describe('HospitalManagerTabBarComponent', () => {
  let component: HospitalManagerTabBarComponent;
  let fixture: ComponentFixture<HospitalManagerTabBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HospitalManagerTabBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HospitalManagerTabBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
