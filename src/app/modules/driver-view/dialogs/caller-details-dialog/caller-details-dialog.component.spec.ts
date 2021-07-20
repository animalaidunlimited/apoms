import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallerDetailsDialogComponent } from './caller-details-dialog.component';

describe('CallerDetailsDialogComponent', () => {
  let component: CallerDetailsDialogComponent;
  let fixture: ComponentFixture<CallerDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallerDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallerDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
