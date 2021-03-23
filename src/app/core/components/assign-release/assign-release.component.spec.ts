import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { AssignReleaseComponent } from './assign-release.component';

describe('AssignReleaseComponent', () => {
  let component: AssignReleaseComponent;
  let fixture: ComponentFixture<AssignReleaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      declarations: [ AssignReleaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(AssignReleaseComponent);
    component = fixture.componentInstance;

    component.formData = {
      releaseId: 100,
      emergencyCaseId:100,
      releaseType: '',
      Releaser1: 1,
      Releaser2: 1,
      releaseBeginDate: new Date(),
      releaseEndDate: new Date(),
      pickupDate: new Date()
    };

    fixture.detectChanges();

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
