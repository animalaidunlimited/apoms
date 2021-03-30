import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentListPageComponent } from './treatment-list-page.component';

describe('TreatmentListPageComponent', () => {
  let component: TreatmentListPageComponent;
  let fixture: ComponentFixture<TreatmentListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreatmentListPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
