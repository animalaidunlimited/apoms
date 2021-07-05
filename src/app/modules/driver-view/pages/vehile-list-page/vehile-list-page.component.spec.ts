import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehileListPageComponent } from './vehile-list-page.component';

describe('VehileListPageComponent', () => {
  let component: VehileListPageComponent;
  let fixture: ComponentFixture<VehileListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehileListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehileListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
