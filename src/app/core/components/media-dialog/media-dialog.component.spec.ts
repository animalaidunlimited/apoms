import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

import { MediaDialogComponent } from './media-dialog.component';

describe('MediaDialogComponent', () => {
  let component: MediaDialogComponent;
  let fixture: ComponentFixture<MediaDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};

const dialogData = {};

let dialog: MatDialogRef<MediaDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        AngularFireModule.initializeApp(environment.firebase)],

      declarations: [ MediaDialogComponent ],
      providers: [
        DatePipe,
        MatSnackBar,
        {
            provide: MAT_DIALOG_DATA,
            useValue: dialogData,
        },
        {
            provide: MatDialogRef,
            useValue: mockDialogRef,
        },
    ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDialogComponent);
    component = fixture.componentInstance;
    dialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
