import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverActionDialogComponent } from './driver-action-dialog.component';

describe('DriverActionDialogComponent', () => {
  let component: DriverActionDialogComponent;
  let fixture: ComponentFixture<DriverActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DriverActionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
