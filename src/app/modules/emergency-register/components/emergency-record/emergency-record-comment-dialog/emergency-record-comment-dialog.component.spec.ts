import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
