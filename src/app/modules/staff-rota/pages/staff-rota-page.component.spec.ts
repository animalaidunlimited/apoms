import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffRotaPageComponent } from './staff-rota-page.component';

describe('StaffRotaPageComponent', () => {
  let component: StaffRotaPageComponent;
  let fixture: ComponentFixture<StaffRotaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaffRotaPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRotaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
