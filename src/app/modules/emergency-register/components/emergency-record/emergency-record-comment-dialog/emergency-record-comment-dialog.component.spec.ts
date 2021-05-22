import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyRecordCommentDialogComponent } from './emergency-record-comment-dialog.component';

describe('EmergencyRecordCommentDialogComponent', () => {
  let component: EmergencyRecordCommentDialogComponent;
  let fixture: ComponentFixture<EmergencyRecordCommentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyRecordCommentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyRecordCommentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
