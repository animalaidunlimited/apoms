import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeriesByDateDialogComponent } from './surgeries-by-date-dialog.component';

describe('SurgeriesByDateDialogComponent', () => {
  let component: SurgeriesByDateDialogComponent;
  let fixture: ComponentFixture<SurgeriesByDateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgeriesByDateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgeriesByDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
