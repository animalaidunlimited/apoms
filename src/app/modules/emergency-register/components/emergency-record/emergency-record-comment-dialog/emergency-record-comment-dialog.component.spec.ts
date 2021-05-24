import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { EmergencyRecordCommentDialogComponent } from './emergency-record-comment-dialog.component';
const data = {
  caseComment: ''
};
describe('EmergencyRecordCommentDialogComponent', () => {
  let component: EmergencyRecordCommentDialogComponent;
  let fixture: ComponentFixture<EmergencyRecordCommentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyRecordCommentDialogComponent ],
      imports: [
        MaterialModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: data},
    ],
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
