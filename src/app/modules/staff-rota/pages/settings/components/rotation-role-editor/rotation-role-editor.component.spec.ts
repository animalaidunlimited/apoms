/* tslint:disable:no-unused-variable */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';

import { RotationRoleEditorComponent } from './rotation-role-editor.component';

describe('RotationRoleEditorComponent', () => {
  let component: RotationRoleEditorComponent;
  let fixture: ComponentFixture<RotationRoleEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [     
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MaterialModule,
        BrowserAnimationsModule
    ],
      declarations: [ RotationRoleEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(RotationRoleEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
