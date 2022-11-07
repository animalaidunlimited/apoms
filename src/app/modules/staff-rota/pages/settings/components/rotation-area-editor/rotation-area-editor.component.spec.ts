/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RotationAreaEditorComponent } from './rotation-area-editor.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Overlay } from '@angular/cdk/overlay';
import { MaterialModule } from './../../../../../../material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RotationAreaEditorComponent', () => {
  let component: RotationAreaEditorComponent;
  let fixture: ComponentFixture<RotationAreaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ RotationAreaEditorComponent ],
      providers: [
        MatSnackBar,
        Overlay
      ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(RotationAreaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
