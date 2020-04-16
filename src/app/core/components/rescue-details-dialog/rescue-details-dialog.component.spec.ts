import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RescueDetailsDialogComponent } from './rescue-details-dialog.component';

describe('RescueDetailsDialogComponent', () => {
  let component: RescueDetailsDialogComponent;
  let fixture: ComponentFixture<RescueDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RescueDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RescueDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
