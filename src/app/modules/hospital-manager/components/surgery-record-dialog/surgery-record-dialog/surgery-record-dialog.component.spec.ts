import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurgeryRecordDialogComponent } from './surgery-record-dialog.component';

describe('SurgeryRecordDialogComponent', () => {
  let component: SurgeryRecordDialogComponent;
  let fixture: ComponentFixture<SurgeryRecordDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgeryRecordDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgeryRecordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
