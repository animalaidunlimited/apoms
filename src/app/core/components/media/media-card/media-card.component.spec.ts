import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs/internal/observable/of';
import { MediaItem } from 'src/app/core/models/media';
import { MaterialModule } from 'src/app/material-module';

import { MediaCardComponent } from './media-card.component';

@Component({
  selector: 'confirmation-dialog',
  template: '<p>Mock confirmation Component</p>'
})
class MockConformationComponent {}

describe('MediaCardComponent', () => {
  let component: MediaCardComponent;
  let fixture: ComponentFixture<MediaCardComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {
    message: 'Are you sure want to delete?',
    buttonText: {
      ok: 'Yes',
      cancel: 'No'
    }
  };

  const inputMediaItem: MediaItem = {
    mediaItemId: of(0),
    patientMediaItemId: 0,
    mediaType: 'image',
    localURL: 'SafeUrl',
    remoteURL: 'string',
    isPrimary: false,
    datetime: '2020-10-05T16:51:35',
    deleted: false,
    patientId: 1,
    heightPX: 300,
    widthPX: 300,
    tags: ['Tag 1', 'Tag 2'],
    uploadProgress$: of(0),
    updated: false
  };

  let dialog: MatDialogRef<MockConformationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
    ],
    providers: [
      {
        provide: MAT_DIALOG_DATA,
        useValue: dialogData },
      {
      provide: MatDialogRef,
      useValue: mockDialogRef
    }],
      declarations: [ MediaCardComponent, MockConformationComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {

    fixture = TestBed.createComponent(MediaCardComponent);
    component = fixture.componentInstance;

    component.mediaItem = inputMediaItem;
    component.tagNumber = 'A378';


    dialog = TestBed.get(MatDialog);


    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
